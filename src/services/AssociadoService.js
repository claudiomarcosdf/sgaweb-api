const Associado = require('../models/AssociadoModel');
const CpfDuplicado = require('../models/cpfDuplicadoModel');
const NotFoundError = require('../errors/NotFoundError');
const FindAssociadoError = require('../errors/FindAssociadoError');
const CreateAssociadoError = require('../errors/CreateAssociadoError');
const UpdateAssociadoError = require('../errors/UpdateAssociadoError');
const DeleteAssociadoError = require('../errors/DeleteAssociadoError');

const { numberOnly } = require('../common/helpers');

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
  findByMatriculaOrNome = async (field, value, status) => {
    const valueRegex = {
      $regex: new RegExp('^' + value.toLowerCase() + '$', 'i'),
    };

    try {
      const result = await Associado.findOne({
        [field]: valueRegex,
        status: status,
      });

      return result;
    } catch (error) {
      throw new NotFoundError('Erro ao buscar associado.');
    }
  };
  findByNome = async (value) => {
    const valueRegex = {
      $regex: new RegExp('^' + value.toLowerCase() + '$', 'i'),
    };

    try {
      const result = await Associado.findOne({
        nome: valueRegex
      });

      return result;
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
  findByPesquisa = async (nome, status) => {
    const nomeRegex = {
      $regex: new RegExp('^' + nome.toLowerCase(), 'i'),
    };  
    
    try {
      return await Associado.find({nome: nomeRegex, status: status});
    } catch (error) {
      throw new NotFoundError('Erro ao realizar pesquisa.');
    }    

  };

  createAssociado = async (data) => {
    const associado = new Associado({
      ...data,
      matricula: numberOnly(data.matricula).padStart(8, 0)
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
  listcpfDuplicado = async () => {
    try {
      const response = await CpfDuplicado.find({ total: { $gt: 1 } });

      if (!response) {
        throw new NotFoundError('Nada encontrado.');
      } else {
        return response;
      }
    } catch (error) {
      throw new DeleteAssociadoError('Erro ao buscar cpfs duplicados.');
    }
  };
  ativarAssociadoPeloID = async (id) => {
    try {
      const data = { status: 'ATIVO', inativoAt: null }
      const associado = await Associado.findOneAndUpdate({ _id: id }, {status: 'ATIVO'}, {
        new: true,
      });

      if (!associado) {
        throw new NotFoundError('Associado não encontrado. '+id);
      } else {
        return associado;
      }
    } catch (error) {
      throw new UpdateAssociadoError('Erro ao atualizar o associado. '+error);
    }
  };  
  ativarAssociado = async (cpf) => {
    try {
      const data = { status: 'ATIVO', inativoAt: null }
      const associado = await Associado.findOneAndUpdate({ 'dados_pessoais.cpf': cpf }, data, {
        new: true,
      });

      if (!associado) {
        throw new NotFoundError('Associado não encontrado.');
      } else {
        return associado;
      }
    } catch (error) {
      throw new UpdateAssociadoError('Erro ao atualizar o associado. ' + error);
    }
  };
  inativarAssociado = async (cpf) => {
    try {
      const data = { status: 'INATIVO', inativoAt: new Date().toISOString() }
      const associado = await Associado.findOneAndUpdate({ 'dados_pessoais.cpf': cpf }, data, {
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
  atualizarCpfAssociado = async (id, cpf) => {
    try {
      const data = { 'dados_pessoais.cpf': cpf }
      const associado = await Associado.findOneAndUpdate({ _id: id }, data, {
        new: true,
      });

      if (!associado) {
        throw new NotFoundError('Associado não encontrado.');
      } else {
        return associado;
      }
    } catch (error) {
      throw new UpdateAssociadoError('Erro ao atualizar o associado. ' + error);
    }
  };      
}

module.exports = new AssociadoService();
