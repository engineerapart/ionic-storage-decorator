import { Injectable, Injector, InjectionToken, INJECTOR } from '@angular/core';
import { Storage } from '@ionic/storage';
import isPlainObject from 'lodash.isplainobject';

@Injectable()
class StorageManager {
  private storage: Storage; // = new Storage(environment.storageConfig);

  static getInstance() {
    const injector = Injector.create({ providers: [], name: 'StorageManagerInjector' });
    const globalInjector = injector.get(INJECTOR);
    // this *should* use the global configure you already configured on the storage module.
    const instance = globalInjector.get(Storage);
  }

  constructor() {
    Injector.create();
  }

  clear() { return this.storage.clear(); }
  forEach(iterator: (value: any, key: string, index: number) => any) { return this.storage.forEach(iterator); }
  get(key: string) { return this.storage.get(key); }
  keys() { return this.storage.keys(); }
  length() { return this.storage.length(); }
  ready() { return this.storage.ready(); }
  remove(key: string) { return this.storage.remove(key); }
  set(key: string, value: any) { return this.storage.set(key, value); }

  import(data) {
    if (!this.isSerializable(data))  { return Promise.reject('Object is not serializable'); }
    const promises = [];
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        promises.push(this.storage.set(key, data[key]));
      }
    }
    return Promise.all(promises);
  }

  toJSON() {
    return new Promise((resolve, reject) => {
      const container = {};
      this.forEach((value, key) => {
        if (this.isSerializable(value)) {
          container[key] = value;
        }
      })
      .then(() => {
        resolve(container);
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  isSerializable(obj) {
    function isPlain(val) {
      return (val === undefined
        || val === null
        || typeof val === 'string'
        || typeof val === 'boolean'
        || typeof val === 'number'
        || Array.isArray(val)
        || isPlainObject(val));
    }
    if (!isPlain(obj)) {
      return false;
    }
    for (const property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (!isPlain(obj[property])) {
          return false;
        }
        if (typeof obj[property] === 'object') {
          const isNestedSerializable = this.isSerializable(obj[property]);
          if (!isNestedSerializable) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

export const IonicStorageManager = new StorageManager();
