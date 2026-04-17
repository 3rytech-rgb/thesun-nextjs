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
    console.log('🧪 Testing Samba Integration...');

    const results = {
      configuration: {
        sambaConfigured: validateSambaConfig(),
        availableStorageTypes: storageManager.getAvailableTypes()
      },
      tests: {
        localStorage: { success: false, message: 'Not tested' },
        sambaStorage: { success: false, message: 'Not tested' }
      }
    };

    // Test local storage
    try {
      const testFile = Buffer.from('test file content');
      const localResult = await storageManager.upload(testFile, 'test', 'test.txt', 'local');
      
      if (localResult.success) {
        const exists = await storageManager.exists(localResult.path!, 'local');
        
        if (exists) {
          await storageManager.delete(localResult.path!, 'local');
          results.tests.localStorage = { success: true, message: 'Upload, exists, and delete successful' };
        } else {
          results.tests.localStorage = { success: false, message: 'File upload successful but file not found' };
        }
      } else {
        results.tests.localStorage = { success: false, message: localResult.error || 'Upload failed' };
      }
    } catch (error) {
      results.tests.localStorage = { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test Samba storage (if configured)
    if (validateSambaConfig()) {
      try {
        const testFile = Buffer.from('test file content for samba');
        const sambaResult = await storageManager.upload(testFile, 'test', 'samba-test.txt', 'samba');
        
        if (sambaResult.success) {
          const exists = await storageManager.exists(sambaResult.path!, 'samba');
          
          if (exists) {
            await storageManager.delete(sambaResult.path!, 'samba');
            results.tests.sambaStorage = { success: true, message: 'Samba upload, exists, and delete successful' };
          } else {
            results.tests.sambaStorage = { success: false, message: 'Samba upload successful but file not found' };
          }
        } else {
          results.tests.sambaStorage = { success: false, message: sambaResult.error || 'Samba upload failed' };
        }
      } catch (error) {
        results.tests.sambaStorage = { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
      }
    } else {
      results.tests.sambaStorage = { success: false, message: 'Samba not configured' };
    }

    return res.status(200).json({
      success: true,
      message: 'Samba integration test completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Samba test error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Test failed' 
    });
  }
}