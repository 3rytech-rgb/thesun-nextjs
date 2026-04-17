// types/ipaper.ts

export interface PDFData {
  id: string;
  date: string;
  title: string;
  fileUrl: string;
  pages: number;
  size: string;
  uploaded: string;
  isToday?: boolean;
  storage?: 'local' | 'samba';
  path?: string;
}

export interface PageInfo {
  current: number;
  total: number;
}