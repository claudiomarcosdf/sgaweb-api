const Empresa = require('../models/EmpresaModel');
const NotFoundError = require('../errors/NotFoundError');
const CreateError = require('../errors/CreateError');

class EmpresaService {
  getAll = async () => {
    const result = await Empresa.find();
    return result.sort((a, b) => a.sigla.localeCompare(b.sigla));
  };

  getById = async (id) => await Empresa.findById({ _id: id });

  getByCodigo = async (codigo) => await Empresa.findOne({ codigo: codigo });

  createEmpresa = async (codigo, sigla, nome) => {
    const empresa = { codigo, sigla, nome };
    try {
      return await empresa.save();
    } catch (error) {
      throw new CreateError('Erro ao salvar empresa.' + error);
    }
  };

  updateEmpresa = async (id, data) => {
    try {
      const empresa = await Empresa.findByIdAndUpdate({ _id: id }, data, {
        new: true
      });
      if (!empresa) {
        throw new NotFoundError('Empresa não encontrada!');
      } else {
        return empresa;
      }
    } catch (error) {
      throw new Error('Erro ao atualizar empresa');
    }
  };

  deleteEmpresa = async (id) => {
    try {
      const response = await Empresa.findByIdAndRemove({ _id: id });
      if (!response) {
        throw new NotFoundError('Empresa não encontrada!');
      } else {
        return true;
      }
    } catch (error) {
      throw new Error('Erro ao excluir empresa');
    }
  };
}

module.exports = new EmpresaService();
