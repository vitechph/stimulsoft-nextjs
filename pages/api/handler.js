/* eslint-disable no-param-reassign */
/* eslint-disable no-useless-escape */

const MySQLAdapter = require('../../src/services/stimulsoft/mySqlAdapter');

let response;

export const config = {
  api: {
    externalResolver: true,
  },
};

const onProcess = function (result) {
  console.log(JSON.stringify(result));
  response.end(JSON.stringify(result));
};

const applyQueryParameters = function (
  baseSqlCommand,
  parameters,
  escapeQueryParameters
) {
  if (baseSqlCommand == null || baseSqlCommand.indexOf('@') < 0)
    return baseSqlCommand;

  let result = '';
  while (
    baseSqlCommand.indexOf('@') >= 0 &&
    parameters != null &&
    parameters.length > 0
  ) {
    result += baseSqlCommand.substring(0, baseSqlCommand.indexOf('@'));
    baseSqlCommand = baseSqlCommand.substring(baseSqlCommand.indexOf('@') + 1);

    let parameterName = '';

    while (baseSqlCommand.length > 0) {
      const char = baseSqlCommand.charAt(0);
      if (char.length === 1 && char.match(/[a-zA-Z0-9_-]/i)) {
        parameterName += char;
        baseSqlCommand = baseSqlCommand.substring(1);
      } else break;
    }

    const parameter = parameters.find(
      (parameter) =>
        parameter.name.toLowerCase() === parameterName.toLowerCase()
    );
    if (parameter) {
      if (parameter.typeGroup !== 'number') {
        if (escapeQueryParameters)
          result += `'${parameter.value
            .toString()
            .replace(/\\/gi, '\\\\')
            .replace(/\'/gi, "\\'")
            .replace(/\"/gi, '\\"')}'`;
        else result += `'${parameter.value.toString()}'`;
      } else result += parameter.value.toString();
    } else result += `@${parameterName}`;
  }

  return result + baseSqlCommand;
};

export default function handler(req, res) {
  response = res;
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  response.setHeader(
    'Access-Control-Allow-Methods',
    'POST, GET, OPTIONS, DELETE, PUT'
  );
  response.setHeader('Cache-Control', 'no-cache');

  let data = req.body;

  if (data.indexOf('{') !== 0) {
    data = Buffer.from(
      data.replace(/[A-Za-z]/g, function (c) {
        return String.fromCharCode(
          c.charCodeAt(0) + (c.toUpperCase() <= 'M' ? 13 : -13)
        );
      }),
      'base64'
    ).toString('ascii');
  }

  const command = JSON.parse(data.toString());

  command.queryString = applyQueryParameters(
    command.queryString,
    command.parameters,
    command.escapeQueryParameters
  );

  if (command.database === 'MySQL') MySQLAdapter.process(command, onProcess);
  else
    onResult({
      success: false,
      notice: `Database '${command.database}' not supported!`,
    });
}
