import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const getFilename = () => fileURLToPath(import.meta.url);
const getDirname = () => path.dirname(getFilename());

export const CLI_ROOT = path.join(getDirname(), '..');

export const CLI_PKG = readJson(path.join(CLI_ROOT, 'package.json'));

export const CLI_VERSION: string = CLI_PKG.version;

export function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function writeJson(filePath: string, data: any) {
  fs.writeFileSync(
    filePath,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    'utf8',
  );
}

export function removeShortOptions(opts: any) {
  Object.keys(opts).forEach(key => {
    if (key.length === 1 || key === '--') {
      delete opts[key];
    }
  });
  return opts;
}
