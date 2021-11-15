import { FastifyInstance } from 'fastify'
import * as fs from './fs'
import * as path from 'path'
import { FSWatcher, watch } from 'chokidar'
import * as LanguageRequestParser from 'accept-language-parser'
import * as Router from 'find-my-way'

import { LocaleContainer, LocaleRequest, willRequestRedirectToDefault, redirectToDefault, LocaleDocument } from './locale'
import { ControllerContainer } from './controller'
import { ViewContainer } from './view'
import { render } from './controller'

import { INVALID_FILE_PATH, CONFIGURATION_REQUIRED } from './exception'

export interface ApplicationOption {
  mode: 'development' | 'production'

  endpoint?: {
    host?: string
    port?: number
  }

  namespace?: string

  locale?: {
    default?: string
    directory?: string
  }
}

export class Watcher {
  constructor(app: Application) {

  }
}

export class Application {
  server: FastifyInstance
  option: ApplicationOption

  namespace: string | null
  mode: 'development' | 'production'

  root: string
  base: string

  locale: LocaleContainer
  controller: ControllerContainer
  view: ViewContainer

  watcher: Watcher

  constructor(server: FastifyInstance, option: ApplicationOption) {
    this.server = server
    this.option = option

    this.namespace = this.option.namespace || null
    this.mode = this.option.mode || 'development'

    this.root = path.resolve('.')
    this.base = this.resolve(this.namespace || '.')

    this.locale = new LocaleContainer(this)
    this.controller = new ControllerContainer(this)
    this.view = new ViewContainer(this)

    this.watcher = new Watcher(this)
  }

  resolve(target: string, separator: string = path.sep) {
    const base = this.base || this.root

    if (path.isAbsolute(base)) {
      return path.posix.join(base, '.' + path.posix.normalize('/' + target))
        .replace(/[\\\/]+/g, separator)
    }

    return path.posix.resolve(base, '.' + path.posix.normalize('/' + target))
      .replace(/[\\\/]+/g, separator)
  }

  async hookLocaleDirectory(directory: string) {
    if (!this.option?.locale?.default) {
      throw new CONFIGURATION_REQUIRED('locale.default')
    }

    for (const descriptor of await fs.readdirRecursive(directory)) {
      if (descriptor.ext !== '.yaml') {
        continue
      }

      const [type, ...slug] = descriptor.relative.split(path.sep)

      const container = this.locale.findOrCreate(type)
      const name = slug.filter(node => node.trim().length).join('/')

      container.document.set(name, await fs.yaml(descriptor.absolute) as LocaleDocument)
    }
  }

  async hookControllerDirectory(directory: string) {
    for (const descriptor of await fs.readdirRecursive(directory)) {
      if (descriptor.ext !== '.js') {
        continue
      }


    }
  }

  async hookViewDirectory(directory: string) {
    for (const descriptor of await fs.readdirRecursive(directory)) {
      if (descriptor.ext !== '.jsx') {
        continue
      }


    }
  }

  async compile() {

  }

  static async from(path: string, server: FastifyInstance) {
    if (!await fs.exists(path)) {
      throw new INVALID_FILE_PATH(path)
    }

    // TODO: Validate options against a schema, and attach a reload function if development mode is ON.

    return new Application(server, await fs.yaml(path) as any as ApplicationOption)
  }
}


export function handlePublicRequests(server: FastifyInstance, option: any, next: any) {
  console.log('hooking public directory requests')

  server.get('/', (request, response) => {
    console.log('public request')

    response.send({
      result: 'default public request'
    })
  })

  server.setNotFoundHandler(async function (request, reply) {
    reply.status(409).send('not found public error')
  })

  server.setErrorHandler(async function (error, request, reply) {
    this.log.error(error)

    reply.status(409).send('custom public error')
  })

  next()
}

export function handleApiRequests(server: FastifyInstance, option: any, next: any) {
  console.log('hooking api requests')

  server.get('/', (request, response) => {
    console.log('api request')

    response.send({
      result: 'default api request'
    })
  })

  server.setNotFoundHandler(async function (request, reply) {
    reply.status(409).send('not found api error')
  })

  server.setErrorHandler(async function (error, request, reply) {
    this.log.error(error)

    reply.status(409).send('custom api error')
  })

  next()
}

export function handleControllerRequests(server: FastifyInstance, option: any, next: any) {
  server.decorateReply('render', render)

  server.addHook<LocaleRequest>('onRequest', (request, response, done) => {
    const enabled = server.app.locale.enabled

    const locale = request.params.locale
    const remote_address = request.headers['x-forwarded-for'] || request.ip
    const language = LanguageRequestParser.parse(request.headers['accept-language'])

    if ((!enabled && !locale) || locale !== server.app.locale.default) {
      // TODO: If locale is a valid locale, then replace it.
      return response.redirect(301, `/${server.app.locale.default}${request.url}`)
    }

    // TODO: Decorate request with locale we targetted for.

    console.log('locale requested:', locale)
    console.log('remote_address:', remote_address)
    console.log('accepts_languages:', language)

    done()
  })

  server.get<LocaleRequest>('/', (request, response) => {
    response.render('page/landing')
  })

  server.setNotFoundHandler(async function (request, reply) {
    reply.status(409).send('not found error')
  })

  server.setErrorHandler(async function (error, request, reply) {
    this.log.error(error)

    reply.status(409).send('custom error')
  })

  next()
}
