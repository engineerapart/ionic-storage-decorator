import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

// We use a ReplaySubject instead of a Subject or BehaviorSubject because we want to ensure 2 things:
// 1. That new subscribers receive any current values
// 2. That if the subject has never been invoked, no value is passed when a subscriber is wired up.
// Subject does not provide replay behavior (providing the current value), and BehaviorSubject
// requires an initial value, which may not be appropriate to the event.
// Therefore ReplaySubject, with a 1-element window, is the correct choice.

let serviceInstance = null;

@Injectable()
export class EventService {
  private subjects: ReplaySubject<any>[] = [];

  debugEnabled: boolean = !environment.production;

  constructor(public zone?: NgZone) {
    // Force this class to be a singleton, since it is instantiated outside the angular DI loop
    // by the IonicStorage decorator.
    if (serviceInstance) {
      if (zone && !serviceInstance.zone) {
        serviceInstance.zone = zone;
      }
      return serviceInstance;
    }
    serviceInstance = this;
  }

  publish(eventName: string, data?: any) {
    // ensure a subject for the event name exists
    this.subjects[eventName] = this.subjects[eventName] || new ReplaySubject<any>(1);

    this.debugEnabled && console.log(`Event '${eventName}' published`);

    // publish event
    this.zone.run(() => {
      this.subjects[eventName].next(data);
    });
  }

  on(eventName: string): Observable<any> {
    // ensure a subject for the event name exists
    this.subjects[eventName] = this.subjects[eventName] || new ReplaySubject<any>(1);

    // return observable
    return this.subjects[eventName].asObservable();
  }

  reset(eventName: string) {
    const currentSubject = this.subjects[eventName] as ReplaySubject<any>;
    if (!currentSubject) { return; }

    const currentObservers = currentSubject.observers;
    this.subjects[eventName] = new ReplaySubject<any>(1);
    (this.subjects[eventName] as ReplaySubject<any>).observers.push(...currentObservers);
  }
}
