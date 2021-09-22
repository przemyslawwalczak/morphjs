import fastify, { RouteOptions, FastifySchema, HTTPMethods, FastifyRequest, FastifyReply, RouteHandlerMethod, FastifyContextConfig, FastifyError, FastifyInstance, FastifySchemaCompiler, LogLevel, onErrorHookHandler, onRequestHookHandler, onResponseHookHandler, onSendHookHandler, onTimeoutHookHandler, preHandlerHookHandler, preParsingHookHandler, preSerializationHookHandler, preValidationHookHandler } from "fastify";
import * as path from 'path'

import fs from '../lib/fs'
import Config from '../lib/config'
import { Renderer } from './renderer'

export type Schema = FastifySchema
export type RequestMethod = HTTPMethods
export type Request = FastifyRequest
export type Response = FastifyReply & {
   renderer: Renderer
}

/**
 * Controller type interface extending RouteOptions of Fastify.
 */
export interface Controller extends RouteOptions
{

}

/**
 * Controller abstract class for defining controllers on the endpoint.
 */
export abstract class Controller
{
   method: RequestMethod | RequestMethod[];
   url: string;

   abstract handler(request: Request, response: Response)

   /**
    * Rendering of html template file handled by internal renderer.
    * @param template - Template name relative to the path in "view" directory.
    * @param data  - Data to render the template with.
    */
   async render(response: Response, name: string, data: any = {})
   {
      response.status(200)
      response.type('text/html')

      return await response.renderer.external(name, data)
   }
}

/**
 * Creation of Fastify instance based on a configuration file.
 * @param configuration_absolute_path 
 * @returns Configured Fastify instance
 */
export async function CreateEndpoint(configuration_absolute_file_path: string)
{
   const config = await Config.app(configuration_absolute_file_path)

   const endpoint = fastify(config.engine as any)

   const view = path.join(process.cwd(), 'view')
   const renderer = new Renderer()

   await renderer.parse(view)

   endpoint.addHook('preHandler', (request, response, callback) => {
      const coerced: Response = response as any

      coerced.renderer = renderer

      callback()
   })

   /**
    * Preparing controller directory and initializing controllers with prototype of Controller.
    */
   const controllers = path.join(process.cwd(), 'controller')

   for (const path of await fs.readdir(controllers, true))
   {
      /**
       * Skipping on controllers that are not javascript files.
       */
      if (path.ext !== '.js') continue

      const module: any = require(path.absolute)

      /**
       * Insanity checks if the file was properly exported.
       * NOTE: Nodejs by default might return an empty module if the file was/is empty.
       */
      if (module == null) continue

      /**
       * Searching for valid prototypes of a controller to register on the server endpoint.
       */
      for (const value of Object.values(module))
      {
         if (Object.getPrototypeOf(value) === Controller)
         {
            /**
             * Construction of a controller extending base Controller class.
             */
            const controller: Controller = new (value as any)()

            endpoint.route({
               url: controller.url,
               method: controller.method,

               handler: async (request, response) => {
                  return await controller.handler(request as any, response as any)
               }
            })
         }
      }
   }

   /**
    * Returning Promise resolution on endpoint listen to configured endpoint port and host.
    */

   return await endpoint.listen(config.endpoint.port, config.endpoint.host)
   .then(address => {
      // TODO: Properly logged instance based on configuration file.

      console.log(`${config.app.name} :: Listening: ${address}`)

      return endpoint
   })
}
