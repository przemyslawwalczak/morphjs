import * as path from 'path'
import fs from './fs'
import * as acorn from 'acorn'
import * as jsx from 'acorn-jsx'

const jsxOptions = {
   allowNamespacedObjects: true,
   allowNamespaces: true
}

const parser = acorn.Parser.extend(jsx(jsxOptions))

class Template
{
   async parse(content: string)
   {
      const tokens = []

      // TODO: Parse better tokens that are descriptful.
      // TODO: Bundle server code.
      // TODO: Bundle client code.
      // TODO: Expose server render code.
      // TODO: Expose client render code + boilerplate wrappers.
      // TODO: Avoid exporting whole classes but only the functions needed in order to make the interactions with dom.
      // TODO: Explain the Elements and their context.

      parser.parse(content, {
         ecmaVersion: 'latest',
         sourceType: 'module',

         onToken: tokens
      })

      console.log(tokens.length)
      
      for (const token of tokens)
      {
         console.log(token)
         break
      }

      return true
   }

   async render(data: any)
   {

   }
}

export class Renderer
{
   template: Map<string, Template>

   // TODO: Server/Internal bundle
   // TODO: Client/External bundle

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