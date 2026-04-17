import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { PDFData } from '@/types/ipaper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id, date } = req.body;

    if (!id || !date) {
      return res.status(400).json({ success: false, message: 'Missing PDF ID or date' });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ipaper');
    const metadataPath = path.join(uploadsDir, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ success: false, message: 'No PDFs found' });
    }

    // Read metadata
    const metadata = await fs.promises.readFile(metadataPath, 'utf-8');
    let pdfs: PDFData[] = JSON.parse(metadata);

    // Find PDF to delete
    const pdfToDelete = pdfs.find(pdf => pdf.id === id && pdf.date === date);
    
    if (!pdfToDelete) {
      return res.status(404).json({ success: false, message: 'PDF not found' });
    }

    // Delete physical file
    const filePath = path.join(process.cwd(), 'public', pdfToDelete.fileUrl);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log('Deleted file:', filePath);
    }

    // Remove from metadata
    pdfs = pdfs.filter(pdf => !(pdf.id === id && pdf.date === date));

    // Save updated metadata
    await fs.promises.writeFile(metadataPath, JSON.stringify(pdfs, null, 2));

    console.log('PDF deleted successfully:', { id, date });

    res.status(200).json({
      success: true,
      message: 'PDF deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Delete failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}