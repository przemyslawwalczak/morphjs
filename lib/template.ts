import * as acorn from 'acorn'
import * as jsx from 'acorn-jsx'

const jsxOptions = {
   allowNamespacedObjects: true,
   allowNamespaces: true
}

const parser = acorn.Parser.extend(jsx(jsxOptions))

interface Type
{
   type: 'element' | 'property' | 'function' | 'expression' | 'import'
   name: string
}

interface FunctionDeclaration extends Type
{
   block: null | Type[]
}

interface Property extends Type
{
   value: string | number | Function
}

interface Expression extends Type
{
   internal?: boolean
   expression: null | Type[]
}

interface Element extends Type
{
   namespace: string | null
   property: (Property | Expression)[]
   block: null | Type[]
}

export class Template
{
   import: any
   internal: any
   external: any

   constructor()
   {
      this.import = []
   }

   transverse(node: any)
   {
      if (node.type === 'JSXElement')
      {
         return this.element(node)
      }

      switch (node.type)
      {
         case 'FunctionDeclaration': return this.declare_function(node)
         case 'ImportDeclaration': return this.declare_import(node)
         case 'ExportNamedDeclaration': return this.declare_export(node)
         case 'ExpressionStatement': return this.declare_expression(node)
         case 'JSXExpressionContainer': return this.declare_expression(node)
         case 'JSXText': return this.text(node)

         default: return console.log(`transverse:`, node.type)
      }
   }

   internal_transverse(node: any)
   {
      if (node.type === 'JSXElement')
      {
         return this.internal_element(node)
      }

      return this.transverse(node)
   }


   /**
    * Template declaration functions.
    * 
    */

    declare_function(node: any)
    {
      const result: FunctionDeclaration = {
         type: 'function',
         name: node.id.name,
         block: null
      }

      function function_body({ body })
      {
         const result: Type[] = []

         return result
      }

      if (node.body && node.body.body.length)
      {
         result.block = function_body(node)
      }

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

   element_html(node: any)
   {
      if (node.children)
      {
         for (const children of node.children)
            this.internal_transverse(children)
      }
   }

   element_head(node: any)
   {
      if (node.children)
      {
         for (const children of node.children)
            this.internal_transverse(children)
      }
   }

   element_body(node: any)
   {
      if (node.children)
      {
         for (const children of node.children)
            this.transverse(children)
      }
   }

   element_metadata(node: any)
   {

   }

   element_router(node: any)
   {
      
   }

   element_route(node: any)
   {

   }

   element_title(node: any)
   {

   }

   element_base(node: any)
   {

   }

   element_link(node: any)
   {

   }

   element_meta(node: any)
   {

   }

   element_script(node: any)
   {

   }

   element_noscript(node: any)
   {

   }

   element_template(node: any)
   {

   }


   /**
    * General internal routers for specific elements handlers to transverse.
    * 
    */

   internal_element(node: any)
   {
      const opening = node.openingElement
      const { name } = this.nameof(opening)

      console.log('internal_element:', name)

      switch (name)
      {
         case 'title': return this.element_title(node)
         case 'base': return this.element_base(node)
         case 'link': return this.element_link(node)
         case 'meta': return this.element_meta(node)
         case 'script': return this.element_script(node)
         case 'noscript': return this.element_noscript(node)
         case 'template': return this.element_template(node)
         case 'html': return this.element_html(node)
         case 'body': return this.element_body(node)
         case 'head': return this.element_head(node)
         case 'metadata': return this.element_metadata(node)
         case 'router': return this.element_router(node)
         case 'route': return this.element_route(node)

         default: return console.log(`undefined internal_element: ${name}`)
      }
   }
   
   element(node: any)
   {
      const opening = node.openingElement
      const { name, namespace } = this.nameof(opening)

      if (namespace === 'app')
      {
         return this.internal_element(node)
      }

      switch (name)
      {
         case 'html':
         case 'body':
         case 'head':
         case 'script':
         case 'template':
            return this.internal_element(node)
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
            this.transverse(children)
      }
   }



   /**
    * Expression definitions.
    * 
    */

   logical_expression(expression: any)
   {

   }

   member_expression(expression: any)
   {

   }

   call_expression(expression: any)
   {

   }

   declare_expression({ expression })
   {
      switch (expression.type)
      {
         case 'JSXElement': return this.element(expression)
         case 'LogicalExpression': return this.logical_expression(expression)
         case 'MemberExpression': return this.member_expression(expression)
         case 'CallExpression': return this.call_expression(expression)

         default: return console.log(`declare_expression: ${expression.type}`)
      }
   }



   /**
    * Generic functions for any type of node.
    * 
    */

   text(node: any)
   {

   }
 
   attribute(attribute: any)
   {
      
   }

   nameof(node: any): { name: string | string[], namespace: null | string }
   {
      switch (node.type)
      {
         case 'JSXOpeningElement': return this.nameof(node.name)
         case 'JSXMemberExpression': {
            const names = [ node.property.name ]

            let current = node.object

            while (current.type === 'JSXMemberExpression')
            {
               names.push(current.property.name)
               current = current.object
            }

            const { name, namespace } = this.nameof(current)

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



   /**
    * Template API method definitions open for calling outside Template class.
    * 
    */

   async parse(content: string)
   {
      const result: any = parser.parse(content, {
         ecmaVersion: 'latest',
         sourceType: 'module'
      })

      // TODO: Distinguished parsed tree of blocks.

      for (const node of result.body)
      {
         this.transverse(node)
      }

      return true
   }

   async render(data: any)
   {

   }
}
