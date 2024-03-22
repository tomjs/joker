import util from 'node:util';
import chalk from 'chalk';

const PREFIX = '🤡 ';
process.stdout.write('\x1b[1A');

interface LoggerOptions {
  prefix?: string;
  suffix?: string;
}

export class Logger {
  private prefix?: string;
  private suffix?: string;

  constructor(options?: LoggerOptions) {
    const opts = Object.assign({}, options);
    this.prefix = opts.prefix ?? '';
    this.suffix = opts.suffix ?? '';
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  setSuffix(suffix: string) {
    this.suffix = suffix;
  }

  clearPrefix() {
    this.prefix = undefined;
  }

  clearSuffix() {
    this.suffix = undefined;
  }

  private format(args: any[], prefix?: string) {
    const fullPrefix = [PREFIX, prefix]
      .filter(s => s)
      .map(s => `${s} `)
      .join('');

    if (this.suffix && this.suffix) {
      args[0] += ` ${this.suffix}`;
    }

    return (
      fullPrefix +
      util
        .format('', ...args)
        .split('\n')
        .join('\n' + fullPrefix + ' ')
    );
  }

  log(...args: any[]) {
    console.log(this.format(args));
  }

  error(...args: any[]) {
    console.error(this.format(args, chalk.red(this.prefix || 'error')));
  }

  info(...args: any[]) {
    console.info(this.format(args, chalk.cyan(this.prefix || 'info')));
  }

  success(...args: any[]) {
    console.log(this.format(args, chalk.green(this.prefix || 'success')));
  }

  warn(...args: any[]) {
    console.warn(this.format(args, chalk.yellow(this.prefix || 'warn')));
  }
}
