const Quotation = require('../../models/Quotation');
const Vendor = require('../../models/Vendor');
const emailService = require('../../services/emailService');
const QuotationCommunication = require('../../models/QuotationCommunication');
const RootCardInventoryTask = require('../../models/RootCardInventoryTask');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createCustomStorage } = require('../../utils/multerStorage');
const pdfParser = require('pdf-parse');
const Tesseract = require('tesseract.js');

// The function is exported as PDFParse in version 2.4.5
const parsePdf = async (buffer) => {
  try {
    // Convert Buffer to Uint8Array as required by newer pdf-parse versions
    const uint8Array = new Uint8Array(buffer);
    
    if (typeof pdfParser.PDFParse === 'function') {
      try {
        // Try as a class constructor (v2.4.5+)
        const parser = new pdfParser.PDFParse(uint8Array);
        return await parser.getText();
      } catch (err) {
        if (err.message.includes("is not a constructor")) {
          // Fallback to function call
          return await pdfParser.PDFParse(uint8Array);
        }
        throw err;
      }
    } else if (typeof pdfParser === 'function') {
      return await pdfParser(uint8Array);
    } else if (pdfParser && typeof pdfParser.default === 'function') {
      return await pdfParser.default(uint8Array);
    } else {
      throw new Error('Could not find PDFParse function in pdf-parse module');
    }
  } catch (error) {
    console.error('Error in parsePdf wrapper:', error);
    throw error;
  }
};

// Configure memory storage for temporary analysis
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('file');

// Keep original storage for permanent uploads if needed elsewhere
const uploadDir = path.join(__dirname, '../../uploads/quotations');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = createCustomStorage(uploadDir);
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('file');

exports.uploadQuotationFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      message: 'File uploaded successfully', 
      filePath: `uploads/quotations/${req.file.filename}`,
      fileName: req.file.originalname 
    });
  });
};

exports.analyzeQuotation = async (req, res) => {
  // Wrap memoryUpload in a promise to handle it correctly in an async function
  const uploadPromise = new Promise((resolve, reject) => {
    memoryUpload(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  try {
    await uploadPromise;

    const items = JSON.parse(req.body.items || '[]');
    const file = req.file;
    
    if (!file || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'File and items are required' });
    }

    console.log(`📄 Analyzing file: ${file.originalname}, Size: ${file.size}, Items: ${items.length}`);

    let extractedText = "";
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === '.pdf') {
      try {
        const data = await parsePdf(file.buffer);
        // Ensure we get a string from the result
        extractedText = typeof data === 'string' ? data : (data.text || "");
        
        // If extractedText is still an object (some versions return {text: {text: ""}})
        if (typeof extractedText === 'object' && extractedText.text) {
          extractedText = extractedText.text;
        }
        
        console.log('✅ Successfully extracted PDF text, type:', typeof extractedText, 'length:', extractedText.length);
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(500).json({ message: `Failed to parse PDF: ${pdfError.message}` });
      }
    } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      try {
        console.log(`📷 Starting OCR for image: ${file.originalname}`);
        const { data: { text } } = await Tesseract.recognize(
          file.buffer,
          'eng',
          { logger: m => console.log(m.status, (m.progress * 100).toFixed(2) + '%') }
        );
        extractedText = text;
        console.log('✅ Successfully extracted Image text, length:', extractedText.length);
      } catch (ocrError) {
        console.error('OCR error:', ocrError);
        return res.status(500).json({ message: `Failed to analyze image: ${ocrError.message}` });
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Please use PDF or Image (JPG, PNG).' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract any text from the document.' });
    }

    // Helper to find price for an item code in the text
    const findPriceInText = (item, text) => {
      if (!text || !item) return null;
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      const cleanItemCode = item.item_code ? item.item_code.trim().toLowerCase() : '';
      const itemDesc = item.description ? item.description.trim().toLowerCase() : '';
      const targetQty = parseFloat(item.quantity) || 0;
      
      const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normCode = cleanItemCode ? normalize(cleanItemCode) : '';
      const normDesc = itemDesc ? normalize(itemDesc) : '';
      
      console.log(`🔍 Searching for: ${cleanItemCode || 'NO_CODE'} | ${itemDesc} | Qty: ${targetQty}`);
      
      const matches = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const normLine = normalize(line);
        
        let isMatch = false;
        if (normCode && normLine.includes(normCode)) isMatch = true;
        else if (normDesc && normLine.includes(normDesc)) isMatch = true;
        else if (normDesc && normDesc.length > 15 && normLine.includes(normDesc.substring(0, 15))) isMatch = true;
        
        if (isMatch) {
          // Narrow context: Prefer current line, maybe look at next line if it's very short (table wrap)
          let context = line;
          if (i + 1 < lines.length && lines[i+1].length < 30) {
            context += " " + lines[i+1];
          }
          
          let cleanContext = context;
          const toRemove = [];
          if (cleanItemCode) toRemove.push(cleanItemCode);
          if (itemDesc) toRemove.push(itemDesc);
          
          [cleanItemCode, itemDesc].forEach(s => {
            if (s) {
              s.split(/[^a-z0-9]/i).forEach(word => {
                if (word.length >= 3 && isNaN(word)) toRemove.push(word);
              });
            }
          });
          
          toRemove.sort((a, b) => b.length - a.length);
          toRemove.forEach(r => {
            if (r && r.length >= 2) {
              const escaped = r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              cleanContext = cleanContext.replace(new RegExp(escaped, 'gi'), ' ');
            }
          });
          
          cleanContext = cleanContext.replace(/[₹$€£,×x*|:]/g, ' ').replace(/\s+/g, ' ');
          const numbers = cleanContext.match(/\d+(?:\.\d+)?/g) || [];
          const floats = numbers.map(n => parseFloat(n)).filter(n => n > 0);
          
          if (floats.length >= 1) {
            // Check if this line actually contains our target quantity
            const qIdx = floats.findIndex(f => Math.abs(f - targetQty) < 0.05 || (targetQty > 0 && Math.abs(f - targetQty) / targetQty < 0.02));
            
            if (qIdx !== -1) {
              // Priority 1: Qty * Price = Total on same line
              for (let k = 0; k < floats.length; k++) {
                if (k === qIdx) continue;
                const price = floats[k];
                for (let l = 0; l < floats.length; l++) {
                  if (l === qIdx || l === k) continue;
                  const total = floats[l];
                  if (Math.abs(price * targetQty - total) < Math.max(2, total * 0.02)) {
                    return price;
                  }
                }
              }
              
              // Priority 2: Number after quantity is usually price
              if (qIdx + 1 < floats.length) {
                matches.push({ price: floats[qIdx + 1], score: 2 });
              }
              // Priority 3: Any other number on the line
              else if (floats.length > 1) {
                const otherPrice = floats.find((_, idx) => idx !== qIdx);
                matches.push({ price: otherPrice, score: 1 });
              }
            }
          }
        }
      }
      
      if (matches.length > 0) {
        matches.sort((a, b) => b.score - a.score);
        return matches[0].price;
      }
      
      return null;
    };

    const analyzedItems = items.map(item => {
      const extractedPrice = findPriceInText(item, extractedText);
      return {
        ...item,
        unit_price: extractedPrice !== null ? extractedPrice : 0
      };
    });

    const total_amount = analyzedItems.reduce((sum, item) => sum + (parseFloat(item.quantity) * (parseFloat(item.unit_price) || 0)), 0);

    res.json({
      message: 'Analysis completed successfully',
      items: analyzedItems,
      total_amount: total_amount
    });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    console.error('Quotation analysis error:', error);
    res.status(500).json({ message: 'Analysis failed', error: error.message });
  }
};

exports.getAllQuotations = async (req, res) => {
  try {
    const { search, vendor_id, status, type, material_request_id, sales_order_id } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (vendor_id) filters.vendor_id = vendor_id;
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (material_request_id) filters.material_request_id = material_request_id;
    if (sales_order_id) filters.sales_order_id = sales_order_id;

    const quotations = await Quotation.findAll(filters);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Error fetching quotations' });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.items && typeof quotation.items === 'string') {
      quotation.items = JSON.parse(quotation.items);
    }
    
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: 'Error fetching quotation' });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    const { vendor_id, total_amount, valid_until, items, notes, status, type, reference_id, sales_order_id, root_card_id, material_request_id, document_path } = req.body;
    
    if (!vendor_id) {
      return res.status(400).json({ message: 'Vendor is required' });
    }

    const vendor = await Vendor.findById(vendor_id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    const quotationId = await Quotation.create({
      vendor_id,
      total_amount: total_amount || 0,
      valid_until,
      items: items || [],
      notes,
      status: status || 'pending',
      type: type || 'outbound',
      reference_id: reference_id || null,
      sales_order_id: sales_order_id || root_card_id || null,
      material_request_id: material_request_id || null,
      document_path: document_path || null
    });
    
    // If this is an inbound response to an outbound RFQ, update the original RFQ status
    if (type === 'inbound' && reference_id) {
      try {
        await Quotation.changeStatus(reference_id, 'responded');
      } catch (e) {
        console.error('Error updating original RFQ status:', e);
      }
    }
    
    const newQuotation = await Quotation.findById(quotationId);
    if (newQuotation && newQuotation.items && typeof newQuotation.items === 'string') {
      newQuotation.items = JSON.parse(newQuotation.items);
    }
    res.status(201).json(newQuotation);
  } catch (error) {
    console.error('Error creating quotation:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating quotation', error: error.message });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.update(id, req.body);
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Error updating quotation' });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.delete(id);
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ message: 'Error deleting quotation' });
  }
};

exports.approveQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.changeStatus(id, 'approved');
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ message: 'Error approving quotation' });
  }
};

exports.rejectQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.changeStatus(id, 'rejected');
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    res.status(500).json({ message: 'Error rejecting quotation' });
  }
};

exports.updateQuotationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    await Quotation.changeStatus(id, status);
    const updatedQuotation = await Quotation.findById(id);
    if (updatedQuotation && updatedQuotation.items && typeof updatedQuotation.items === 'string') {
      updatedQuotation.items = JSON.parse(updatedQuotation.items);
    }
    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation status:', error);
    res.status(500).json({ message: 'Error updating quotation status', error: error.message });
  }
};

exports.getQuotationStats = async (req, res) => {
  try {
    const stats = await Quotation.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching quotation stats:', error);
    res.status(500).json({ message: 'Error fetching quotation stats' });
  }
};

exports.getVendorQuotations = async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { status } = req.query;
    
    const filters = {};
    if (status) filters.status = status;

    const quotations = await Quotation.getByVendor(vendor_id, filters);
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching vendor quotations:', error);
    res.status(500).json({ message: 'Error fetching vendor quotations' });
  }
};

exports.getQuotationsByRootCard = async (req, res) => {
  try {
    const { rootCardId } = req.params;
    
    const quotations = await Quotation.findAll({ 
      type: 'outbound',
      sales_order_id: rootCardId
    });
    
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching root card quotations:', error);
    res.status(500).json({ message: 'Error fetching root card quotations' });
  }
};

exports.getQuotationsByMaterialRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quotations = await Quotation.findAll({ 
      material_request_id: id
    });
    
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching material request quotations:', error);
    res.status(500).json({ message: 'Error fetching material request quotations' });
  }
};

exports.sendQuotationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, pdfBase64, subject, message } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ message: 'Email and PDF are required' });
    }

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const result = await emailService.sendMail({
      to: email,
      subject: subject || `Quotation ${quotation.quotation_number}`,
      text: message || `Please find attached Quotation ${quotation.quotation_number}.`,
      attachments: [
        {
          filename: `${quotation.quotation_number}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    if (result.success) {
      try {
        const communicationId = await QuotationCommunication.create({
          quotation_id: id,
          sender_email: process.env.EMAIL_USER,
          subject: subject || `Quotation ${quotation.quotation_number}`,
          content_text: message || `Please find attached Quotation ${quotation.quotation_number}.`,
          content_html: null,
          message_id: result.messageId,
          has_attachments: true
        });

        const uploadDir = path.join(__dirname, '../../uploads/quotation_attachments');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${quotation.quotation_number}.pdf`;
        const uniqueFileName = `${Date.now()}-${fileName}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        
        fs.writeFileSync(filePath, pdfBuffer);
        
        await QuotationCommunication.addAttachment(communicationId, {
          fileName: fileName,
          filePath: `uploads/quotation_attachments/${uniqueFileName}`,
          fileSize: pdfBuffer.length,
          mimeType: 'application/pdf'
        });
        
        await QuotationCommunication.markAsRead(communicationId);
      } catch (dbError) {
        console.error('Error saving outgoing Quotation communication:', dbError);
      }
    }

    await Quotation.changeStatus(id, 'sent');

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Send quotation email error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};

exports.getQuotationResponses = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const responses = await Quotation.getResponses(id);
    res.json(responses || []);
  } catch (error) {
    console.error('Error fetching quotation responses:', error);
    res.status(500).json({ message: 'Error fetching quotation responses' });
  }
};

exports.getQuotationCommunications = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📞 Fetching communications for quotation ID: ${id}`);
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      console.warn(`⚠️ Invalid quotation ID provided: ${id}`);
      return res.status(400).json({ message: 'Invalid quotation ID' });
    }

    const communications = await QuotationCommunication.findByQuotationId(id);
    console.log(`💬 Found ${communications.length} communications for ID: ${id}`);
    
    // Add is_outgoing flag
    const processedComms = communications.map(comm => ({
      ...comm,
      is_outgoing: comm.sender_email === process.env.EMAIL_USER
    }));
    
    for (const comm of processedComms) {
      if (!comm.is_read && !comm.is_outgoing) {
        QuotationCommunication.markAsRead(comm.id).catch(err => console.error('Error marking read:', err));
      }
    }
    
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json(processedComms);
  } catch (error) {
    console.error('Get quotation communications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.markCommunicationsAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await QuotationCommunication.markAllAsReadForQuotation(id);
    res.json({ message: 'Communications marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.downloadQuotationAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await QuotationCommunication.getAttachmentById(id);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    
    const filePath = path.join(__dirname, '../../', attachment.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ file_path: attachment.file_path, message: 'File not found on server' });
    }
    
    res.download(filePath, attachment.file_name);
  } catch (error) {
    console.error('Download attachment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
