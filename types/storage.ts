export interface StorageFile {
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: Date;
  modifiedAt: Date;
  isDirectory: boolean;
}

export interface StorageDirectory {
  name: string;
  path: string;
  files: StorageFile[];
  directories: StorageDirectory[];
}

export interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

export interface StorageAdapter {
  upload(file: Buffer, path: string, filename: string): Promise<UploadResult>;
  delete(path: string): Promise<boolean>;
  browse(path: string): Promise<StorageDirectory>;
  exists(path: string): Promise<boolean>;
  getFileStats(path: string): Promise<StorageFile | null>;
}

export type StorageType = 'local' | 'samba';