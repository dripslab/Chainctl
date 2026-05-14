#!/usr/bin/env node

const { Command } = require("commander");
const { createKeypairCommand } = require("./commands/keypair");
const { createBalanceCommand } = require("./commands/balance");
const { createFriendbotCommand } = require("./commands/friendbot");
const { createSendCommand } = require("./commands/send");
const { printError } = require("./output/json");

const program = new Command();

program
  .name("chainctl")
  .description("A command-line toolkit for Stellar developers.")
  .version("0.1.0")
  .option("-n, --network <network>", "Stellar network to use: testnet or mainnet", "testnet")
  .option("--pretty", "Render supported output as a table");

program.addCommand(createKeypairCommand());
program.addCommand(createBalanceCommand());
program.addCommand(createFriendbotCommand());
program.addCommand(createSendCommand());

program.parseAsync(process.argv).catch((error) => {
  printError(error.message);
  process.exitCode = 1;
});
