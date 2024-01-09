const AssociadoService = require('../../../services/AssociadoService');
const RecebimentoService = require('../../../services/RecebimentoService');
const { formatCpf } = require('../../../common/helpers');

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
    getAssociado: async (_, { matricula, nome, status }) => {
      if (matricula) {
        return await AssociadoService.findByMatriculaOrNome(
          'matricula',
          matricula,
          status
        );
      } else {
        return await AssociadoService.findByMatriculaOrNome('nome', nome, status);
      }
    },
    associadosFiltro: async (_, { filtro }) => {
      return await AssociadoService.findByFiltro(filtro);
    },
    associadosPesquisa: async (_, { nome, status }) => {
      if (nome) {

        return await AssociadoService.findByPesquisa(nome, status);
      }
    },
    associadosACadastrar: async (_, { ano, mes }) => {
      //Todos associados cadastrados
      const todosAssociados = await AssociadoService.associados();
      const ultimosRecebimentos = await RecebimentoService.getByPeriodFull(ano, mes);
      console.log("Total associados banco: ", todosAssociados.length);
      console.log("Total recebimentos: ", ultimosRecebimentos.length);

      //imprimir todos os associados que constam no último recebimento e não constam no cadastro
      let totalACadastrar = 0;
      let naoCadastrados = [];
      for (const recebimento of ultimosRecebimentos) {
         const localizado = todosAssociados.find(associado => associado.dados_pessoais.cpf == recebimento.cpf);

         if (!localizado) {
          totalACadastrar += 1;
          const associadoNaoCadastrado = {
            matricula: recebimento.matricula,
            orgao: recebimento.orgao,
            lotacao: recebimento.lotacao,
            nome: recebimento.nome,
            cpf: recebimento.cpf
          }
          naoCadastrados.push(associadoNaoCadastrado);
          //console.log(recebimento.cpf);
         }
      }

      console.log("Total a cadastrar: ", totalACadastrar); 

      return naoCadastrados;
    }

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
    removeCpfDuplicado: async () => {
       //
       const listOfCpfDuplicados = await AssociadoService.listcpfDuplicado();
       for (const cpfDuplicado of listOfCpfDuplicados) {
          for (let i = 0; i < cpfDuplicado.ids.length; i++) {
              if  (i == 0) await AssociadoService.ativarAssociadoPeloID(cpfDuplicado.ids[i]);
              if (i != 0) {
                //remove pelo ids[i]
                console.log("removendo id: ", cpfDuplicado.ids[i]);
                await AssociadoService.deleteAssociado(cpfDuplicado.ids[i]);
              } 
          }
       }
       console.log(listOfCpfDuplicados.length)

    },
    inativarAssociados: async (_, { ano, mes }) => {
      //Para atualização da base de dados apenas
      const associadosAtivos = await AssociadoService.findByStatus("ATIVO");
      //const associadosAtivos = await AssociadoService.associados();
      const ultimosRecebimentos = await RecebimentoService.getByPeriodFull(ano, mes);
      console.log("Total ativos banco: ", associadosAtivos.length);
      console.log("Total recebimento: ", ultimosRecebimentos.length);

      //verificar se cada associado ativo (pelo CPF) consta na lista dos últimos recebimentos,
      //caso contrário, inativar o associado
      let totalAInativar = 0;
      for (const associado of associadosAtivos) {
         const localizado = ultimosRecebimentos.find(recebimento => recebimento.cpf == associado.dados_pessoais.cpf);

         if (!localizado) {
          totalAInativar += 1;
          //console.log(associado.dados_pessoais.cpf);
          await AssociadoService.inativarAssociado(associado.dados_pessoais.cpf);
         }
      }

      console.log("Total a inativar: ", totalAInativar);

      return true;
    }, 
    ativarAssociados: async (_, { ano, mes }) => {
      //Para atualização da base de dados apenas
      const associadosAtivos = await AssociadoService.findByStatus("INATIVO");
      const ultimosRecebimentos = await RecebimentoService.getByPeriodFull(ano, mes);
      console.log("Total inativos banco: ", associadosAtivos.length);
      console.log("Total recebimento: ", ultimosRecebimentos.length);

      //verificar se cada associado inativo (pelo CPF) consta na lista dos últimos recebimentos,
      //então, ativar o associado
      let totalAAtivar = 0;
      for (const associado of associadosAtivos) {
         const localizado = ultimosRecebimentos.find(recebimento => recebimento.cpf == associado.dados_pessoais.cpf);
         if (localizado) {
          totalAAtivar += 1;
          //console.log(localizado.cpf);
          await AssociadoService.ativarAssociado(localizado.cpf);
         }
      }

      console.log("Total a ativar: ", totalAAtivar);

      return true;
    },
    atualizarCpfs: async () => {
      //Todos associados cadastrados
      const todosAssociados = await AssociadoService.associados();

      let total = 0;
      for (const associado of todosAssociados) {

        if (associado.dados_pessoais.cpf.length > 11) {
            total += 1;
            const cpf = associado.dados_pessoais.cpf;
            const cpfFormatado = cpf.substring(1); //remove primeiro elemento
            await AssociadoService.atualizarCpfAssociado(associado.id, cpfFormatado);
        }

        if (associado.dados_pessoais.cpf.length < 11) {
          total += 1;
          const cpfFormatado = formatCpf(associado.dados_pessoais.cpf);
          await AssociadoService.atualizarCpfAssociado(associado.id, cpfFormatado);
        }
      }
      console.log("Total de cpfs atualizados: ", total);
      return true;
    },
    atualizarCpfIncorreto: async (_, { ano, mes }) => {
      //Todos associados cadastrados
      const todosAssociados = await AssociadoService.associados();
      const ultimosRecebimentos = await RecebimentoService.getByPeriodFull(ano, mes);
      console.log("Total associados banco: ", todosAssociados.length);
      console.log("Total recebimentos: ", ultimosRecebimentos.length);

      //busca pelo CPF todos os associados que constam no último recebimento e não constam no cadastro e
      //caso não encontre, fazer a busca no cadastro pelo NOME e alterar com o CPF do recebimento.
      let totalAAtualizar = 0;
      for (const recebimento of ultimosRecebimentos) {
         const localizado = todosAssociados.find(associado => associado.dados_pessoais.cpf == recebimento.cpf);

         //Se não encontrou o CPF
         if (!localizado) {

          //buscar pelo nome no cadastro
          const associadoEncontrado = await AssociadoService.findByNome(recebimento.nome);
          if (associadoEncontrado) {
            totalAAtualizar += 1;
            await AssociadoService.atualizarCpfAssociado(associadoEncontrado.id, recebimento.cpf);
          }
          //console.log(recebimento.cpf);
         }
      }

      console.log("Total de cpfs atualizados: ", totalAAtualizar); 

      return true;
    }    
  },
};
