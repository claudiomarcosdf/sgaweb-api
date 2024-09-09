const RecebimentoService = require('../../../services/RecebimentoService');
const OrgaoService = require('../../../services/OrgaoService');
const { formatCurrency, formatCpf } = require('../../../common/helpers');

function getRecebimento(line) {
  const recebimento = {
    orgao: line[7].trim(),
    ano: line[5].substr(6, 4),
    mes: line[5].substr(3, 2),
    matricula: line[2].slice(-8), //os últimos 8 caracteres
    cpf: formatCpf(line[3]),
    nome: line[1].trim(),
    rubrica: line[17],
    parcelas: line[9],
    valor: formatCurrency(line[12]),
    status: line[13].toUpperCase(),
    situacaoservidor: line[19]
  };

  return recebimento;
}

async function insertRegister(line) {
  const recebimento = getRecebimento(line);
  const orgaoExiste = await OrgaoService.getByNome(recebimento.orgao);

  if (!orgaoExiste) {
    await OrgaoService.createOrgao(recebimento.orgao);
  }

  return await RecebimentoService.insertRecebimento(recebimento);
}

async function saveToDB(lines) {
  //A linha 0 é o cabeçalho

  const dadosPrimeiraLinha = lines[1].split(';');
  const recebimento = getRecebimento(dadosPrimeiraLinha);

  //  console.log(recebimento);
  const recebimentoExist = await RecebimentoService.getByPeriod(
    recebimento.ano,
    recebimento.mes,
    recebimento.rubrica
  );

  if (recebimentoExist <= 0) {
    for (var line = 1; line < lines.length - 1; line++) {
      await insertRegister(lines[line].split(';'));
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
      const { mes, ano, orgao, rubrica, matricula, status } = filtro;

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
      if (status) {
        newFilter = { ...newFilter, status };
      }

      return await RecebimentoService.getFilters(newFilter);
    },
    recebidos: async (_, { ano, mes, rubrica }) =>
      await RecebimentoService.isRecebido(ano, mes, rubrica),
    recebimentoOrgao: async (_, { orgao }) =>
      await RecebimentoService.getByOrgao(orgao),
    recebimentoMatricula: async (_, { matricula }) =>
      await RecebimentoService.getByMatricula(matricula),

    inadimplentes: async (_, { ano, mes }) =>
      await RecebimentoService.getInadimplentes(ano, mes),

    totaisMensais: async (_, { ano }) =>
      await RecebimentoService.getTotais(ano),
    totalMensalPorEmpresa: async (_, { ano, mes }) =>
      await RecebimentoService.getTotaisPorEmpresa(ano, mes)
  },
  Mutation: {
    uploadFile: async (_, { file }) => {
      //const { filename, createReadStream } = await file;
      //orgaosList = await OrgaoService.getAll();

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
