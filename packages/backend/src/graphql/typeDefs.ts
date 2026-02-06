import { gql } from 'apollo-server-express';

export const typeDefs = gql`
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