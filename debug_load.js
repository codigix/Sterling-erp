const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        // Try to find a PDF file in the uploads directory
        const uploadDir = path.join(__dirname, 'backend/uploads/quotations');
        if (!fs.existsSync(uploadDir)) {
            console.log('Upload dir not found');
            return;
        }
        const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));
        if (files.length === 0) {
            console.log('No PDF files found in uploads');
            return;
        }

        const filePath = path.join(uploadDir, files[0]);
        const dataBuffer = fs.readFileSync(filePath);
        const uint8 = new Uint8Array(dataBuffer);

        console.log('Testing with file:', files[0]);
        const instance = new pdf.PDFParse({});
        
        console.log('Attempting load with data property (Uint8Array)...');
        try {
            await instance.load({ data: uint8 });
            const result = await instance.getText();
            console.log('Success! Text length:', result.text.length);
        } catch (e) {
            console.log('Load with data property failed:', e.message);
        }

        console.log('Attempting load with direct Uint8Array...');
        try {
            const instance2 = new pdf.PDFParse({});
            await instance2.load(uint8);
            const result2 = await instance2.getText();
            console.log('Success! Text length:', result2.text.length);
        } catch (e) {
            console.log('Load with direct Uint8Array failed:', e.message);
        }

    } catch (err) {
        console.error('Test error:', err);
    }
}

test().then(() => process.exit(0));
