import * as acorn from 'acorn'
import * as jsx from 'acorn-jsx'
import * as fs from 'fs'
import { file_descriptor } from './fs'

const jsxOptions = {
   allowNamespacedObjects: true,
   allowNamespaces: true
}

const parser = acorn.Parser.extend(jsx(jsxOptions))

class Attribute
{
   type: 'variable' | 'function' | 'value'

   name: string | string[]
   namespace: string | null

   value: string | string[]

   internal: boolean = false

   static literal(attribute: Attribute, { value }: any)
   {
      attribute.value = value

      return attribute
   }

   static expression(attribute: Attribute, { expression }: any)
   {
      // console.log(expression)

      switch (expression.type)
      {
         case 'CallExpression':
            {
               attribute.type = 'function'
               break
            }

         case 'MemberExpression':
            {
               attribute.type = 'variable'
               break
            }
      }

      const { name } = nameof(expression)

      console.log('target:', name)

      return attribute
   }

   static fromNode(node: any)
   {
      if (node.type !== 'JSXAttribute')
      {
         throw new Error(`Sanity Check: JSXAttribute !== ${node.type}`)
      }

      const { name, namespace } = nameof(node.name)
      const value = node.value

      const attribute = new Attribute()

      attribute.name = name
      attribute.namespace = namespace

      switch (value.type)
      {
         case 'Literal': return this.literal(attribute, value)
         case 'JSXExpressionContainer': return this.expression(attribute, value)
         default: throw new Error(`Unhandled attribute value type: ${value.type}`)
      }
   }
}

function nameof(node: any): { name: string | string[], namespace: null | string }
{
   switch (node.type)
   {
      case 'Identifier':
         {
            return {
               name: [ node.name ],
               namespace: null
            }
         }

      case 'MemberExpression':
         {
            const names: string[] = []

            let object = node.object

            while (object)
            {
               if (object.type === 'Identifier')
               {
                  names.push(object.name)
                  break
               }

               names.push(object.property.name)

               object = object.object
            }

            names.reverse()
            names.push(node.property.name)

            return {
               name: names,
               namespace: null
            }
         }

      case 'JSXOpeningElement': return nameof(node.name)
      case 'JSXMemberExpression': {
         const names = [ node.property.name ]

         let current = node.object

         while (current.type === 'JSXMemberExpression')
         {
            names.push(current.property.name)
            current = current.object
         }

         const { name, namespace } = nameof(current)

         names.push(name)

         return {
            name: names.reverse(),
            namespace
         }
      }

      case 'JSXIdentifier': {
         return {
            name: node.name,
            namespace: null
         }
      }

      case 'JSXNamespacedName': {
         const { name, namespace } = node

         return {
            name: name.name,
            namespace: namespace.name
         }
      }

      default: throw new Error(`Unhandled nameof type: ${node.type}`)
   }
}

class Element
{
   attribute: Attribute[] = []
}

class Container extends Element
{
   type: string

   constructor(type: string)
   {
      super()

      this.type = type
   }
}

class Body extends Container
{
   constructor()
   {
      super('body')
   }
}

class Head extends Container
{
   title: string
   meta: Element[]

   constructor()
   {
      super('head')

      this.meta = []
   }
}

class HTML extends Container
{
   body: Body
   head: Head

   constructor()
   {
      super('html')
   }
}

export class Template
{
   import: any

   html: HTML

   debug: {
      html: fs.WriteStream
      bundle: fs.WriteStream
   }

   constructor()
   {
      this.import = []
   }

   transverse(node: any, parent?: Container)
   {
      if (node.type === 'JSXElement')
      {
         return this.element(node, parent)
      }

      switch (node.type)
      {
         case 'ImportDeclaration': return this.declare_import(node)
         case 'ExportNamedDeclaration': return this.declare_export(node)

         case 'FunctionDeclaration': return this.declare_function(node, parent)

         case 'ExpressionStatement': return this.declare_expression(node, parent)
         case 'JSXExpressionContainer': return this.declare_expression(node, parent)
         case 'JSXText': return this.text(node, parent)

         default: return console.log(`transverse:`, node.type)
      }
   }

   internal_transverse(node: any, parent?: Container)
   {
      if (node.type === 'JSXElement')
      {
         return this.internal_element(node, parent)
      }

      return this.transverse(node, parent)
   }

   /**
    * Template declaration functions.
    * 
    */

    declare_function(node: any, parent?: Container)
    {


      // TODO: Map the declared function
    }
 
    declare_import(node: any)
    {
       // console.log(node)
    }
 
    declare_export(node: any)
    {
       // console.log(node)
    }

   
   /**
    * List of Elements that are special to template definition.
    * 
    */

   element_html(node: any, parent?: Container)
   {
      if (parent)
      {
         throw new Error(`Nesting html elements is not allowed`)
      }

      if (parent == null)
      {
         if (this.html)
         {
            throw new Error(`Duplicated html blocks related to the template is not allowed`)
         }

         this.html = new HTML()
      }

      // TODO: Parse properties from element

      if (node.children)
      {
         for (const children of node.children)
            this.internal_transverse(children, this.html)
      }
   }

   element_head(node: any, parent?: Container)
   {
      if (!parent || parent.type !== 'html')
      {
         throw new Error(`Nesting head elements are allowed only in html containers`)
      }

      const html = parent as HTML

      if (html.head)
      {
         throw new Error(`Duplicated head element in html container is not allowed`)
      }

      html.head = new Head()

      // TODO: Parse properties


      if (node.children)
      {
         for (const children of node.children)
            this.internal_transverse(children, html.head)
      }
   }

   element_body(node: any, parent?: Container)
   {
      if (!parent || parent.type !== 'html')
      {
         throw new Error(`Nesting body elements are allowed only in html containers`)
      }

      const html = parent as HTML

      if (html.body)
      {
         throw new Error(`Duplicated body element in html container is not allowed`)
      }

      html.body = new Body()

      if (node.children)
      {
         for (const children of node.children)
            this.transverse(children, html.body)
      }
   }

   element_metadata(node: any, parent?: Container)
   {

   }

   element_router(node: any, parent?: Container)
   {
      
   }

   element_route(node: any, parent?: Container)
   {

   }

   element_title(node: any, parent?: Container)
   {
      if (!parent || parent.type !== 'head')
      {
         throw new Error(`Nesting body elements are allowed only in head containers`)
      }

      const head = parent as Head
   }

   element_base(node: any, parent?: Container)
   {

   }

   element_link(node: any, parent?: Container)
   {

   }

   element_meta(node: any, parent?: Container)
   {
      if (parent.type !== 'head')
      {
         throw new Error(`Nesting meta elements are allowed only in head containers`)
      }

      const head = parent as Head

      /**
       * There are few metatags that will require merging/overriding:
       * titles
       * name=author
       * name=description
       * name=keywords
       * name=generator
       * name=viewport
       * name=application-name
       * charset
       * http-equiv=content-security-policy
       * http-equiv=content-type
       * http-equiv=default-style
       * http-equiv=refresh
       */

      const element = new Element()

      for (const attr of node.openingElement.attributes)
      {
         const { name } = nameof(attr.name)

         const attribute = Attribute.fromNode(attr)

         attribute.name = name

         element.attribute.push(attribute)
      }

      head.meta.push(element)
   }

   element_script(node: any, parent?: Container)
   {

   }

   element_noscript(node: any, parent?: Container)
   {

   }

   element_template(node: any, parent?: Container)
   {

   }


   /**
    * General internal routers for specific elements handlers to transverse.
    * 
    */

   internal_element(node: any, parent?: Container)
   {
      const opening = node.openingElement
      const { name } = nameof(opening)

      console.log('internal_element:', name)

      switch (name)
      {
         case 'title': return this.element_title(node, parent)
         case 'base': return this.element_base(node, parent)
         case 'link': return this.element_link(node, parent)
         case 'meta': return this.element_meta(node, parent)
         case 'script': return this.element_script(node, parent)
         case 'noscript': return this.element_noscript(node, parent)
         case 'template': return this.element_template(node, parent)
         case 'html': return this.element_html(node, parent)
         case 'body': return this.element_body(node, parent)
         case 'head': return this.element_head(node, parent)
         case 'metadata': return this.element_metadata(node, parent)
         case 'router': return this.element_router(node, parent)
         case 'route': return this.element_route(node, parent)

         default: return console.log(`undefined internal_element: ${name}`)
      }
   }
   
   element(node: any, parent?: Container)
   {
      const opening = node.openingElement
      const { name, namespace } = nameof(opening)

      if (namespace === 'app')
      {
         return this.internal_element(node, parent)
      }

      switch (name)
      {
         case 'html':
         case 'body':
         case 'head':
         case 'script':
         case 'template':
            return this.internal_element(node, parent)
      }

      console.log('element:', name)

      if (opening.attributes)
      {
         for (const attribute of opening.attributes)
            this.attribute(attribute)
      }

      if (node.children)
      {
         for (const children of node.children)
            this.transverse(children, parent)
      }
   }


   /**
    * Expression definitions.
    * 
    */

   logical_expression(expression: any, parent?: Container)
   {

   }

   member_expression(expression: any, parent?: Container)
   {

   }

   call_expression(expression: any, parent?: Container)
   {

   }

   declare_expression({ expression }, parent?: Container)
   {
      switch (expression.type)
      {
         case 'JSXElement': return this.element(expression, parent)
         case 'LogicalExpression': return this.logical_expression(expression, parent)
         case 'MemberExpression': return this.member_expression(expression, parent)
         case 'CallExpression': return this.call_expression(expression, parent)

         default: return console.log(`declare_expression: ${expression.type}`)
      }
   }


   /**
    * Generic functions for any type of node.
    * 
    */

   text(node: any, parent?: Container)
   {

   }
 
   attribute(attribute: any)
   {
      
   }

   /**
    * Template API method definitions open for calling outside Template class.
    * 
    */

   async parse(content: string, file: file_descriptor)
   {
      const result: any = parser.parse(content, {
         ecmaVersion: 'latest',
         sourceType: 'module'
      })

      // TODO: Distinguished parsed tree of blocks.

      this.debug = {
         bundle:  fs.createWriteStream(file.swapExtension('.debug.js'), {
            flags: 'w'
         }),

         html: fs.createWriteStream(file.swapExtension('.debug.html'), {
            flags: 'w'
         })
      }

      for (const node of result.body) this.transverse(node)

      return true
   }

   async render(data: any): Promise<string>
   {
      // TODO: Return statically generated template

      return ''
   }

   async merge(entry: Template)
   {

   }
}
