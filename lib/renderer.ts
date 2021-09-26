import * as path from 'path'
import fs from './fs'

import { Template } from './template'

export class Renderer
{
   template: Map<string, Template>

   constructor()
   {
      this.template = new Map()
   }

   async render(name: string, data: any = {})
   {
      const template = this.template.get(name)

      if (template == null)
      {
         throw new Error(`Template : ${name} not found`)
      }

      return await template.render(data)
   }

   async parse(directory: string)
   {
      for (const descriptor of await fs.readdir(directory, true))
      {
         if (descriptor.ext !== '.jsx') continue

         const template = new Template()
         const content = await fs.readfile(descriptor.absolute)

         console.log('Template :', descriptor.absolute)

         if (!await template.parse(content.toString()))
         {
            throw new Error(`Failed to parse template contents`)
         }

         this.template.set(descriptor.name, template)
      }
   }
}