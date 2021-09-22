import fs, { file_descriptor } from './fs'
import * as vm from 'vm'
import * as AST from 'html-parse-stringify'
import * as prettify from 'pretty'
import * as yaml from 'js-yaml'
import * as encode from 'escape-html'

interface metadata
{
   title: string
   tags: any[]
}

class Sandbox
{
   context: {
      renderer: Renderer
      render?: (data: any) => string

      console
      name?: string
   }

   script: string = ''
   virtual: vm.Context

   constructor(renderer: Renderer)
   {
      this.context = {
         console,
         // console: {
         //    error: () => {},
         //    log: () => {},
         //    info: () => {}
         // },
         renderer
      }

      this.virtual = vm.createContext(this.context)
   }

   append(code: string)
   {
      this.script += code + '\r\n'
      return this
   }

   async render(data: any = {})
   {
      if (typeof this.context.render !== 'function')
      {
         throw new Error(`Invalid virtual template renderer function`)
      }

      return await this.context.render(data)
   }
}

export class Template
{
   sandbox: Sandbox

   constructor(context: Renderer)
   {
      this.sandbox = new Sandbox(context)
   }

   _metadata(node: any)
   {

   }

   _locale(node: any)
   {

   }

   _title(node: any)
   {

   }

   _script(node: any)
   {
      if (node.attrs.sandbox == null)
      {
         this.sandbox.append(`html += '<script${this._attributes(node)}>';`)

         for (const children of node.children)
         {
            if (children.type === 'text')
            {
               this._text(children, false)
            }
         }

         this.sandbox.append(`html += '</script>';`)

         return
      }

      this.sandbox.append(`try {`)

      for (const children of node.children)
      {
         // if (children.type === 'tag')
         // {
         //    this._tag(children)
         //    continue
         // }

         if (children.type === 'text')
         {
            this.sandbox.append(children.content)
         }
      }

      this.sandbox.append(`} catch(e) { console.error(e); }`)
   }

   _render(node: any)
   {
      this.sandbox.append(`html += await renderer.internal('${node.attrs.template}', this);`)
   }

   _element(node: any)
   {
      if (node.voidElement)
      {
         return this.sandbox.append(`html += '<${node.name}${this._attributes(node)} />';`)
      }

      this.sandbox.append(`html += '<${node.name}${this._attributes(node)}>';`)

      for (const children of node.children)
      {
         if (children.type === 'tag')
         {
            this._tag(children)
            continue
         }

         if (children.type === 'text')
         {
            this._text(children)
            continue
         }
      }

      this.sandbox.append(`html += '</${node.name}>';`)
   }

   _tag(node: any)
   {
      switch (node.name)
      {
         case 'app:metadata': return this._metadata(node)
         case 'app:locale': return this._locale(node)
         case 'title': return this._title(node)
         case 'script': return this._script(node)
         case 'render': return this._render(node)

         default: return this._element(node)
      }
   }

   _text(node: any, escaped: boolean = true)
   {
      if (!escaped)
      {
         this.sandbox.append(`html += '${node.content.trim().replace(/[\\$'"]/g, "\\$&")}';`)
      } else {
         this.sandbox.append(`html += '${encode(node.content.trim())}';`)
      }
   }

   _attributes(node: any)
   {
      const keys = Object.keys(node.attrs)

      if (keys.length === 0)
      {
         return ''
      }

      let body = ' '

      body += keys.map(key => {
         const value = node.attrs[key].trim()

         if (value.length === 0)
         {
            return `${key}`
         }

         if (value.indexOf('{') === 0 && value.lastIndexOf('}') === value.length - 1)
         {
            return `${key}=${value}`
         }

         return `${key}="${value}"`
      })
      .join(' ')

      return body
   }

   async parse(file: file_descriptor): Promise<boolean>
   {
      const content = await fs.readfile(file.absolute)

      this.sandbox.context.name = file.absolute

      this.sandbox.append('async function render(data = {}) {')
      this.sandbox.append('let html = ``;')

      for ( const node of AST.parse(content.toString('utf-8')) )
      {
         if (node.type === 'tag')
         {
            this._tag(node)
            continue
         }

         if (node.type === 'text')
         {
            this._text(node)
            continue
         }
      }

      this.sandbox.append('return html;')
      this.sandbox.append('}')

      console.log(this.sandbox.script)

      vm.runInContext(this.sandbox.script, this.sandbox.context)

      return true
   }

   async render(data: any = {}, pretty: boolean = false)
   {
      if (pretty)
      {
         return prettify(await this.sandbox.render(data))
      }

      return await this.sandbox.render(data)
   }
}

export class Renderer
{
   template: Map<string, Template>

   constructor()
   {
      this.template = new Map()
   }

   async parse(directory: string)
   {

      for (const file of await fs.readdir(directory, true))
      {
         if (file.ext !== '.html')
         {
            continue
         }

         const template = new Template(this)

         if (!await template.parse(file))
         {
            // console.error(template.error)
            continue
         }

         console.log('registered template:', file.name)

         this.template.set(file.name, template)
      }

   }

   async internal(name: string, data: any)
   {
      const template = this.template.get(name)

      if (template == null)
      {
         throw new Error(`Template not found: ${name}`)
      }

      return await template.render(data, false)
   }

   async external(name: string, data: any)
   {
      const template = this.template.get(name)

      if (template == null)
      {
         throw new Error(`Template not found: ${name}`)
      }

      const start = process.hrtime.bigint()

      const result = await template.render(data, false)
      
      console.log('rendered in:', parseInt((process.hrtime.bigint() - start).toString()) / 1000000, 'ms')

      return result
   }
}
