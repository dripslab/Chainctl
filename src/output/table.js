const Table = require("cli-table3");
const { colourText } = require("./json");

function printTable({ head, rows }, options = {}) {
  const stream = options.stream || process.stdout;
  const level = options.level || "success";
  const table = new Table({
    head,
    wordWrap: true,
    ...(options.tableOptions || {})
  });

  for (const row of rows) {
    table.push(row);
  }

  stream.write(`${colourText(table.toString(), level, stream)}\n`);
}

module.exports = {
  printTable
};
