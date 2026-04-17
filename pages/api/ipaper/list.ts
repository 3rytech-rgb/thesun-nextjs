import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { PDFData } from '@/types/ipaper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { date } = req.query;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ipaper');
    
    let pdfs: PDFData[] = [];

    // Check if metadata file exists
    const metadataPath = path.join(uploadsDir, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      // Read from metadata file
      const metadata = await fs.promises.readFile(metadataPath, 'utf-8');
      pdfs = JSON.parse(metadata);
    } else {
      // Create sample data if no uploads yet
      pdfs = await generateSampleData();
    }

    // Filter by date if provided
    if (date && typeof date === 'string') {
      pdfs = pdfs.filter(pdf => pdf.date === date);
    }

    // Sort by date (newest first)
    pdfs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Find today's PDF
    const today = new Date().toISOString().split('T')[0];
    const todayPDF = pdfs.find(pdf => pdf.date === today) || pdfs[0];

    res.status(200).json({
      success: true,
      pdfs: pdfs,
      todayPDF: todayPDF,
      total: pdfs.length
    });

  } catch (error) {
    console.error('List API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch PDFs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function generateSampleData(): Promise<PDFData[]> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ipaper');
  
  // Create directory if doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const samplePDFs: PDFData[] = [
    {
      id: 'pdf-2025-12-04',
      date: '2025-12-04',
      title: 'theSun Edition - December 4, 2025',
      fileUrl: '/uploads/ipaper/sample.pdf',
      pages: 24,
      size: '2.4 MB',
      uploaded: new Date().toISOString(),
      isToday: true
    },
    {
      id: 'pdf-2025-12-03',
      date: '2025-12-03',
      title: 'theSun Edition - December 3, 2025',
      fileUrl: '/uploads/ipaper/sample.pdf',
      pages: 24,
      size: '2.3 MB',
      uploaded: new Date().toISOString(),
    },
    {
      id: 'pdf-2025-12-02',
      date: '2025-12-02',
      title: 'theSun Edition - December 2, 2025',
      fileUrl: '/uploads/ipaper/sample.pdf',
      pages: 24,
      size: '2.5 MB',
      uploaded: new Date().toISOString(),
    },
  ];

  // Save sample metadata
  const metadataPath = path.join(uploadsDir, 'metadata.json');
  await fs.promises.writeFile(metadataPath, JSON.stringify(samplePDFs, null, 2));

  return samplePDFs;
}