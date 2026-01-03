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
}

export interface PageInfo {
  current: number;
  total: number;
}