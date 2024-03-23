import fs from 'node:fs';
import path from 'node:path';
import type { CAC } from 'cac';
import chalk from 'chalk';
import { build as tsupBuild } from 'tsup';
import { Logger } from './logger';
import { readJson, removeShortOptions, writeJson } from './utils';

export interface CjsCmdOptions {
  commonjs: boolean;
  onlyTypes: boolean;
  prod: boolean;
  dev: boolean;
  workspaces: string[];
  exclude: string[];
  include: string[];
}

const logger = new Logger({ prefix: 'cjs' });

class CjsCmdError extends Error {
  isPackageError = true;
}

export function runCjsCmd(cli: CAC) {
  const desc = `let "Pure ESM packages" support both "cjs" and "esm"`;
  cli
    .command('cjs [...workspaces]', desc)
    .usage(
      `cjs [...workspaces]

  ${desc}
  the default directory is the current working directory.`,
    )
    .option(
      '--only-types',
      `Only add "types" field in package.json to solve the problem that vscode cannot find dts.`,
      {
        default: false,
      },
    )
    .option('--commonjs', `modify the "type" field value of package.json to "commonjs"`, {
      default: false,
    })
    .option('--exclude [exclude]', `do not modify these specified packages`, {
      type: [String],
    })
    .option(
      '--include [include]',
      `only modify these specified packages.If not set, the root directory package.json dependency will be read by default.`,
      {
        type: [String],
      },
    )
    .option('--prod', `read 'dependencies' from package.json`, {
      default: true,
    })
    .option('--dev', `read 'devDependencies' from package.json`, {
      default: false,
    })
    .action(async (workspaces, options) => {
      await runPackageAction(
        Object.assign({ workspaces, exclude: [], include: [] }, removeShortOptions(options)),
      );
    });
}

export async function runPackageAction(opts: CjsCmdOptions) {
  let { workspaces } = opts;
  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    workspaces = [process.cwd()];
  }

  const ROOT = process.cwd();

  const pkgCount = {
    total: 0,
    error: 0,
    pure: 0,
  };

  await Promise.all(
    workspaces.map(async workspace => {
      let workPath = workspace;

      if (!fs.existsSync(workspace)) {
        workPath = path.relative(ROOT, workspace);
        if (!fs.existsSync(workPath)) {
          logger.error(`Cannot find workspace '${workspace}'`);
          return;
        }
      }

      if (workspaces.length > 1) {
        logger.setSuffix(`[${workPath}]`);
      }

      const pkgPath = path.join(workPath, 'package.json');
      if (!fs.existsSync(pkgPath)) {
        logger.error(`Cannot find package.json`);
        return;
      }

      const projectPkg = readJson(pkgPath);
      let depNames: string[] = [];

      if (opts.prod) {
        depNames = depNames.concat(Object.keys(projectPkg.dependencies || {}));
      }
      if (opts.dev) {
        depNames = depNames.concat(Object.keys(projectPkg.devDependencies || {}));
      }

      if (Array.isArray(opts.include) && opts.include.length > 0) {
        depNames = depNames.filter(dep => {
          return opts.include.includes(dep);
        });
      }

      if (Array.isArray(opts.exclude) && opts.exclude.length > 0) {
        depNames = depNames.filter(dep => {
          return !opts.exclude.includes(dep);
        });
      }
      if (depNames.length === 0) {
        logger.error(`no valid dependencies found in workspace`);
        return;
      }

      const modulesPath = path.join(workPath, 'node_modules');

      if (!fs.existsSync(modulesPath)) {
        logger.error(`can't find node_modules in workspace`);
        return;
      }

      await Promise.all(
        depNames.map(async depName => {
          const depPath = path.join(modulesPath, depName);
          const pkgPath = path.join(depPath, 'package.json');
          if (!fs.existsSync(pkgPath)) {
            logger.error(`[${depName}] Cannot find package.json`);
            return;
          }
          const pkg = readJson(pkgPath);
          if (pkg.type !== 'module') {
            return;
          }
          pkgCount.total++;
          try {
            const { onlyTypes } = opts;
            if (onlyTypes) {
              if (pkg.types) {
                logger.info(`[${depName}] has types field, skip it.`);
                if (!opts.commonjs) {
                  return;
                }
              }
            }

            await handlePkg(depPath, pkg, opts);

            if (!pkg.types) {
              logger.warn(`[${depName}] fix types field failed, maybe it's not provided.`);
            }

            if (pkg._pure_esm_) {
              logger.success(`[${depName}] is a pure esm package and has been fixed`);
              pkgCount.pure++;
            } else {
              logger.info(`[${depName}] is a support cjs package.`);
            }
          } catch (e: any) {
            if (e instanceof CjsCmdError) {
              pkgCount.error++;
              logger.error(`[${depName}] ${e?.message || 'handle package.json error'}`);
            } else {
              throw e;
            }
          }

          delete pkg._pure_esm_;
          writeJson(pkgPath, pkg);
        }),
      );
    }),
  );

  logger.clearSuffix();
  if (pkgCount.total === 0) {
    logger.info(' No esm package is found');
  } else {
    if (pkgCount.pure > 0) {
      logger.success(
        `found ${chalk.green(pkgCount.pure)} / ${chalk.blue(pkgCount.total)} pure esm packages`,
      );
    } else {
      logger.info(`found ${chalk.blue(pkgCount.total)} [type="module"] packages`);
    }
    if (pkgCount.error > 0) {
      logger.error(`found ${chalk.red(pkgCount.error)} packages with error`);
    }
  }
}

async function handlePkg(
  depPath: string,
  pkg: any,
  opts: CjsCmdOptions,
): Promise<string | undefined> {
  const CJS_DIST_NAME = 'dist_cjs';
  const CJS_DIST_PATH = path.join(depPath, CJS_DIST_NAME);

  const { exports } = pkg;

  if (opts.commonjs) {
    pkg.type = 'commonjs';
  }

  if (opts.onlyTypes) {
    pkg._pure_esm_ = !pkg.main && !pkg.types;

    if (!pkg.types && exports) {
      const cfg = exports['.'] || exports;
      if (cfg.types) {
        pkg.types = cfg.types;
      } else {
        const obj = cfg.default || cfg.import;
        if (typeof obj === 'object') {
          pkg.types = obj.types;
        }
      }
    }
    return;
  }

  if (pkg.main) {
    return;
  }

  pkg._pure_esm_ = 1;

  if (!exports) {
    if (pkg.module) {
      await getCjsPath(pkg.module);
    }

    if (pkg.main && pkg.module) {
      pkg.exports = {
        require: pkg.main,
        import: pkg.module,
        types: pkg.types,
      };
    } else {
      throw new CjsCmdError(`can't find 'main', 'module' and 'exports' in package.json`);
    }

    return;
  }

  const cfg = exports['.'] || exports;
  const ci = cfg.import || cfg.default;
  const isObj = typeof ci === 'object';
  const esm = isObj ? ci.default : ci;
  if (esm) {
    await getCjsPath(esm);

    if (!cfg.require) {
      pkg._pure_esm_++;
    }
    pkg.module ||= esm;
    cfg.import ||= ci;
    if (isObj) {
      pkg.types ||= cfg.types || ci.types;
      cfg.require ||= {
        default: pkg.main,
        types: pkg.types,
      };
    } else {
      pkg.types ||= cfg.types;
      cfg.require ||= pkg.main;
    }
  }

  if (opts.commonjs) {
    const cfg = exports['.'] || exports;
    if (cfg.default) {
      cfg.import ||= cfg.default;
      delete cfg.default;
    }
  }

  async function getCjsPath(esmPath: string) {
    const name = await esm2cjs(path.join(depPath, esmPath), CJS_DIST_PATH);

    if (!name) {
      throw new CjsCmdError(`convert esm to cjs file failed`);
    }

    pkg.main = `./${CJS_DIST_NAME}/${name}`;
    return;
  }
}

async function esm2cjs(input: string, outDir: string) {
  input = path.relative(process.cwd(), input).replaceAll('\\', '/');
  outDir = path.relative(process.cwd(), outDir).replaceAll('\\', '/');

  return new Promise(resolve => {
    tsupBuild({
      entry: [input],
      outDir,
      format: ['cjs'],
      target: ['es2021', 'node16'],
      shims: true,
      clean: true,
      minify: true,
      dts: false,
      silent: true,
      splitting: true,
      onSuccess: async () => {
        const files = fs.readdirSync(outDir);
        if (files.length) {
          resolve(files[0]);
        }
      },
    });
  });
}
