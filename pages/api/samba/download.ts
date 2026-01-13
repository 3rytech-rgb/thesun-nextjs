import { NextApiRequest, NextApiResponse } from 'next';
import { storageManager } from '@/lib/storage';
import { validateSambaConfig } from '@/lib/samba-config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // For local storage, redirect to the actual file
    if (filePath.startsWith('/uploads/')) {
      return res.redirect(filePath);
    }

    // For Samba storage, we would need to implement streaming
    // This is a simplified implementation - in production you might want to stream directly
    if (validateSambaConfig()) {
      const exists = await storageManager.exists(filePath, 'samba');
      if (!exists) {
        return res.status(404).json({ error: 'File not found' });
      }

      // For now, return a placeholder response
      // In a real implementation, you'd stream the file from Samba
      return res.status(501).json({ 
        error: 'Samba file streaming not yet implemented',
        path: filePath
      });
    }

    return res.status(400).json({ error: 'Invalid file path or storage not configured' });
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Download failed' 
    });
  }
}