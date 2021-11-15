import 'source-map-support/register'

import pino from 'pino'

import { FastifyServerOptions, fastify } from 'fastify'
import { Locale } from './locale'
import { Application, handleControllerRequests, handlePublicRequests, handleApiRequests } from './application'

declare module 'fastify'
{
  export interface FastifyInstance {
    app: Application
  }

  export interface FastifyRequest {
    locale: Locale
  }

  export interface FastifyReply {
    render(template: string, data?: any): void | Promise<void>
  }
}

export async function createEndpoint(configurationAbsoluteFilePath: string, option: FastifyServerOptions = {}) {
  if (option.logger == null) {
    option.logger = pino({ level: 'info' })
  }

  const server = fastify(option)
  const app = server.app = await Application.from(configurationAbsoluteFilePath, server)

  const { locale } = app.option

  await app.hookLocaleDirectory(app.resolve(locale?.directory || 'locale'))
  await app.hookControllerDirectory(app.resolve('controller'))
  await app.hookViewDirectory(app.resolve('view'))

  // TODO: Register plugins
  // TODO: Load controllers

  await app.compile()

  await server.register(handlePublicRequests, {
    prefix: '/public'
  })

  await server.register(handleApiRequests, {
    prefix: '/api'
  })

  await server.register(handleControllerRequests, {
    prefix: '/:locale'
  })

  await server.listen(app.option.endpoint?.port || 80, app.option.endpoint?.host || 'localhost')
}

export { Controller } from './controller'
export * as Locale from './locale'