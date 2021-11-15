#!/usr/bin/env node

import yargs from 'yargs'
import { createEndpoint } from '../index'
import * as path from 'path'

const command = {
  start: {
    async parse(yargs: any) {
      return yargs.positional('$name', {
        type: 'string',
        describe: 'app encapsulation file',
        default: 'app.yaml | app.js'
      })
    },

    async handle(argv: any) {
      createEndpoint(path.join(process.cwd(), argv.$name))
        .catch(e => console.error('Shell Error:', e))
    }
  }
}

yargs(process.argv.slice(2))
  .scriptName('morph')
  .command('start <$name>', 'start application', command.start.parse, command.start.handle)
  .command('list', 'list currently running applications', command.start.parse, command.start.handle)
  .command('stop <$name>', 'stop application', command.start.parse, command.start.handle)
  .command('restart <$name>', 'restart application', command.start.parse, command.start.handle)
  .command('remove <$name>', 'remove application from deamon', command.start.parse, command.start.handle)
  .demandCommand()
  .argv