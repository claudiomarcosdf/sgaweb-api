const OrgaoService = require('../../../services/OrgaoService');

module.exports = {
  Query: {
    orgaos: async () => await OrgaoService.getAll(),
    getOrgaoId: async (_, { id }) => await OrgaoService.getById(id)
  },

  Mutation: {
    createOrgao: async (_, { nome }) =>
      await OrgaoService.createOrgao(nome),
    updateOrgao: async (_, { id, data }) =>
      await OrgaoService.updateOrgao(id, data),
    deleteOrgao: async (_, { id }, context) => {
      context && context.validateMasters();
      await OrgaoService.deleteOrgao(id);
    }
  }
};
