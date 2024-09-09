const { networkInterfaces } = require('os');

exports.generateMatricula = function (key) {
  const d = new Date();
  let number = d.getSeconds() + 1;

  if (key) {
    number = number * key;
  }

  const twoParts = Math.round(Math.random() * number)
    .toString().slice(0, 2);
  const threeParts = Math.round(Math.random() * (number - key) * 88)
    .toString().slice(0, 3);

  return `${twoParts}${threeParts}`;
};

exports.formatToFloat = function (valueString) {
  const endValue = valueString.slice(-2);
  const startValue = valueString.slice(0, -2);

  const value = [startValue, '.', endValue].join('');
  let finalValue;

  try {
    finalValue = parseFloat(value);
  } catch (error) {
    console.log(error);
  }
  return finalValue;
};

exports.formatCurrency = function (valueString) {
  // 17,98
  if (!valueString) return 0;

  return parseFloat(valueString.replace(',', '.'));
}

exports.numberOnly = function (valueString) {
  return valueString.replace(/[^0-9]/g, '');
}

exports.customCpf = function (valueString) {
  const value = valueString.substr(1, valueString.length);
  return value;
};

exports.formatCpf = function (cpf) {
  if (!cpf) return '';

  const numberCpf = cpf.replace(/[^0-9]/g, '');

  if (numberCpf.length == 10) return '0'+numberCpf;
  if (numberCpf.length == 9) return '00'+numberCpf;
  if (numberCpf.length == 8) return '000'+numberCpf;

  return numberCpf;
}

exports.getIpAddress = function () {
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object
  
  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name].push(net.address);
          }
      }
  }

  //console.log(results['vEthernet (WSL)'][0]);
  
  return {
    ethernet: results.Ethernet[0],
    wsl: results['vEthernet (WSL)'][0]
  }
};