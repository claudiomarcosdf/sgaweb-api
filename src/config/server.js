const express = require('express');
const { ApolloServer } = require("apollo-server-express");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");
const graphql = require("../graphql");
const NotFoundError = require("../errors/NotFoundError");
const FindAssociadoError = require("../errors/FindAssociadoError");
const CreateAssociadoError = require("../errors/CreateAssociadoError");
const UpdateAssociadoError = require("../errors/UpdateAssociadoError");
const DeleteAssociadoError = require("../errors/DeleteAssociadoError");
const CreateError = require("../errors/CreateError");

const context = require("./context");

async function startServer() {
  const server = new ApolloServer({
    ...graphql,
    csrfPrevention: true,
    context,
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

  const app = express();

  // This middleware should be added before calling `applyMiddleware`.
  app.use(graphqlUploadExpress());

  server.applyMiddleware({ app });

  await new Promise((r) => app.listen({ port: 4000 }, r));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startServer();

//server.listen().then(({ url }) => console.log(url));
