const OrgaoService = require('../../../services/OrgaoService');

module.exports = {
  Query: {
    orgaos: async () => await OrgaoService.getAll(),
    getOrgaoId: async (_, { id }) => await OrgaoService.getById(id)
  },

  Mutation: {
    createOrgao: async (_, { codigo, sigla, nome }) =>
      await OrgaoService.createOrgao(codigo, sigla, nome),
    updateOrgao: async (_, { id, data }) =>
      await OrgaoService.updateOrgao(id, data),
    deleteOrgao: async (_, { id }, context) => {
      context && context.validateMasters();
      await OrgaoService.deleteOrgao(id);
    }
  }
};
