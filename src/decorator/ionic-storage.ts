import { Debugger } from 'ts-debug';
import { EventService } from '../services/events.service';
import { StorageDecoratorConfig } from 'ionic-storage-decorator.types';

const debug = new Debugger(console, !environment.production, '[IonicStorage] ');
const eventService: EventService = new EventService();

// The functionality in this file is based on ngx-store but heavily customized
// for mobile usage. An eventual 'TODO' is to bring the two in line and offer a
// PR back to ngx-store, adding the Ionic Storage functionality (or any async
// storage medium, really).

const arrayMethodsToOverwrite = [
  'pop', 'push', 'reverse', 'shift', 'unshift', 'splice',
  'filter', 'forEach', 'map', 'fill', 'sort', 'copyWithin'
];

const CacheEntries = new Map<string, boolean>();

export function IonicStorage(props: StorageDecoratorConfig = { verbose: false, emitValue: !environment.production }) {
  // Not using 'props' for now, but this way the decorator surface does not have to change.
  // It could be used to specify functions to override, etc.
  return function IonicStorageDecorator(target: any, propertyName: string): void {
    const key = `${propertyName}`; // ${target.constructor.name}_ not all constructors have names..
    let value = target[propertyName];
    const container = new StorageContainer(key);

    const getter = () => {
      if (props.verbose) { debug.log(`getter: ${target.constructor.name}.${key}: `, value); }
      return value;
    };

    const setter = (newVal: any) => {
      if (props.verbose) {
        debug.groupCollapsed(`IonicStorageDecorator#set for ${key} in ${target.constructor.name}`);
        debug.log('New value: ', newVal);
        debug.log('previous value: ', value);
        debug.log('currentTarget:', target);
        debug.groupEnd();
      }

      value = newVal;

      // Fix for older browsers in which bools and strings are not actually objects
      // Technically we can allow functions here too but those won't have anything
      // in them worth serializing..
      if (value && typeof value === 'object') {
        // add method for triggering force save
        const prototype: any = Object.assign(new value.constructor(), value.__proto__);
        prototype.save = () => { container.save(value); };

        if (Array.isArray(value)) { // handle methods that could change value of array
          for (const method of arrayMethodsToOverwrite) {
            prototype[method] = function () {
              // ngx-store reads the latest value here because it provides a 2-way store.
              // We instead assume that the cached 'value' is always the latest, and so these operations
              // only ever need to be write-only.
              const result = Array.prototype[method].apply(value, arguments);
              debug.log(`Saving value for ${key} by method ${prototype.constructor.name}.${method}`);
              container.save(value);
              return result;
            };
          }
        }

        Object.setPrototypeOf(value, prototype);
      }

      // This is the only line that is STRICTLY required. The rest of that stuff makes this
      // decorator way more useful..
      container.save(value);
    };

    Object.defineProperty(target, propertyName, {
      get: getter,
      set: setter,
    });

    container.load().then(val => {
      setter(val);

      // This is to ensure that the publish event only occurs once.
      // if (!CacheEntries.get(key)) {
        CacheEntries.set(key, true);
        // We use the PubSubService instead of a normal observable,
        // because that service ensures that these events cause a UI refresh using NgZone
        if (props.emitValue) {
          eventService.publish(`${key}:loaded`, val);
        } else {
          eventService.publish(`${key}:loaded`);
        }
      // }
    });
  };
}

