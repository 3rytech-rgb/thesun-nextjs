import { NextApiRequest, NextApiResponse } from 'next';
import { storageManager } from '@/lib/storage';
import { validateSambaConfig } from '@/lib/samba-config';

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

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path } = req.query;
    
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    const success = await storageManager.delete(path, 'samba');
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        path,
        storage: 'samba'
      });
    } else {
      return res.status(404).json({
        error: 'File not found or could not be deleted',
        path
      });
    }
  } catch (error) {
    console.error('Samba delete error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Delete failed' 
    });
  }
}