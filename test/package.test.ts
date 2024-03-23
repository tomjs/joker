import path from 'node:path';
import fs from 'fs-extra';
import type { CjsCmdOptions } from '../src/cjs';
import { runPackageAction } from '../src/cjs';

const SRC_DIR = path.join(__dirname, 'fixtures', 'package');
const TEST_DIR = path.join(__dirname, '.temp', 'package');

const defaultOptions: CjsCmdOptions = {
  workspaces: [],
  onlyTypes: false,
  commonjs: false,
  prod: true,
  dev: false,
  exclude: [],
  include: [],
};

beforeAll(() => {
  fs.mkdirpSync(TEST_DIR);
});

it('cjs [pure-esm]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm'), dest);

  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
  });
  expect(true).toBe(true);
});

it('cjs --only-types [pure-esm-types]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm-types');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm'), dest);

  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
    onlyTypes: true,
  });
  expect(true).toBe(true);
});

it('cjs --commonjs [pure-esm]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm-commonjs');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm'), dest);

  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
    commonjs: true,
  });
  expect(true).toBe(true);
});

it('cjs [pure-esm-complex]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm-complex');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm-complex'), dest);
  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
  });
  expect(true).toBe(true);
});

it('cjs --commonjs [pure-esm-complex]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm-complex-commonjs');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm-complex'), dest);

  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
    commonjs: true,
  });
  expect(true).toBe(true);
});
