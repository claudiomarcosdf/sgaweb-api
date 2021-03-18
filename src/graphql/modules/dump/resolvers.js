const { promises } = require('fs');
const { readFile, writeFile } = promises;
const moment = require('moment');

const { generateMatricula } = require('../../../common/helpers');

let originalEmpresas;

let empresasFromMongo;

let recebimentos;

function formatMovel(fone) {
  let numberString = fone.replace('/', '');
  numberString = fone.replace(' ', '');
  let numberFinal = '';

  if (numberString.length === 10) {
    if (numberString.startsWith('9', 2) || numberString.startsWith('8', 2)) {
      numberString = numberString.slice(0, 2) + '9' + numberString.slice(2, 10);
    }
  } else if (numberString.length === 8) {
    numberString = '619' + numberString;
  } else if (numberString.length === 7) {
    numberString = '6199' + numberString;
  } else if (numberString.length < 7) {
    numberString = '';
  }

  //61 99976 3771
  if (numberString.length === 11) {
    numberFinal =
      '(' +
      numberString.substr(0, 2) +
      ') ' +
      numberString.substr(2, 5) +
      '-' +
      numberString.substr(7, 4);
  }

  return numberFinal;
}

function formatFixo(fone) {
  let numberString = fone.replace('/', '');
  numberString = numberString.replace(' ', '');
  let numberFinal = '';

  if (numberString.length === 8) {
    numberString = '61' + numberString;
  } else if (numberString.length === 7) {
    numberString = '613' + numberString;
  } else if (numberString.length < 7) {
    numberString = '';
  }

  //61 34757531
  if (numberString.length === 10) {
    numberFinal =
      '(' +
      numberString.substr(0, 2) +
      ')' +
      ' ' +
      numberString.substr(2, 4) +
      '-' +
      numberString.substr(6, 4);
  }

  return numberFinal;
}

function NumberLongToDate(numberLong) {
  if (numberLong) {
    return moment(parseInt(numberLong)).format();
  } else return '';
}

function getEstadoCivil(ec) {
  //'Solteiro(a)', 'Casado(a)', 'Viúvo(a)', 'Divorciado(a)'
  let estcivil = 'Solteiro(a)';

  if (ec === 'S') estcivil = 'Solteiro(a)';
  if (ec === 'C') estcivil = 'Casado(a)';
  if (ec === 'V') estcivil = 'Viúvo(a)';
  if (ec === 'D') estcivil = 'Divorciado(a)';

  return estcivil;
}

function getAposentado(associado) {
  let isAposentado = false;

  if (associado.funcao.toLowerCase() === /aposentado/i) isAposentado = true;
  if (associado.lotacao.toLowerCase() === /aposentado/i) isAposentado = true;
  if (associado.motivodemissao.toLowerCase() === /aposentado/i)
    isAposentado = true;

  return isAposentado;
}

function getDataNascimento(data) {
  if (data.$date) {
    if (data.$date.$numberLong) {
      return NumberLongToDate(data.$date.$numberLong);
    } else {
      return data.$date;
    }
  }
}

const getEmpresa = async (associado) => {
  const codigoToFindMongo = await originalEmpresas.find(
    (obj) => obj.idempresa === associado.empresa
  );

  const empresaMongo = await empresasFromMongo.find(
    (obj) => obj.codigo === codigoToFindMongo.idmongo
  );

  return {
    codigo: empresaMongo?.codigo || 9902,
    nome_empresa: empresaMongo?.nome || 'Outros',
    sigla: empresaMongo?.sigla || 'OUTROS',
    orgao: '',
    dtadmissao: new Date(associado.dtadmissao.$date),
    aposentado: getAposentado(associado)
  };
};

const getAssociadoRecebimentos = async (cpf, matrSindicato) => {
  const newAssociado = await recebimentos.find((obj) => obj.cpf === cpf);

  return {
    matricula: newAssociado.matricula,
    nome: newAssociado.nome,
    status: 'ATIVO',
    dtfiliacao: new Date(),
    matsindicato: matrSindicato,
    dados_pessoais: {
      dtnascimento: new Date(),
      cpf: newAssociado.cpf,
      rg: '',
      sexo: 'Masculino',
      estadocivil: ''
    },
    endereco: {
      cep: '',
      logradouro: '',
      cidade: '',
      bairro: '',
      estado: 'DF',
      contatos: {
        celular1: '',
        celular2: '',
        telefoneresidencia: '',
        telefonetrabalho: '',
        email: ''
      }
    },
    empresa: {
      codigo: 9902,
      nome_empresa: 'Outros',
      sigla: 'OUTROS',
      orgao: '',
      dtadmissao: new Date(),
      aposentado: false
    },
    inativoAt: ''
  };
};

const geraMatricula = () => {
  return generateMatricula(new Date().getSeconds() + 255);
};

const gerarAssociadosJSON = async (obj) => {
  try {
    await writeFile('associados.json', JSON.stringify(obj));
  } catch (err) {
    console.log(err);
  }
};

const Dumpservice = async () => {
  try {
    const cpfs = JSON.parse(
      await readFile('src/dump/associados-codeplan-cpf.json')
    );

    const associados = JSON.parse(
      await readFile('src/dump/associados-full.json')
    );

    originalEmpresas = JSON.parse(
      await readFile('src/dump/empresas-to-import.json')
    );

    empresasFromMongo = JSON.parse(
      await readFile('src/dump/empresas-from-mongo.json')
    );

    recebimentos = JSON.parse(
      await readFile('src/dump/recebimentos-to-get-basics.json')
    );

    console.log('CODEPLAN ', cpfs.length);

    // const b = NumberLongToDate(associados[0].dtnascimento.$date.$numberLong);
    let ativosArray = [];
    let cpfsNaoCadastrado = [];

    (async () => {
      for (let i = 0; i < cpfs.length; i++) {
        const associado = await associados.find(
          (associado) => associado.cpf === cpfs[i].cpf
        );

        if (associado) {
          if (associado.ativo === 'S') {
            ativosArray.push({
              matricula: associado.matempresa.padStart(8, '0'),
              nome: associado.nome,
              status: associado.ativo === 'S' ? 'ATIVO' : 'INATIVO',
              dtfiliacao: new Date(associado.dtfiliacao.$date),
              matsindicato: new String(associado.matsindicato).padStart(4, '0'),
              dados_pessoais: {
                dtnascimento: new Date(
                  getDataNascimento(associado.dtnascimento)
                ),
                cpf: associado.cpf,
                rg: associado.rg,
                sexo: associado.sexo === 'M' ? 'Masculino' : 'Feminino',
                estadocivil: getEstadoCivil(associado.estadocivil)
              },
              endereco: {
                cep: associado.cep,
                logradouro: associado.endereco,
                cidade: associado.cidade,
                bairro: associado.bairro,
                estado: associado.estado,
                contatos: {
                  celular1: formatMovel(associado.celular),
                  celular2: formatMovel(associado.telefone01),
                  telefoneresidencia: formatFixo(associado.telefoneresidencia),
                  telefonetrabalho: formatFixo(associado.telefonetrabalho),
                  email: associado.email
                }
              },
              empresa: await getEmpresa(associado),
              inativoAt: ''
            });
          }
        } else {
          //Nome, matricula e CPF vindos de 'recebimentos'
          cpfsNaoCadastrado.push(cpfs[i].cpf);
          // let newAssociado;
          // let newMatSindicato;
          // let verdade = true;

          // while (verdade) {
          //   newMatSindicato = geraMatricula();

          //   const exist = ativosArray.find(
          //     (obj) => obj.matsindicato === newMatSindicato
          //   );

          //   if (exist) {
          //     console.log('exist');
          //     verdade = true;
          //   } else {
          //     newAssociado = await getAssociadoRecebimentos(
          //       cpfs[i].cpf,
          //       newMatSindicato
          //     );
          //     verdade = false;
          //   }
          // }

          // ativosArray.push(newAssociado);
        }
      }

      for (let x = 0; x < cpfsNaoCadastrado.length; x++) {
        let newAssociado;
        let newMatSindicato;
        let verdade = true;

        while (verdade) {
          newMatSindicato = geraMatricula();

          const exist = ativosArray.find(
            (obj) => obj.matsindicato === newMatSindicato
          );

          if (exist) {
            console.log('exist');
            verdade = true;
          } else {
            newAssociado = await getAssociadoRecebimentos(
              cpfsNaoCadastrado[x],
              newMatSindicato
            );
            verdade = false;
          }
        }

        ativosArray.push(newAssociado);
      }

      const final = await ativosArray.filter(
        (obj) => Object.keys(obj).length !== 0
      );

      gerarAssociadosJSON(final);

      console.log('New Associados: ', final.length);
      console.log('Não cadastrados:', cpfsNaoCadastrado);
    })();

    // ativosArray = associados.map(async (associado) => {
    //   const exist = cpfs.find((obj) => obj.cpf === associado.cpf);

    //   if (exist) {
    //     return {
    //       matricula: associado.matempresa.padStart(8, '0'),
    //       nome: associado.nome,
    //       status: associado.ativo === 'S' ? 'ATIVO' : 'INATIVO',
    //       dtfiliacao: new Date(associado.dtfiliacao.$date),
    //       matsindicato: new String(associado.matsindicato).padStart(4, '0'),
    //       dados_pessoais: {
    //         dtnascimento: new Date(getDataNascimento(associado.dtnascimento)),
    //         cpf: associado.cpf,
    //         rg: associado.rg,
    //         sexo: associado.sexo === 'M' ? 'Masculino' : 'Feminino',
    //         estadocivil: getEstadoCivil(associado.estadocivil)
    //       },
    //       endereco: {
    //         cep: associado.cep,
    //         logradouro: associado.endereco,
    //         cidade: associado.cidade,
    //         bairro: associado.bairro,
    //         estado: associado.estado,
    //         contatos: {
    //           celular1: formatMovel(associado.celular),
    //           celular2: formatMovel(associado.telefone01),
    //           telefoneresidencia: formatFixo(associado.telefoneresidencia),
    //           telefonetrabalho: formatFixo(associado.telefonetrabalho),
    //           email: associado.email
    //         }
    //       },
    //       empresa: await getEmpresa(associado),
    //       inativoAt: ''
    //     };
    //   } else {
    //     return {};
    //   }
    // });

    // (async () => {
    //   const result = await Promise.all(ativosArray);

    //   const final = await result.filter((obj) => Object.keys(obj).length !== 0);

    //   gerarAssociadosJSON(final);
    //   console.log('New Associados: ', final.length);
    // })();

    return true;
  } catch (error) {
    console.log('erro: ' + error);
    return false;
  }
};

module.exports = {
  Query: {
    dump: async () => await Dumpservice()
  }
};
