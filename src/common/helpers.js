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

exports.customCpf = function (valueString) {
  const value = valueString.substr(1, valueString.length);
  return value;
};
