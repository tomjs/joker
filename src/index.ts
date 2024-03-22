#!/usr/bin/env node
import cac from 'cac';
import { runPackageCmd } from './package';
import { CLI_PKG, CLI_VERSION } from './utils';

const cli = cac('joker');
cli.usage(`joker <command> [options]

${CLI_PKG.description}`);

runPackageCmd(cli);

cli.help();
cli.version(CLI_VERSION);

cli.parse();
