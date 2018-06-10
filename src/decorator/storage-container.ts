import { StorageManager } from './storage-manager';

export class StorageContainer {
  private key: string = null;

  constructor(key: string) {
    this.key = key;
    if (!StorageContainer.storage) {
      StorageContainer.storage = new Storage(environment.storageConfig);
    }
  }

  save(data: any) {
    StorageContainer.storage.set(this.key, data);
  }

  load() {
    return StorageContainer.storage.get(this.key)
      .then((storageData?: any) => {
        // Actually, we want the code flow to continue even if this value is not found
        return storageData; // if (!storageData) { return; }
      })
      .catch(() => {});
  }
}

