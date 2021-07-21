const _ = require('lodash');
const Recebimento = require('../models/recebimentoModel');

const getByFilter = async (filter) => {
  try {
    const recebimentos = await Recebimento.find({ ...filter });

    return recebimentos;
  } catch (error) {
    throw new Error('Erro ao buscar recebimentos.');
  }
};

class RecebimentoService {
  getAll = async () => {
    return await Recebimento.find();
  };
  getById = async (id) => {
    return await Recebimento.findById({ _id: id });
  };
  getByPeriod = async (ano, mes, rubrica) => {
    return await getByFilter({ ano, mes, rubrica });
  };
  getByPeriodFull = async (ano, mes) => {
    return await getByFilter({ ano, mes });
  };
  isRecebido = async (ano, mes, rubrica) => {
    const result = await getByFilter({ ano, mes, rubrica });
    return !_.isEmpty(result);
  };
  getFilters = async (filter) => {
    return await getByFilter({ ...filter });
  };
  getByOrgao = async (orgao) => {
    return await getByFilter({ orgao });
  };
  getByMatricula = async (matricula) => {
    return await getByFilter({ matricula });
  };
  insertRecebimento = async (data) => {
    try {
      const recebimento = await Recebimento.create(data);

      if (!recebimento) {
        return false;
      }

      return true;
    } catch (error) {
      throw new Error('Erro ao incluir recebimento.' + error);
    }
  };
  deleteRecebimento = async (id) => {
    try {
      const response = await Recebimento.findByIdAndRemove({ _id: id });

      if (!response) {
        throw new Error('Nenhum recebimento encontrado.');
      } else {
        return true;
      }
    } catch (error) {
      throw new Error('Erro ao remover recebimento.');
    }
  };

  deleteRecebimentos = async (ano, mes) => {
    try {
      const response = await Recebimento.deleteMany({ ano, mes });

      if (!response) {
        throw new Error('Nenhum recebimento encontrado.');
      } else {
        return true;
      }
    } catch (error) {
      throw new Error('Erro ao remover recebimentos.');
    }
  };

  getTotais = async (ano) => {
    try {
      const response = await Recebimento.aggregate([
        {
          $match: { ano: ano },
        },
        {
          $group: {
            _id: '$mes',
            total: { $sum: '$valor' },
          },
        },
        {
          $project: { _id: 1, total: 1 },
        },
      ]);

      let totais = new Array(12).fill(0);
      // _id é o mês, total é o valor
      if (!response) {
        return totais;
      } else {
        response.forEach((element) => {
          totais[parseInt(element._id) - 1] = element.total;
        });
        return totais;
      }
    } catch (error) {
      throw new Error('Erro buscar recebimentos.' + error);
    }
  };

  getTotaisPorEmpresa = async (ano, mes) => {
    try {
      const response = await Recebimento.aggregate([
        {
          $match: { ano: ano, mes: mes },
        },
        {
          $group: {
            _id: '$orgao',
            total: { $sum: '$valor' },
          },
        },
        {
          $project: { _id: 1, total: 1 },
        },
      ]);

      let totais = [];
      // _id é o órgão, total é a soma do valor por empresa
      if (!response) {
        return totais;
      } else {
        totais = response.map(obj => {
          return {
            orgao: obj._id,
            total: obj.total
          }
        })

        return totais;
      }      
    } catch (error) {
      throw new Error('Erro buscar totais por empresa.' + error);
    }
  };
}


module.exports = new RecebimentoService();
