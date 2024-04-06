import path from 'path';

import { api, InitOptions } from '@electron-forge/core';
// eslint-disable-next-line node/no-unpublished-import
import { confirm, input, select } from '@inquirer/prompts';
import program from 'commander';
import fs from 'fs-extra';

import './util/terminate';
import workingDir from './util/working-dir';

(async () => {
  let dir = process.cwd();
  program
    .version((await fs.readJson(path.resolve(__dirname, '../package.json'))).version)
    .arguments('[name]')
    .option('-t, --template [name]', 'Name of the Forge template to use')
    .option('-c, --copy-ci-files', 'Whether to copy the templated CI files (defaults to false)', false)
    .option('-f, --force', 'Whether to overwrite an existing directory (defaults to false)', false)
    .parse(process.argv);

  const isInteractive = process.stdout.isTTY;

  if (!isInteractive) {
    // Non-interactive mode
    program.action((name) => {
      dir = workingDir(dir, name, false);
    });
  } else {
    // Interactive mode
    const nameInput = await input({
      message: 'Enter a directory name:',
    });

    dir = workingDir(dir, nameInput, false);

    // const templateInput = await input({
    //   message: 'Enter the name of the Forge template to use (press Enter for default):',
    // });
    const doYouWantToUseTemplate = await confirm({ message: 'Do you want to use a template?', default: false });
    if (doYouWantToUseTemplate) {
      const templateInput = await select({
        message: 'Which template do you wanna use?',
        choices: [
          {
            name: 'vite',
            value: 'vite',
            description: 'Create a new Electron app with Vite.',
          },
          {
            name: 'vite-typescript',
            value: 'vite-typescript',
            description: 'Create a new Electron app with Vite and TypeScript.',
          },
          {
            name: 'webpack',
            value: 'webpack',
            description: 'Create a new Electron app with Webpack.',
          },
          {
            name: 'webpack-typescript',
            value: 'webpack-typescript',
            description: 'Create a new Electron app with webpack and TypeScript.',
          },
        ],
      });
      program.template = templateInput;
    } else {
      program.template = undefined;
    }
  }

  const initOpts: InitOptions = {
    dir,
    interactive: isInteractive,
    copyCIFiles: !!program.copyCiFiles,
    force: !!program.force,
  };
  if (program.template) initOpts.template = program.template;

  await api.init(initOpts);
})();
