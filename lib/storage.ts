import { StorageAdapter, StorageType } from '@/types/storage';
import { LocalStorageAdapter } from './adapters/local-storage';
import { SambaStorageAdapter } from './adapters/samba-storage';
import { validateSambaConfig } from '@/lib/samba-config';

export class StorageManager {
  private adapters: Map<StorageType, StorageAdapter>;

  constructor() {
    this.adapters = new Map();
    
    // Always register local adapter
    this.adapters.set('local', new LocalStorageAdapter());
    
    // Register samba adapter if config is valid
    if (validateSambaConfig()) {
      this.adapters.set('samba', new SambaStorageAdapter());
    }
  }

  getAdapter(type: StorageType): StorageAdapter {
    const adapter = this.adapters.get(type);
    if (!adapter) {
      throw new Error(`Storage adapter for type '${type}' is not available`);
    }
    return adapter;
  }

  getAvailableTypes(): StorageType[] {
    return Array.from(this.adapters.keys());
  }

  async upload(
    file: Buffer,
    path: string,
    filename: string,
    storageType: StorageType = 'local'
  ) {
    const adapter = this.getAdapter(storageType);
    return adapter.upload(file, path, filename);
  }

  async delete(path: string, storageType: StorageType = 'local') {
    const adapter = this.getAdapter(storageType);
    return adapter.delete(path);
  }

  async browse(path: string, storageType: StorageType = 'local') {
    const adapter = this.getAdapter(storageType);
    return adapter.browse(path);
  }

  async exists(path: string, storageType: StorageType = 'local') {
    const adapter = this.getAdapter(storageType);
    return adapter.exists(path);
  }

  async getFileStats(path: string, storageType: StorageType = 'local') {
    const adapter = this.getAdapter(storageType);
    return adapter.getFileStats(path);
  }
}

export const storageManager = new StorageManager();