declare module 'graphql-ws/lib/use/ws' {
  import { WebSocketServer } from 'ws';
  import { GraphQLSchema } from 'graphql';
  export function useServer(options: { schema: GraphQLSchema }, server: WebSocketServer): void;
}
