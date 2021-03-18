const EmpresaService = require('../../../services/EmpresaService');

module.exports = {
  Query: {
    empresas: async () => await EmpresaService.getAll(),
    getEmpresaId: async (_, { id }) => await EmpresaService.getById(id)
  },

  Mutation: {
    createEmpresa: async (_, { codigo, sigla, nome }) =>
      await EmpresaService.createEmpresa(codigo, sigla, nome),
    updateEmpresa: async (_, { id, data }) =>
      await EmpresaService.updateEmpresa(id, data),
    deleteEmpresa: async (_, { id }, context) => {
      context && context.validateMasters();
      await EmpresaService.deleteEmpresa(id);
    }
  }
};
