import { Template, Container, Expression } from './template'
import * as vm from 'vm'
import * as fs from 'fs'

class Builder
{
   script: string[] = []

   push(snippet: string)
   {
      this.script.push(snippet)
   }

   html(snippet: string)
   {
      this.script.push(`html += \`${snippet}\`;`)
   }

   toString()
   {
      return this.script.join('\r\n')
   }
}

export class Compiler
{

   overrideHeadContainers(from: Container, to: Container): Container[]
   {
      if (to == null)
      {
         return from.children.map(children => {
            if (children instanceof Container)
            {
               return children
            }
         })
      }

      const result = [] as Container[]

      for (const container of from.children)
      {
         if (container instanceof Expression)
         {
            continue
         }

         if (container.name === 'title')
         {
            result.push(to.queryContainer('title') || container)
            continue
         }

         if (container.name === 'meta')
         {
            result.push(container)
            continue
         }

         if (container.name === 'link')
         {
            result.push(container)
            continue
         }
      }

      console.log(result)

      return result
   }

   attribute(attribute: Map<string, Expression>, merge?: Map<string, Expression>)
   {
      const result = [] as string[]

      for (const key of Array.from(attribute.keys()))
      {
         const value = attribute.get(key)
         result.push(`${key}="${this.expression(value)}"`)
      }

      return result.join(' ')
   }

   expression(expression: Expression)
   {
      if (expression.type === 'literal')
      {
         // TODO: Escape value
         return expression.value as string
      }

      if (!Array.isArray(expression.value))
      {
         return ''
      }

      const variable = expression.value.map(value => {
         if (value.type === 'literal')
         {
            return value.value
         }
      })
      .join('?.')

      return '${' + variable + '}'
   }

   container(build: Builder, container: Container)
   {
      if (container.children.length === 0)
      {
         build.html(`<${container.name} ${this.attribute(container.attribute)}/>`)
         return
      }

      build.html(`<${container.name} ${this.attribute(container.attribute)}>`)

      for (const children of container.children)
      {
         if (children instanceof Container)
         {
            this.container(build, children)
            continue
         }

         build.html(this.expression(children))
      }
   
      build.html(`</${container.name}>`)
   }

   head(build: Builder, from: Container, to: Container)
   {
      build.html('<head>')

      for (const container of this.overrideHeadContainers(from, to))
      {
         this.container(build, container)
      }

      build.html('</head>')
   }

   body(build: Builder, from: Container, to: Container)
   {
      build.html('<body>')

      build.html('</body>')
   }

   async bundle(entry: Template, template: Template)
   {
      const build = new Builder()

      console.log(entry)

      const context: vm.Context = {
         // TODO: Merge
         app: entry.context.app,
         engine: entry.context.engine,
         locale: entry.context.locale,

         // NOTE: debugging information
         console
      }
      
      // TODO: Import check, all dependencies
      // TODO: Fill & merge template context
      // TODO: Merge head meta.
      // TODO: Add engine script from public if it isn't in head yet.
      // TODO: Construct render function that can be called on server side (document, window access
      // means we need to run it on the browser).
      // TODO: Add any script imports to the bundle.
      
      build.push(`async function render (data = {}) {`)
      build.push(`let html = '';`)

      build.html('<!DOCTYPE html>')
      build.html('<html lang="${this.locale.language}">')

      this.head(build, entry.head, template.head)
      this.body(build, entry.body, template.body)

      build.html('</html>')

      build.push(`return html;`)
      build.push(`}`)

      fs.writeFileSync(template.descriptor.swapExtension('.build.js'), build.toString())
      vm.runInNewContext(build.toString(), context)

      return context.render
   }

}