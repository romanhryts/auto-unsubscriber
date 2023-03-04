import {
  InjectableType,
  ɵComponentType as ComponentType,
  ɵDirectiveType as DirectiveType
} from '@angular/core';
import { Subscription } from 'rxjs';

const SUBSCRIPTIONS_KEY = 'subscriptions';
const DECORATED_BY_UNSUBSCRIBER: unique symbol = Symbol('__autoUnsubscriberApplied');

export function AutoUnsubscriber(subscriptionsKey: string = SUBSCRIPTIONS_KEY): ClassDecorator {
  return (instance: any): void => {
    decorateProviderDirectiveOrComponent(instance, subscriptionsKey);
    markAsDecorated(instance);
  }
}

function decorateProviderDirectiveOrComponent(
  instance: InjectableType<unknown> | DirectiveType<unknown> | ComponentType<unknown>,
  subscriptionsKey: string
): void {
  instance.prototype.ngOnDestroy = decorateNgOnDestroy(
    instance.prototype.ngOnDestroy,
    subscriptionsKey
  );
}

function decorateNgOnDestroy(ngOnDestroy: any, subscriptionsKey: string) {
  return function (this: any): void {
    if (ngOnDestroy) {
      ngOnDestroy.call(this);
    }

    const subscriptions: Subscription[] = this[subscriptionsKey];

    if (Array.isArray(subscriptions)) {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      })
    }
  }
}

function markAsDecorated(
  type: InjectableType<unknown> | DirectiveType<unknown> | ComponentType<unknown>
): void {
  type.prototype[DECORATED_BY_UNSUBSCRIBER] = true;
}
