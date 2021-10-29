const Associado = require('../models/AssociadoModel');
const NotFoundError = require('../errors/NotFoundError');
const FindAssociadoError = require('../errors/FindAssociadoError');
const CreateAssociadoError = require('../errors/CreateAssociadoError');
const UpdateAssociadoError = require('../errors/UpdateAssociadoError');
const DeleteAssociadoError = require('../errors/DeleteAssociadoError');

class AssociadoService {
  associados = async () => {
    return await Associado.find();
  };
  associado = async (id) => {
    try {
      const associado = await Associado.findById({ _id: id });

      if (!associado) {
        throw new NotFoundError('Associado não encontrado.');
      } else {
        return associado;
      }
    } catch (error) {
      throw new FindAssociadoError('Erro ao buscar o associado.');
    }
  };
  findByStatus = async (status) => {
    try {
      return await Associado.find({ status: status });
    } catch (error) {
      throw new Error('Erro ao buscar associados.');
    }
  };
  findByMatriculaOrNome = async (field, value) => {
    const valueRegex = {
      $regex: new RegExp('^' + value.toLowerCase() + '$', 'i'),
    };

    try {
      return await Associado.findOne({
        [field]: valueRegex,
      });
    } catch (error) {
      throw new NotFoundError('Erro ao buscar associado.');
    }
  };
  findByFiltro = async (filtro) => {
    const { status, empresa_sigla, aposentado } = filtro;
    let valuesToFind = [];
    if (!status && !empresa_sigla && !aposentado) {
      //find()
    }
    if (status) {
      valuesToFind.push({ status: status.toUpperCase() });
    }
    if (empresa_sigla) {
      valuesToFind.push({ 'empresa.sigla': empresa_sigla });
    }
    if (aposentado !== undefined) {
      valuesToFind.push({ 'empresa.aposentado': aposentado });
    }

    const filter = Object.assign({}, ...valuesToFind);

    try {
      return await Associado.find(filter);
    } catch (error) {
      throw new NotFoundError('Erro ao realizar consulta.');
    }
  };

  createAssociado = async (data) => {
    const associado = new Associado({
      ...data,
      matricula: data.matricula.padStart(8, 0)
    });
    try {
      return await associado.save(data);
    } catch (error) {
      throw new CreateAssociadoError('Erro ao salvar o associado.' + error);
    }
  };
  updateAssociado = async (id, data) => {
    try {
      const associado = await Associado.findByIdAndUpdate({ _id: id }, data, {
        new: true,
      });

      if (!associado) {
        throw new NotFoundError('Associado não encontrado.');
      } else {
        return associado;
      }
    } catch (error) {
      throw new UpdateAssociadoError('Erro ao atualizar o associado.');
    }
  };
  deleteAssociado = async (id) => {
    try {
      const response = await Associado.findByIdAndRemove({ _id: id });

      if (!response) {
        throw new NotFoundError('Associado não encontrado.');
      } else {
        return true;
      }
    } catch (error) {
      throw new DeleteAssociadoError('Erro ao remover o associado.');
    }
  };
}

module.exports = new AssociadoService();
