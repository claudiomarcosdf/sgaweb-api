const RecebimentoService = require('../../../services/RecebimentoService');
const OrgaoService = require('../../../services/OrgaoService');
const { formatToFloat, customCpf } = require('../../../common/helpers');

let orgaosList = [];

async function insertRegister(line) {
  const tresPrimeirosCaracteres = line.substr(0, 3);
  let codigoDoOrgao = tresPrimeirosCaracteres;

  if (tresPrimeirosCaracteres === '990') {
    codigoDoOrgao = line.substr(62, 3);
  }

  const orgaoObj = orgaosList.find((orgao) => orgao.codigo === codigoDoOrgao);

  const recebimento = {
    orgao: orgaoObj ? orgaoObj.sigla : 'GDF',
    ano: line.substr(3, 4),
    mes: line.substr(7, 2),
    matricula: line.substr(9, 8),
    cpf: customCpf(line.substr(17, 12)),
    nome: line.substr(29, 33).trim(),
    controle: line.substr(62, 3),
    lotacao: line.substr(65, 12),
    rubrica: line.substr(77, 5),
    parcela: line.substr(82, 3),
    valor: formatToFloat(line.substr(85, 11))
  };

  return await RecebimentoService.insertRecebimento(recebimento);
}

async function saveToDB(lines) {
  const recebimentoExist = await RecebimentoService.getByPeriod(
    lines[0].substr(3, 4),
    lines[0].substr(7, 2),
    lines[0].substr(77, 5)
  );

  if (recebimentoExist <= 0) {
    for (var line = 0; line < lines.length - 1; line++) {
      await insertRegister(lines[line]);
    }
  }
}

async function processFile(file) {
  const { createReadStream } = await file;
  const stream = await createReadStream(file.filename, 'utf8');
  let data = '';

  stream
    .on('data', (chunk) => (data += chunk))
    .on('end', () => {
      const lines = data.split('\n');
      saveToDB(lines)
        .then(() => console.log('Add register import.'))
        .catch((error) => console.log('erro add archive ' + error));
    });

  return file;
}

module.exports = {
  Query: {
    file: () => null,
    recebimentos: async () => await RecebimentoService.getAll(),
    recebimento: async (_, { id }) => await RecebimentoService.getById(id),
    recebimentoPeriodo: async (_, { ano, mes }) =>
      await RecebimentoService.getByPeriodFull(ano, mes),
    recebimentoFiltro: async (_, { filtro }) => {
      const { mes, ano, orgao, rubrica, matricula } = filtro;

      let newFilter = { mes, ano };
      if (orgao) {
        newFilter = { ...newFilter, orgao };
      }
      if (rubrica) {
        newFilter = { ...newFilter, rubrica };
      }
      if (matricula) {
        newFilter = { ...newFilter, matricula };
      }

      return await RecebimentoService.getFilters(newFilter);
    },
    recebidos: async (_, { ano, mes, rubrica }) =>
      await RecebimentoService.isRecebido(ano, mes, rubrica),
    recebimentoOrgao: async (_, { orgao }) =>
      await RecebimentoService.getByOrgao(orgao),
    recebimentoMatricula: async (_, { matricula }) =>
      await RecebimentoService.getByMatricula(matricula),

    totaisMensais: async (_, { ano }) => await RecebimentoService.getTotais(ano),
    totalMensalPorEmpresa: async (_, { ano, mes }) => await RecebimentoService.getTotaisPorEmpresa(ano, mes),
  },
  Mutation: {
    uploadFile: async (_, { file }) => {
      orgaosList = await OrgaoService.getAll();

      const upload = await processFile(file);
      return upload;
    },
    insertRecebimento: async (_, { data }) =>
      await RecebimentoService.insertRecebimento(data),
    deleteRecebimento: async (_, { id }) =>
      await RecebimentoService.deleteRecebimento(id),
    deleteRecebimentos: async (_, { ano, mes }) =>
      await RecebimentoService.deleteRecebimentos(ano, mes)
  }
};
