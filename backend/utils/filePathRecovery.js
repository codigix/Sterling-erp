const fs = require('fs');
const path = require('path');

function findFileByName(filename, searchDir) {
  try {
    if (!fs.existsSync(searchDir)) {
      console.error('[filePathRecovery] Search directory does not exist:', searchDir);
      return null;
    }

    const files = fs.readdirSync(searchDir);
    
    const basename = path.basename(filename);
    const basenameWithoutExt = path.basename(filename, path.extname(filename));
    const extension = path.extname(filename);
    
    // Strategy 1: Exact filename match
    for (const file of files) {
      if (file === filename) {
        return path.join(searchDir, file);
      }
    }
    
    // Strategy 2: Match files ending with the original filename (for Multer renamed files)
    for (const file of files) {
      if (file.endsWith(filename)) {
        return path.join(searchDir, file);
      }
    }
    
    // Strategy 3: Match files where the stored basename matches the beginning of actual file
    // and has same extension (handles Multer-renamed files: IMG-20260221-WA0010 (1).jpg -> IMG-20260221-WA0010_1__hash.jpg)
    for (const file of files) {
      const fileBasename = path.basename(file, path.extname(file));
      const fileExt = path.extname(file);
      
      if (fileExt === extension) {
        // Remove parentheses and spaces from both, then check if file starts with the pattern
        const cleanStoredBasename = basenameWithoutExt.replace(/[\s()]/g, '');
        const cleanFileBasename = fileBasename.replace(/[\s()]/g, '');
        
        if (cleanFileBasename.startsWith(cleanStoredBasename)) {
          console.log(`[filePathRecovery] Found fuzzy match: ${filename} -> ${file}`);
          return path.join(searchDir, file);
        }
        
        // Alternative: Try replacing () with _ in the stored name
        const storedWithUnderscores = basenameWithoutExt.replace(/\s*\(\s*/g, '_').replace(/\s*\)\s*/g, '_').replace(/_+/g, '_');
        const cleanStoredAlternative = storedWithUnderscores.replace(/[\s()]/g, '');
        
        if (cleanFileBasename.startsWith(cleanStoredAlternative)) {
          console.log(`[filePathRecovery] Found match (parentheses converted): ${filename} -> ${file}`);
          return path.join(searchDir, file);
        }
      }
    }
    
    // Strategy 4: Exact basename match (ignoring spaces and parens) with same extension
    for (const file of files) {
      const fileBasename = path.basename(file, path.extname(file));
      const fileExt = path.extname(file);
      
      const cleanStoredBasename = basenameWithoutExt.replace(/[\s()]/g, '');
      const cleanFileBasename = fileBasename.split('_')[0] + (basenameWithoutExt.includes('(') ? basenameWithoutExt.match(/\([^)]*\)/)?.[0] || '' : '').replace(/[\s()]/g, '');
      
      if (fileExt === extension && fileBasename.includes(cleanStoredBasename.split('_')[0])) {
        console.log(`[filePathRecovery] Found partial match: ${filename} -> ${file}`);
        return path.join(searchDir, file);
      }
    }
    
    // Strategy 5: Partial filename match (fallback)
    for (const file of files) {
      if (file.includes(basenameWithoutExt.replace(/[\s()]/g, ''))) {
        return path.join(searchDir, file);
      }
    }

    console.error(`[filePathRecovery] Could not find file matching: ${filename} in ${searchDir}`);
    return null;
  } catch (err) {
    console.error('[filePathRecovery] Error searching for file:', err.message);
    return null;
  }
}

function reconstructPathForDocument(doc, documentType = 'design-engineering') {
  if (doc.path) {
    return doc.path;
  }

  if (!doc.name && !doc.filename && !doc.file_name) {
    return null;
  }

  const uploadDir = path.join(__dirname, `../uploads/${documentType}`);
  const filename = doc.name || doc.filename || doc.file_name;
  
  const foundPath = findFileByName(filename, uploadDir);
  
  if (foundPath) {
    const relativePath = path.relative(path.join(__dirname, '../'), foundPath)
      .replace(/\\/g, '/');
    return relativePath;
  }

  return null;
}

function enrichDocumentWithPath(doc, documentType = 'design-engineering') {
  console.log(`[enrichDocumentWithPath] Processing doc: ${doc.name || doc.fileName}, Has path: ${!!doc.path}, Has filePath: ${!!doc.filePath}`);
  
  if (doc.path) {
    console.log(`[enrichDocumentWithPath] ✓ Doc already has path: ${doc.path}`);
    return doc;
  }

  console.log(`[enrichDocumentWithPath] No path found, attempting recovery for: ${doc.name}`);

  // Try to use filePath from older schema
  if (doc.filePath && !doc.path) {
    // If filePath exists and looks like a full path, use it
    if (doc.filePath.includes('/') || doc.filePath.includes('\\')) {
      // Ensure it has the uploads prefix
      let normalizedPath = doc.filePath.replace(/\\/g, '/');
      if (!normalizedPath.startsWith('uploads/')) {
        normalizedPath = `uploads/${normalizedPath}`;
      }
      console.log(`[enrichDocumentWithPath] ✓ Using filePath: ${normalizedPath}`);
      return {
        ...doc,
        path: normalizedPath
      };
    }
    // If filePath is just a filename, try to recover full path
    doc.name = doc.name || doc.fileName || doc.file_name;
  }

  // Normalize field names for recovery process
  if (!doc.name && doc.fileName) {
    doc.name = doc.fileName;
  }

  const recoveredPath = reconstructPathForDocument(doc, documentType);
  
  if (recoveredPath) {
    console.log(`[enrichDocumentWithPath] ✓ Recovered path via filesystem search: ${recoveredPath}`);
    return {
      ...doc,
      path: recoveredPath
    };
  }

  // If recovery failed but we have filePath, include it anyway with full path prefix
  if (doc.filePath && !doc.path && !doc.filePath.includes('/')) {
    console.log(`[enrichDocumentWithPath] ⚠ Using constructed path from filePath: uploads/${documentType}/${doc.filePath}`);
    return {
      ...doc,
      path: `uploads/${documentType}/${doc.filePath}`
    };
  }

  console.log(`[enrichDocumentWithPath] ✗ Could not find or recover path for: ${doc.name}`);
  return doc;
}

module.exports = {
  findFileByName,
  reconstructPathForDocument,
  enrichDocumentWithPath
};
