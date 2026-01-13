import { StorageAdapter, StorageFile, StorageDirectory, UploadResult } from '@/types/storage';
import { promises as fs } from 'fs';
import path from 'path';

export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;

  constructor(basePath: string = 'public/uploads') {
    this.basePath = path.resolve(basePath);
  }

  async upload(file: Buffer, filePath: string, filename: string): Promise<UploadResult> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const fullFilePath = path.join(fullPath, filename);
      
      // Ensure directory exists
      await fs.mkdir(fullPath, { recursive: true });
      
      // Write file
      await fs.writeFile(fullFilePath, file);
      
      return {
        success: true,
        path: path.join(filePath, filename).replace(/\\/g, '/')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async browse(dirPath: string): Promise<StorageDirectory> {
    try {
      const fullPath = path.join(this.basePath, dirPath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      const files: StorageFile[] = [];
      const directories: StorageDirectory[] = [];

      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);
        const stats = await fs.stat(entryPath);
        
        if (entry.isDirectory()) {
          const subDirectory = await this.browse(path.join(dirPath, entry.name));
          directories.push(subDirectory);
        } else {
          files.push({
            name: entry.name,
            path: path.join(dirPath, entry.name).replace(/\\/g, '/'),
            size: stats.size,
            type: entry.name.split('.').pop() || '',
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            isDirectory: false
          });
        }
      }

      return {
        name: path.basename(dirPath) || 'root',
        path: dirPath.replace(/\\/g, '/'),
        files,
        directories
      };
    } catch (error) {
      return {
        name: path.basename(dirPath) || 'root',
        path: dirPath.replace(/\\/g, '/'),
        files: [],
        directories: []
      };
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStats(filePath: string): Promise<StorageFile | null> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const stats = await fs.stat(fullPath);
      
      return {
        name: path.basename(filePath),
        path: filePath.replace(/\\/g, '/'),
        size: stats.size,
        type: filePath.split('.').pop() || '',
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch {
      return null;
    }
  }
}