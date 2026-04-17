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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path = '' } = req.query;
    
    if (typeof path !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    const directory = await storageManager.browse(path, 'samba');
    
    return res.status(200).json({
      success: true,
      directory,
      storage: 'samba'
    });
  } catch (error) {
    console.error('Samba browse error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Browse failed' 
    });
  }
}