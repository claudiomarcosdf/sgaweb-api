const AssociadoService = require('../../../services/AssociadoService');

module.exports = {
  Query: {
    associados: async () => {
      return await AssociadoService.associados();
    },
    getAssociadoId: async (_, { id }) => {
      return await AssociadoService.associado(id);
    },

    // Finds Custom
    activeAssociados: async (_, { status }) => {
      return await AssociadoService.findByStatus(status);
    },
    getAssociado: async (_, { matricula, nome }) => {
      if (matricula) {
        return await AssociadoService.findByMatriculaOrNome(
          'matricula',
          matricula
        );
      } else {
        return await AssociadoService.findByMatriculaOrNome('nome', nome);
      }
    },
    associadosFiltro: async (_, { filtro }) => {
      return await AssociadoService.findByFiltro(filtro);
    },
  },

  Mutation: {
    createAssociado: async (_, { data }) => {
      return await AssociadoService.createAssociado(data);
    },
    updateAssociado: async (_, { id, data }) => {
      return await AssociadoService.updateAssociado(id, data);
    },
    deleteAssociado: async (_, { id }, context) => {
      context && context.validateMasters();
      return await AssociadoService.deleteAssociado(id);
    },
  },
};
