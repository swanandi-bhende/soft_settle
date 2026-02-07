"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.typeDefs = (0, apollo_server_express_1.gql) `
  type Agent {
    id: ID!
    ensDomain: String!
    walletAddress: String!
    currentScore: Int
  }

  type Query {
    getTopAgents: [Agent]
    getAgentByDomain(domain: String!): Agent
  }

  type Mutation {
    registerAgent(ensDomain: String!, walletAddress: String!): Agent
  }
`;
