const chalk = require("chalk");

function getChalk(stream) {
  return new chalk.Instance({ level: stream.isTTY ? chalk.level : 0 });
}

function colourText(text, level = "success", stream = process.stdout) {
  const terminal = getChalk(stream);

  if (level === "error") {
    return terminal.red(text);
  }

  if (level === "warning") {
    return terminal.yellow(text);
  }

  if (level === "success") {
    return terminal.green(text);
  }

  return text;
}

function printJson(payload, options = {}) {
  const stream = options.stream || process.stdout;
  const level = options.level || "success";
  const output = JSON.stringify(payload, null, 2);

  stream.write(`${colourText(output, level, stream)}\n`);
}

function printError(message) {
  process.stderr.write(`${colourText(message, "error", process.stderr)}\n`);
}

function printSuccess(message) {
  process.stdout.write(`${colourText(message, "success", process.stdout)}\n`);
}

function printWarning(message) {
  process.stderr.write(`${colourText(message, "warning", process.stderr)}\n`);
}

module.exports = {
  colourText,
  printError,
  printJson,
  printSuccess,
  printWarning
};
