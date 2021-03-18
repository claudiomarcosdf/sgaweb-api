const { ApolloServer } = require('apollo-server');
const graphql = require('../graphql');
const NotFoundError = require('../errors/NotFoundError');
const FindAssociadoError = require('../errors/FindAssociadoError');
const CreateAssociadoError = require('../errors/CreateAssociadoError');
const UpdateAssociadoError = require('../errors/UpdateAssociadoError');
const DeleteAssociadoError = require('../errors/DeleteAssociadoError');
const CreateError = require('../errors/CreateError');

const context = require('./context');

const server = new ApolloServer({
  ...graphql,
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

server.listen().then(({ url }) => console.log(url));
