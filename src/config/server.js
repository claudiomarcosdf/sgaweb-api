const express = require('express');
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");
const graphql = require("../graphql");
const NotFoundError = require("../errors/NotFoundError");
const FindAssociadoError = require("../errors/FindAssociadoError");
const CreateAssociadoError = require("../errors/CreateAssociadoError");
const UpdateAssociadoError = require("../errors/UpdateAssociadoError");
const DeleteAssociadoError = require("../errors/DeleteAssociadoError");
const CreateError = require("../errors/CreateError");
const http = require('http');
const cors = require('cors');
const { json } = require ('body-parser');

const { getIpAddress } = require('../common/helpers');
const context = require("./context");

const app = express();
const httpServer = http.createServer(app);
  
async function startServer() {
  const server = new ApolloServer({
    ...graphql,
    //csrfPrevention: true,
    //context,
	plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      if (error.originalError instanceof NotFoundError) {
        return new Error(error.message);
      }
      if (error.originalError instanceof FindAssociadoError) {
        return new Error(error.message);
      }
      if (error.originalError instanceof CreateAssociadoError) {
        return new Error(error.message);
      }
      if (error.originalError instanceof UpdateAssociadoError) {
        return new Error(error.message);
      }
      if (error.originalError instanceof DeleteAssociadoError) {
        return new Error(error.message);
      }
      if (error.originalError instanceof CreateError) {
        return new Error(error.message);
      }
      return error;
    },
  });

  await server.start();

  app.use(
	  '/graphql',
	  graphqlUploadExpress(),
	  cors(),
	  json(),
	  expressMiddleware(server, { context }),
  );

  await new Promise((r) => httpServer.listen({ port: 4000 }, r));

  console.log(`🚀 Server ready at http://localhost:4000/graphql
               Network: http://${getIpAddress().ethernet}:4000/graphql
               WSL: http://${getIpAddress().wsl}:4000/graphql`);
}

startServer();

//server.listen().then(({ url }) => console.log(url));
