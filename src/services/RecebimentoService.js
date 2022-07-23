const _ = require('lodash');
const Recebimento = require('../models/recebimentoModel');
const Associado = require('../models/AssociadoModel');

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

  //Busca inadimplentes por período informado
  //Consulta com tempo resposta de 1:25s (mm:ss) <RESOLVIDO!>
  //SOLUÇÃO: Basta criar um índice no foreignField da tabela de recebimentos,
  //no caso, o field CPF
  getInadimplentes = async (ano, mes) => {
    const mesFormatado = ('00' + mes).slice(-2);

    console.time("duracao");

    const result = await getByFilter({ ano, mes: mesFormatado });
    const naoExisteRecebimentoPeriodo = _.isEmpty(result);   
    if (naoExisteRecebimentoPeriodo) {
      return []
    }

    try {
      const response = await Associado.aggregate([
        {
          $match: { status: "ATIVO" },
        },
        {
          $lookup: {
            from: 'recebimentos',
            localField: 'dados_pessoais.cpf',
            foreignField: 'cpf',
            as: 'recebidos'
          },        
        },
        {
          $project: {
            recebidos : { $filter : 
            {input : '$recebidos'  , as : 'rec', 
              cond : { $and: [
                { $eq : ['$$rec.ano' , ano] } ,
                { $eq : ['$$rec.mes' , mesFormatado] }
                ]  
              }
            } 
              
            },
            nome: 1,
            matricula: 1,
            'dados_pessoais.cpf': 1,
            endereco: 1,
            'empresa.sigla': 1
          }          
        },
        {
          $sort: {
            'empresa.sigla': 1,
            nome: 1
          }
        }
      ]);

      let result = [];

      if (!response) {
        return result;
      } else {
        result = response.map(obj => {
            return {
              id: obj._id,
              matricula: obj.matricula,
              nome: obj.nome,
              cpf: obj.dados_pessoais.cpf,
              celular1: obj.endereco.contatos.celular1,
              celular2: obj.endereco.contatos.celular2,
              fone1: obj.endereco.contatos.telefoneresidencia,
              empresa: obj.empresa.sigla,
              recebidos: obj.recebidos
            }
        }).filter(associado => associado.recebidos.length == 0)
      }
 
      console.log(result.length);
      console.timeEnd("duracao")
      return result;

    } catch (error) {
      throw new Error('Erro buscar inadimplentes por mes/ano.' + error);
    }

  };

}


module.exports = new RecebimentoService();
