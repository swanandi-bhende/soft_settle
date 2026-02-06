declare module 'graphql-subscriptions' {
  export class PubSub {
    publish(triggerName: string, payload: any): Promise<void>;
    asyncIterator<T = any>(triggers: string | string[]): AsyncIterableIterator<T>;
  }
}
