import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { storageManager } from '@/lib/storage';
import { validateSambaConfig } from '@/lib/samba-config';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if Samba is configured
  if (!validateSambaConfig()) {
    return res.status(500).json({ 
      error: 'Samba is not configured. Please check your environment variables.' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: function ({ mimetype }) {
        // Only allow PDF files
        return mimetype === 'application/pdf';
      },
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get path from form data or use default
    const uploadPath = Array.isArray(fields.path) ? fields.path[0] : fields.path || 'ipaper';
    
    // Read file buffer
    const fs = require('fs').promises;
    const fileBuffer = await fs.readFile(file.filepath);

    // Create date-based directory structure
    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const fullPath = `${uploadPath}/${datePath}`;

    // Upload to Samba storage
    const result = await storageManager.upload(
      fileBuffer,
      fullPath,
      file.originalFilename || 'upload.pdf',
      'samba'
    );

    if (result.success) {
      // Clean up temporary file
      await fs.unlink(file.filepath);
      
      return res.status(200).json({
        success: true,
        filename: file.originalFilename,
        path: result.path,
        size: file.size,
        storage: 'samba'
      });
    } else {
      return res.status(500).json({
        error: result.error || 'Upload failed'
      });
    }
  } catch (error) {
    console.error('Samba upload error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
}