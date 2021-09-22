import fs from './fs'

interface application_config
{
   app: {
      name: string
      description: string
   }

   endpoint: {
      port: number
      host?: string
   }

   logger: {
      debug: boolean
      directory?: string
   }

   plugins?: any[]

   secure?: {
      enabled: boolean
   }

   engine: {

   }
}

async function app(path: string): Promise<application_config>
{
   const config = await fs.readconfig<application_config>(path)

   // TODO: schema

   return config
}

export default {
   app
}