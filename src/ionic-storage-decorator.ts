import { NgModule, ModuleWithProviders, Injector } from '@angular/core';
import { EventService } from './services/events.service';
import { StorageDecoratorModuleConfig } from './ionic-storage-decorator.types';

export { EventService } from './services/events.service';

// Ok, I really need to leave this for now.
// for publishing
// https://github.com/robisim74/angular-library-starter#7
// https://www.npmjs.com/package/ionic-storage-decorator
// https://github.com/zoomsphere/ngx-store/blob/master/src/ngx-store.ts
// https://github.com/ionic-team/ionic-storage/blob/master/src/index.ts

// Reference material:
// https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/core/src/public_api.ts
// https://github.com/ngx-translate/core/blob/master/projects/ngx-translate/core/src/lib/translate.service.ts
// https://github.com/angular/angular/blob/919f42fea1df4b9e38b7d688aef5f2de668e9d3e/packages/core/src/di/injectable.ts
// https://github.com/angular/angular/blob/e3759f7a7361991e2e3fd4de67ab139babd7c166/packages/core/src/di/injector.ts

@NgModule({
  declarations: [],
  providers: [
    EventService,
  ]
})
// Consider registering providers using a forRoot() method
// when the module exports components, directives or pipes that require sharing the same providers instances.
// Consider registering providers also using a forChild() method
// when they requires new providers instances or different providers in child modules.
export class IonicStorageDecoratorModule {

  /**
   * Use in AppModule: new instance of SumService.
   */
  public static forRoot(config: StorageDecoratorModuleConfig): ModuleWithProviders {
    return {
      ngModule: IonicStorageDecoratorModule,
      providers: [EventService]
    };
  }

}

