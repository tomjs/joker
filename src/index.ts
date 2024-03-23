#!/usr/bin/env node
import cac from 'cac';
import { runCjsCmd } from './cjs';
import { CLI_PKG, CLI_VERSION } from './utils';

const cli = cac('joker');
cli.usage(`<command> [options]

${CLI_PKG.description}`);

runCjsCmd(cli);

cli.help();
cli.version(CLI_VERSION);

cli.parse();
