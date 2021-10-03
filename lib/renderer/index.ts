import * as path from 'path'
import fs from '../fs'
import { application_config } from '../config'

import { Locale } from '../locale'
import { Template } from './template'
import { Compiler } from './compiler'

const engine = require('../../package.json')

export class Renderer
{
   app: application_config['app']
   engine = {
      author: engine.author,
      name: engine.name,
      version: engine.version,
      description: engine.description,
      keywords: engine.keywords,
      public: `/public/engine-${engine.version}.js`
   }

   template: Map<string, Template>
   entry: Template

   compiler: Compiler

   constructor(config: application_config)
   {
      this.template = new Map()
      this.app = {
         name: config.app.name,
         description: config.app.description
      }
      this.compiler = new Compiler()
   }

   async parse(directory: string, config: application_config)
   {
      const entry = path.join(directory, config.renderer.entry)

      for (const descriptor of await fs.readdir(directory, true))
      {
         if (descriptor.ext !== '.jsx') continue

         const content = await fs.readfile(descriptor.absolute)
         const template = new Template(this)

         template.descriptor = descriptor

         if (!await template.parse(content.toString(), descriptor))
         {
            throw new Error(`Failed to parse template contents`)
         }

         if (entry === descriptor.absolute)
         {
            this.entry = template
            continue
         }

         const id = path.join(descriptor.directory, descriptor.name)
         .split(path.sep)
         .filter(name => name.trim().length)
         .join('/')

         this.template.set(id, template)
      }

      if (this.entry == null)
      {
         throw new Error(`Undefined entry file`)
      }

      for (const template of Array.from(this.template.values()))
      {
         template.context.render = await this.compiler.bundle(this.entry, template)
      }
   }

   async render(name: string, locale: Locale, data: any = {})
   {
      const template = this.template.get(name)

      if (template == null)
      {
         throw new Error(`Undefined template name: ${name}`)
      }

      return await template.render(locale, data)
   }

}