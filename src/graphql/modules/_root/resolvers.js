const { GraphQLDate, GraphQLDateTime } = require('graphql-iso-date');
const  GraphQLUpload  = require('graphql-upload/GraphQLUpload.js');


module.exports = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Upload: GraphQLUpload,
};
