import { Application } from './application'
import { FastifyRequest, FastifyReply } from 'fastify'
import { AbstractController } from './controller'
import * as LanguageRequestParser from 'accept-language-parser'

export interface LocaleRequest {
  Params: {
    locale: string
  }
}

export interface LocaleDocument {
  [key: string]: any
}

export class Locale {
  language: string | undefined
  region: string | undefined

  document: Map<string, LocaleDocument>

  constructor() {
    this.document = new Map()
  }
}

export class LocaleContainer {
  enabled: boolean = true

  directory: Map<string, Locale>
  default: string

  constructor(app: Application) {
    this.directory = new Map()
    this.default = app.option.locale?.default || 'en'
  }

  findOrCreate(type: string) {
    const hasResult = this.directory.has(type)
    const result = this.directory.get(type) || new Locale()

    if (!hasResult) {
      const [language, region] = type.split('-')

      result.language = language
      result.region = region

      this.directory.set(type, result)
    }

    return result
  }

  map(callback: (result: Locale) => Locale) {
    for (const locale of this.directory.values()) {
      callback(locale)
    }
  }
}

export class LocaleKeyRoute {
  constructor(key: string, target?: string | Locale) {

  }
}

export function Controller(key: string = 'route', target?: string | Locale) {
  return class LocaleKeyRouteController extends AbstractController {
    readonly route: LocaleKeyRoute = new LocaleKeyRoute(key, target)
  }
}

export function willRequestRedirectToDefault(request: FastifyRequest<LocaleRequest>): boolean {
  const locale = request.params.locale
  const remote_address = request.headers['x-forwarded-for'] || request.ip
  const language = LanguageRequestParser.parse(request.headers['accept-language'])

  console.log('locale requested:', locale)
  console.log('remote_address:', remote_address)
  console.log('accepts_languages:', language)

  if (!language.length && !locale) {
    return true
  }

  if (language.length && !locale) {

  }

  // if (locales[locale] == null)
  // {
  //    // TODO: Instead of default set language, set the language based on locale, otherwise default.
  //    return reply.redirect(301, `/${locales.default}${request.url}`)
  // }

  // if (request.url.indexOf('/', locale.length + 1) === -1)
  // {
  //    return reply.redirect(301, request.url + '/')
  // }

  return false
}

export function redirectToDefault(request: FastifyRequest, response: FastifyReply) {

}
