export declare class Webstorable {
  save(): void;
}
export type WebstorableArray<T> = Webstorable & Array<T>;

export interface StorageDecoratorConfig {
  verbose?: boolean;
  emitValue?: boolean; // If the event emitter will display the value loaded in the console.
}

export interface StorageDecoratorModuleConfig {
  verbose: boolean;
}
