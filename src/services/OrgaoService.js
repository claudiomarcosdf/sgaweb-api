const Orgao = require('../models/OrgaoModel');
const NotFoundError = require('../errors/NotFoundError');
const CreateError = require('../errors/CreateError');

class OrgaoService {
  getAll = async () => {
    const result = await Orgao.find();
    return result.sort((a, b) => a.sigla.localeCompare(b.sigla));
  };

  getById = async (id) => await Orgao.findById({ _id: id });

  getByCodigo = async (codigo) => await Orgao.findOne({ codigo: codigo });

  createOrgao = async (codigo, sigla, nome) => {
    const orgao = { codigo, sigla, nome };
    try {
      return await orgao.save();
    } catch (error) {
      throw new CreateError('Erro ao salvar órgão.' + error);
    }
  };

  updateOrgao = async (id, data) => {
    try {
      const orgao = await Orgao.findByIdAndUpdate({ _id: id }, data, {
        new: true
      });
      if (!orgao) {
        throw new NotFoundError('Órgão não encontrado!');
      } else {
        return orgao;
      }
    } catch (error) {
      throw new Error('Erro ao atualizar órgão');
    }
  };

  deleteOrgao = async (id) => {
    try {
      const response = await Orgao.findByIdAndRemove({ _id: id });
      if (!response) {
        throw new NotFoundError('Órgão não encontrado!');
      } else {
        return true;
      }
    } catch (error) {
      throw new Error('Erro ao excluir órgão');
    }
  };
}

module.exports = new OrgaoService();
