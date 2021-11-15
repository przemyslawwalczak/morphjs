import { Application } from './application'
import { FastifyRequest, FastifyReply } from 'fastify'
import { LocaleKeyRoute } from './locale'

type RouteReturnType = void | Promise<void>

export type Request = FastifyRequest
export type Response = FastifyReply

export class ControllerContainer {
  constructor(app: Application) {

  }
}

export interface AbstractController {
  /**
   * 
   * HTTP Request Methods
   * 
   */

  get(request: Request, response: Response): RouteReturnType
  post(request: Request, response: Response): RouteReturnType
  put(request: Request, response: Response): RouteReturnType
  patch(request: Request, response: Response): RouteReturnType
  delete(request: Request, response: Response): RouteReturnType
  head(request: Request, response: Response): RouteReturnType
  trace(request: Request, response: Response): RouteReturnType
  connect(request: Request, response: Response): RouteReturnType

  /**
   * 
   * Resolution Request Methods
   *
   */

  catch(request: Request, response: Response): RouteReturnType
}

export abstract class AbstractController {
  abstract readonly route: string | LocaleKeyRoute
}

export function Controller(route: string) {
  return class RouteController extends AbstractController {
    readonly route: string = route
  }
}

export async function render(this: Response, template: string, data?: any) {
  const request = this.request

  this.send(`rendering function: id: ${request.id}, ${request.method}: ${request.url}`)
}