"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const typeDefs_1 = require("./graphql/typeDefs");
const resolvers_1 = require("./graphql/resolvers");
const schema_1 = require("@graphql-tools/schema");
const http_1 = require("http");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/softsettle';
async function startServer() {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // MongoDB Connection
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log(' MongoDB connected');
    }
    catch (error) {
        console.error(' MongoDB connection failed:', error);
    }
    // Apollo GraphQL Server
    const httpServer = (0, http_1.createServer)(app);
    const wsServer = new ws_1.WebSocketServer({ server: httpServer, path: '/graphql' });
    const schema = (0, schema_1.makeExecutableSchema)({ typeDefs: typeDefs_1.typeDefs, resolvers: resolvers_1.resolvers });
    const server = new apollo_server_express_1.ApolloServer({ schema });
    (0, ws_2.useServer)({ schema }, wsServer);
    await server.start();
    server.applyMiddleware({ app });
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });
    // Start listening
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    });
}
startServer().catch(console.error);
