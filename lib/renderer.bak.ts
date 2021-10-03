import * as path from 'path'
import fs, { file_descriptor } from './fs'
import { application_config } from './config'

import { Template } from './template'

export class Renderer
{
   template: Map<string, Template>
   entry: Template

   constructor()
   {
      this.template = new Map()
      this.entry = new Template()
   }

   async render(name: string, data: any = {})
   {
      const template = this.template.get(name)

      if (template == null)
      {
         throw new Error(`Template : ${name} not found`)
      }

   }

   async bundle(name: string, data: any = {})
   {

   }

   async parseEntry(content: string, descriptor: file_descriptor)
   {
      // TODO: Add browser engine depndency to entry template if doesn't exists yet.

      if (!await this.entry.parse(content.toString(), descriptor))
      {
         throw new Error(`Failed to parse entry template contents`)
      }


   }

   async parse(directory: string, config: application_config['renderer'])
   {
      const entry = path.join(directory, config.entry)

      for (const descriptor of await fs.readdir(directory, true))
      {
         if (descriptor.ext !== '.jsx') continue

         const content = await fs.readfile(descriptor.absolute)

         if (entry === descriptor.absolute)
         {
            await this.parseEntry(content.toString(), descriptor)
            continue
         }

         const template = new Template()

         if (!await template.parse(content.toString(), descriptor))
         {
            throw new Error(`Failed to parse template contents`)
         }

         const id = path.join(descriptor.directory, descriptor.name)
         .split(path.sep)
         .filter(name => name.trim().length)
         .join('/')

         console.log('registered template:', id)

         await template.merge(this.entry)

         this.template.set(id, template)
      }
   }
}