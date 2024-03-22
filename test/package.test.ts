import path from 'node:path';
import fs from 'fs-extra';
import { runPackageAction } from '../src/package';

const SRC_DIR = path.join(__dirname, 'fixtures', 'package');
const TEST_DIR = path.join(__dirname, '.temp', 'package');

const defaultOptions = {
  workspaces: [],
  cjs: true,
  commonjs: false,
  prod: true,
  dev: false,
  exclude: [],
  include: [],
  debug: false,
};

beforeAll(() => {
  fs.mkdirpSync(TEST_DIR);
});

it('package --cjs [pure-esm]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm'), dest);

  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
  });
  expect(true).toBe(true);
});

it('package --cjs --commonjs [pure-esm]', async () => {
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

it('package --cjs [pure-esm-complex]', async () => {
  const dest = path.join(TEST_DIR, 'pure-esm-complex');
  fs.emptyDirSync(dest);
  fs.copySync(path.join(SRC_DIR, 'pure-esm-complex'), dest);
  await runPackageAction({
    ...defaultOptions,
    workspaces: [dest],
  });
  expect(true).toBe(true);
});

it('package --cjs --commonjs [pure-esm-complex]', async () => {
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
