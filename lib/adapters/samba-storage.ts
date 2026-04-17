import { StorageAdapter, StorageFile, StorageDirectory, UploadResult } from '@/types/storage';
import SMB2 from 'smb2';
import { sambaConfig } from '@/lib/samba-config';
import path from 'path';

export class SambaStorageAdapter implements StorageAdapter {
  private client: SMB2;
  private isConnected: boolean = false;

  constructor() {
    this.client = new SMB2({
      share: `\\\\${sambaConfig.server}\\${sambaConfig.share}`,
      domain: sambaConfig.domain,
      username: sambaConfig.username,
      password: sambaConfig.password,
      port: sambaConfig.port || 445
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      try {
        // Test connection by trying to list root directory
        await this.readdirAsync('/');
        this.isConnected = true;
      } catch (error) {
        throw new Error(`Failed to connect to Samba share: ${error}`);
      }
    }
  }

  private readdirAsync(path: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.client.readdir(path, (error, files) => {
        if (error) {
          reject(error);
        } else {
          resolve(files);
        }
      });
    });
  }

  private writeFileAsync(path: string, data: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.writeFile(path, data.toString('base64'), { encoding: 'base64' }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private mkdirAsync(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.mkdir(path, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private unlinkAsync(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.unlink(path, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private readFileAsync(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.client.readFile(path, { encoding: 'base64' }, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(Buffer.from(data, 'base64'));
        }
      });
    });
  }

  async upload(file: Buffer, filePath: string, filename: string): Promise<UploadResult> {
    try {
      await this.ensureConnection();
      
      const fullPath = this.normalizePath(filePath);
      const fullFilePath = this.normalizePath(path.join(filePath, filename));
      
      // Ensure directory exists
      try {
        await this.mkdirAsync(fullPath);
      } catch (error: any) {
        // Directory might already exist
        if (!error.message.includes('EEXIST')) {
          throw error;
        }
      }
      
      // Write file
      await this.writeFileAsync(fullFilePath, file);
      
      return {
        success: true,
        path: fullFilePath.replace(/^\\\\/, '').replace(/\\/g, '/')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Samba upload error'
      };
    }
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const normalizedPath = this.normalizePath(filePath);
      await this.unlinkAsync(normalizedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async browse(dirPath: string): Promise<StorageDirectory> {
    try {
      await this.ensureConnection();
      const normalizedPath = this.normalizePath(dirPath);
      const entries = await this.readdirAsync(normalizedPath);
      
      const files: StorageFile[] = [];
      const directories: StorageDirectory[] = [];

      for (const entry of entries as any[]) {
        const entryPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory) {
          const subDirectory = await this.browse(entryPath);
          directories.push(subDirectory);
        } else {
          files.push({
            name: entry.name,
            path: entryPath.replace(/\\/g, '/'),
            size: entry.size || 0,
            type: entry.name.split('.').pop() || '',
            createdAt: new Date(entry.createTime || Date.now()),
            modifiedAt: new Date(entry.lastWriteTime || Date.now()),
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
      await this.ensureConnection();
      const normalizedPath = this.normalizePath(filePath);
      await this.readFileAsync(normalizedPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStats(filePath: string): Promise<StorageFile | null> {
    try {
      await this.ensureConnection();
      const normalizedPath = this.normalizePath(filePath);
      
      // For SMB2, we'll try to read a small part to get basic info
      await this.readFileAsync(normalizedPath);
      
      return {
        name: path.basename(filePath),
        path: filePath.replace(/\\/g, '/'),
        size: 0, // SMB2 doesn't provide size info without more complex handling
        type: filePath.split('.').pop() || '',
        createdAt: new Date(),
        modifiedAt: new Date(),
        isDirectory: false
      };
    } catch {
      return null;
    }
  }

  private normalizePath(filePath: string): string {
    // Convert forward slashes to backslashes and remove leading slash
    return filePath.replace(/\//g, '\\').replace(/^\\/, '');
  }
}