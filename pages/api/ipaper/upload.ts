import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { IncomingForm, Files, Fields } from 'formidable';
import { PDFData } from '@/types/ipaper';
import { storageManager } from '@/lib/storage';
import { StorageType } from '@/types/storage';
import { validateSambaConfig } from '@/lib/samba-config';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Helper function to get string value from formidable field
const getStringValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
};

// Function to check PDF signature
const isPDFFile = async (filePath: string): Promise<boolean> => {
  try {
    const fd = await fs.promises.open(filePath, 'r');
    const buffer = Buffer.alloc(5);
    await fd.read(buffer, 0, 5, 0);
    await fd.close();
    
    // PDF signature: %PDF-
    const signature = buffer.toString();
    return signature === '%PDF-';
  } catch {
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Parse form data
    const { fields, files } = await parseForm(req);
    
    // Get form data with type safety
    const date = getStringValue(fields.date) || new Date().toISOString().split('T')[0];
    const title = getStringValue(fields.title) || `theSun Edition - ${date}`;
    const storageType = (getStringValue(fields.storage) || 'local') as StorageType;
    const pdfFile = files.pdf as any;

    if (!pdfFile) {
      return res.status(400).json({ success: false, message: 'No PDF file provided' });
    }

    // Validate storage type
    if (storageType === 'samba' && !validateSambaConfig()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Samba storage is not configured. Please check environment variables.' 
      });
    }

    const availableStorageTypes = storageManager.getAvailableTypes();
    if (!availableStorageTypes.includes(storageType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Storage type '${storageType}' is not available. Available types: ${availableStorageTypes.join(', ')}` 
      });
    }

    // Debug info
    console.log('Uploaded file info:', {
      mimetype: pdfFile.mimetype,
      originalFilename: pdfFile.originalFilename,
      size: pdfFile.size,
      filepath: pdfFile.filepath
    });

    // Validasi file dengan multiple checks
    const fileName = pdfFile.originalFilename || '';
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const allowedMimeTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf'
    ];

    // Check 1: Extension
    const hasPdfExtension = fileExtension === 'pdf';
    
    // Check 2: MIME type
    const hasValidMimeType = pdfFile.mimetype && allowedMimeTypes.includes(pdfFile.mimetype);
    
    // Check 3: File signature (magic bytes)
    const hasPdfSignature = await isPDFFile(pdfFile.filepath);

    if (!hasPdfExtension && !hasValidMimeType && !hasPdfSignature) {
      return res.status(400).json({ 
        success: false, 
        message: 'File must be a valid PDF',
        details: {
          mimetype: pdfFile.mimetype,
          extension: fileExtension,
          signatureValid: hasPdfSignature
        }
      });
    }

    // Validate file size (max 50MB)
    if (pdfFile.size > 50 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size must be less than 50MB' });
    }

    // Parse date and create directory structure
    let year = new Date().getFullYear().toString();
    let month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        year = dateObj.getFullYear().toString();
        month = String(dateObj.getMonth() + 1).padStart(2, '0');
      }
    } catch (error) {
      console.warn('Invalid date format, using current date');
    }

    // Create directory path and unique filename
    const dirPath = `ipaper/${year}/${month}`;
    const originalName = pdfFile.originalFilename || `thesun-${date}.pdf`;
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileNameFinal = `thesun-${date}-${Date.now()}-${safeName}`;

    // Read file buffer
    const fileBuffer = await fs.promises.readFile(pdfFile.filepath);

    // Upload using storage manager
    const uploadResult = await storageManager.upload(fileBuffer, dirPath, fileNameFinal, storageType);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: `Upload failed: ${uploadResult.error}`,
      });
    }

    // Calculate file size
    const fileSize = (pdfFile.size / (1024 * 1024)).toFixed(2); // MB

    // Create file URL based on storage type
    let fileUrl: string;
    if (storageType === 'local') {
      // For local storage, create relative URL from public directory
      const publicPath = path.join(process.cwd(), 'public');
      const fullPath = path.join(publicPath, uploadResult.path!);
      const relativePath = fullPath.replace(publicPath, '');
      fileUrl = relativePath.replace(/\\/g, '/');
    } else {
      // For Samba storage, use the path as is (you might want to add a download endpoint)
      fileUrl = `/api/samba/download?path=${encodeURIComponent(uploadResult.path!)}`;
    }

    // Create PDF metadata
    const pdfData: PDFData = {
      id: `pdf-${date}-${Date.now()}`,
      date: date,
      title: title,
      fileUrl: fileUrl,
      pages: 24, // Default, bisa extract dari PDF nanti
      size: `${fileSize} MB`,
      uploaded: new Date().toISOString(),
      storage: storageType, // Add storage type to metadata
      path: uploadResult.path, // Add storage path to metadata
    };

    // Save metadata to JSON file (simulate database) - always use local for metadata
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ipaper');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const metadataPath = path.join(uploadsDir, 'metadata.json');
    let metadata: PDFData[] = [];
    
    if (fs.existsSync(metadataPath)) {
      const existingData = await fs.promises.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(existingData);
    }

    // Remove existing PDF dengan date yang sama (update)
    metadata = metadata.filter(pdf => pdf.date !== date);
    
    // Add new PDF
    metadata.unshift(pdfData);
    
    // Save updated metadata
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('PDF uploaded successfully:', {
      fileName: fileNameFinal,
      path: uploadResult.path,
      fileUrl,
      size: pdfData.size,
      storage: storageType,
      validation: {
        extension: hasPdfExtension,
        mimeType: hasValidMimeType,
        signature: hasPdfSignature
      }
    });

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      pdf: pdfData,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}