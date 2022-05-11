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

  if (associado.APOSENTADO == 'S') isAposentado = true;

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
  const empresaMongo = await originalEmpresas.find(
    (obj) => obj.codigo === associado.empresa
  );

  let objEmpresa = {};
  let aposentado = getAposentado(associado);

  objEmpresa.codigo = empresaMongo?.codigo || 9902;
  objEmpresa.nome_empresa = empresaMongo?.nome || 'Outros';
  objEmpresa.sigla = empresaMongo?.sigla || 'OUTROS';
  objEmpresa.orgao = '';
  objEmpresa.lotacao = associado?.lotacao || '';
  objEmpresa.funcao = associado?.funcao || '';
  objEmpresa.aposentado = aposentado;

  if (aposentado) {
    if (associado.dtaposentadoria.$date != '1970-01-01T00:00:00Z') {
      objEmpresa.dtaposentadoria = new Date(associado.dtaposentadoria.$date);
    }
  } 

  if (associado.dtadmissao.$date != '1970-01-01T00:00:00Z') {
    objEmpresa.dtadmissao = new Date(associado.dtadmissao.$date);
  }

  if (associado.dtdemissao.$date != '1970-01-01T00:00:00Z') {
    objEmpresa.dtadmissao = new Date(associado.dtdemissao.$date);
  }  

  return objEmpresa;
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

const getMatriculaSindicato = (listAssociados) => {
  const matSindicato = geraMatricula();

  const associadoJaCadastrado = listAssociados.find(
    (obj) => obj.matsindicato == matSindicato
  );

  if (associadoJaCadastrado) {
    getMatriculaSindicato(listAssociados);
  }

  return matSindicato;
}

const gerarAssociadosJSON = async (obj) => {
  try {
    await writeFile('associados2.json', JSON.stringify(obj));
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
      await readFile('src/dump/associados-full-final.json')
    );

    originalEmpresas = JSON.parse(
      await readFile('src/dump/empresas-final.json')
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
      for (const associado of associados ) {
        if (associado.matempresa != undefined) {

          const matSindicato = getMatriculaSindicato(ativosArray);

          ativosArray.push({
            matsindicato: matSindicato,
            matricula: associado?.matempresa.padStart(8, '0') || '',
            nome: associado.nome,
            status: associado.ativo === 'S' ? 'ATIVO' : 'INATIVO',
            dtfiliacao: new Date(associado.dtfiliacao.$date),
            dados_pessoais: {
              dtnascimento: new Date(
                getDataNascimento(associado.dtnascimento)
              ),
              cpf: associado.cpf,
              rg: associado.rg,
              sexo: associado.sexo === 'M' ? 'Masculino' : 'Feminino',
              estadocivil: getEstadoCivil(associado.estadocivil),
              filiacao: associado.filiacao
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
      };

      const final = await ativosArray.filter(
        (obj) => Object.keys(obj).length !== 0
      );

      gerarAssociadosJSON(final);

      console.log('New Associados: ', final.length);
      //console.log('Não cadastrados:', cpfsNaoCadastrado);
    })();


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
