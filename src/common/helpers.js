exports.generateMatricula = function (key) {
  const d = new Date();
  let number = d.getSeconds() + 1;

  if (key) {
    number = number * key;
  }

  const threeParts1 = Math.round(Math.random() * number)
    .toString()
    .substr(0, 2);
  const threeParts2 = Math.round(Math.random() * (number - key) * 88)
    .toString()
    .substr(2, 2);

  return `${threeParts1}${threeParts2}`;
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
