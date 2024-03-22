import type { CAC } from 'cac';

export function runPackageCmd(cli: CAC) {
  const desc = `Let "Pure ESM packages" support both "cjs" and "esm"`;
  cli
    .command('package [dir]', desc)
    .usage(
      `package [dir]

  ${desc}
  The default directory is the current working directory.`,
    )
    .option('--commonjs', `Modify the "type" field value of package.json to "commonjs"`, {
      default: false,
    })
    .action((dir, options) => {
      console.log(dir, options);
    });
}
