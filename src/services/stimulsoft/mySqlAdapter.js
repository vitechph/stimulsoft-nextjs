/* eslint-disable guard-for-in */
export function test() {
  console.log('testing mysql');
}

export function process(command, onResult) {
  const end = function (result) {
    try {
      if (connection) {
        connection.end();
      }
      onResult(result);
    } catch (e) {}
  };

  const onError = function (message) {
    end({ success: false, notice: message });
  };

  try {
    const connect = function () {
      connection.connect(function (error) {
        if (error) onError(error.message);
        else onConnect();
      });
    };

    const query = function (queryString, timeout) {
      console.log(`USE ${command.connectionStringInfo.database}`);
      connection.query(`USE \`${command.connectionStringInfo.database}\`;`);
      // queryString = queryString.replace(/\'/gi, "\"");

      console.log('Test', connection);
      connection.query(
        { sql: queryString, timeout },
        function (error, rows, fields) {
          if (error) onError(error.message);
          else {
            onQuery(rows, fields);
          }
        }
      );
    };

    const onConnect = function () {
      console.log('Query String: ', command.queryString);
      if (command.queryString) query(command.queryString, command.timeout);
      else end({ success: true });
    };

    const onQuery = function (recordset, fields) {
      const columns = [];
      const rows = [];
      const types = [];
      // var isColumnsFill = false;
      if (fields.length > 0 && Array.isArray(fields[0])) fields = fields[0];

      for (var columnIndex in fields) {
        const column = fields[columnIndex];
        columns.push(column.name);

        switch (column.type) {
          case 0x01: // aka TINYINT, 1 byte
            types[columnIndex] = 'boolean';
            break;

          case 0x02: // aka SMALLINT, 2 bytes
          case 0x03: // aka INT, 4 bytes
          case 0x05: // aka DOUBLE, 8 bytes
          case 0x08: // aka BIGINT, 8 bytes
          case 0x09: // aka MEDIUMINT, 3 bytes
          case 0x10: // aka BIT, 1-8 byte
            types[columnIndex] = 'int';
            break;

          case 0x00: // aka DECIMALc
          case 0xf6: // aka DECIMAL
          case 0x04: // aka FLOAT, 4-8 bytes
            types[columnIndex] = 'number';
            break;

          case 0x0f: // aka VARCHAR (?)
          case 0xfd: // aka VARCHAR, VARBINARY
          case 0xfe: // aka CHAR, BINARY
            types[columnIndex] = 'string';
            break;

          case 0x0a: // aka DATE
          case 0x0b: // aka TIME
          case 0x13: // aka TIME with fractional seconds
          case 0x0c: // aka DATETIME
          case 0x12: // aka DATETIME with fractional seconds
          case 0x0d: // aka YEAR, 1 byte (don't ask)
          case 0x0e: // aka ?
            types[columnIndex] = 'datetime';
            break;

          case 0x07: // aka TIMESTAMP
          case 0x11: // aka TIMESTAMP with fractional seconds
          case 0xf5: // aka JSON
          case 0x06: // NULL (used for prepared statements, I think)
          case 0xf7: // aka ENUM
          case 0xf8: // aka SET
          case 0xff: // aka GEOMETRY
            types[columnIndex] = 'string';
            break;

          /* case 0xf9: // aka TINYBLOB, TINYTEXT
                    case 0xfa: // aka MEDIUMBLOB, MEDIUMTEXT
                    case 0xfb: // aka LONGBLOG, LONGTEXT
                    case 0xfc: // aka BLOB, TEXT
                        types[columnIndex] = "array"; break; */
        }
      }

      if (recordset.length > 0 && Array.isArray(recordset[0]))
        recordset = recordset[0];
      for (const recordIndex in recordset) {
        const row = [];
        for (const columnName in recordset[recordIndex]) {
          // if (!isColumnsFill) columns.push(columnName);
          // eslint-disable-next-line @typescript-eslint/no-redeclare
          var columnIndex = columns.indexOf(columnName);
          // eslint-disable-next-line eqeqeq
          if (types[columnIndex] != 'array')
            types[columnIndex] = typeof recordset[recordIndex][columnName];
          if (recordset[recordIndex][columnName] instanceof Uint8Array) {
            types[columnIndex] = 'array';
            recordset[recordIndex][columnName] = Buffer.from(
              recordset[recordIndex][columnName]
            ).toString('base64');
          }

          if (
            recordset[recordIndex][columnName] != null &&
            typeof recordset[recordIndex][columnName].toISOString === 'function'
          ) {
            recordset[recordIndex][columnName] = recordset[recordIndex][
              columnName
            ].toISOString();
            types[columnIndex] = 'datetime';
          }

          row[columnIndex] = recordset[recordIndex][columnName];
        }
        // isColumnsFill = true;
        rows.push(row);
      }

      end({ success: true, columns, rows, types });
    };

    const getConnectionStringInfo = function (connectionString) {
      const info = { host: 'localhost', port: '3306', charset: 'utf8' };

      for (const propertyIndex in connectionString.split(';')) {
        const property = connectionString.split(';')[propertyIndex];
        if (property) {
          const match = property.split('=');
          if (match && match.length >= 2) {
            match[0] = match[0].trim().toLowerCase();
            match[1] = match[1].trim();

            switch (match[0]) {
              case 'server':
              case 'host':
              case 'location':
                info.host = match[1];
                break;

              case 'port':
                info.port = match[1];
                break;

              case 'database':
              case 'data source':
                info.database = match[1];
                break;

              case 'uid':
              case 'user':
              case 'username':
              case 'userid':
              case 'user id':
                info.userId = match[1];
                break;

              case 'pwd':
              case 'password':
                info.password = match[1];
                break;

              case 'charset':
                info.charset = match[1];
                break;
            }
          }
        }
      }

      return info;
    };

    const mysql = require('mysql');
    command.connectionStringInfo = getConnectionStringInfo(
      command.connectionString
    );

    var connection = mysql.createConnection({
      host: command.connectionStringInfo.host,
      user: command.connectionStringInfo.userId,
      password: command.connectionStringInfo.password,
      port: command.connectionStringInfo.port,
      charset: command.connectionStringInfo.charset,
      database: command.connectionStringInfo.database,
    });

    connect();
  } catch (e) {
    onError(e.stack);
  }
}
