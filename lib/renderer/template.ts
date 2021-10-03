import * as acorn from 'acorn'
import * as jsx from 'acorn-jsx'
import * as vm from 'vm'

import { Locale } from '../locale'
import { file_descriptor } from '../fs'
import { Renderer } from '.'

const jsxOptions = {
   allowNamespacedObjects: true,
   allowNamespaces: true
}

/**
 * JSX Parser extension instance.
 */

const parser = acorn.Parser.extend(jsx(jsxOptions))

/**
 * Expression helper parser.
 */

export class Expression
{
   type: 'expression' | 'callee' | 'literal'
   value: boolean | string | number | Expression | Expression[]

   /**
    * Arguments of expression, ignored if not needed.
    */
   arguments?: Expression[]

   /**
    * Callee recursive function to describe callee expressions.
    * @param node 
    * @param result 
    * @returns Expression
    */
   static callee(node: any, result: Expression)
   {
      const callee = node.callee

      const expression = new Expression()

      expression.type = 'callee'
      expression.arguments = []

      for (const argument of node.arguments)
      {
         expression.arguments.push(Expression.of(argument))
      }

      if (callee.type === 'Identifier')
      {
         expression.value = callee.name

         if (Array.isArray(result.value))
         {
            result.value.push(expression)
         }

         return result
      }

      expression.value = callee.property.name

      const next = callee.object

      switch (next.type)
      {
         case 'MemberExpression':
            this.member(next, result)
            break

         case 'CallExpression':
            this.callee(next, result)
            break

         case 'ThisExpression':
            this.identifier(next, result)
            break
         
         default: throw new Error(`Unahandled Expression.callee next type: ${next.type}`)
      }

      if (Array.isArray(result.value))
      {
         result.value.push(expression)
      }

      return result
   }

   /**
    * Recursive function to parse identifiers or this expressions.
    * @param node 
    * @param result 
    * @returns Expression
    */
   static identifier(node: any, result: Expression)
   {
      const name = node.type === 'ThisExpression' ? 'this' : node.name

      if (Array.isArray(result.value))
      {
         result.value.push(Expression.from('literal', name))
         return result
      }
      
      result.type = 'literal'
      result.value = name

      return result
   }

   /**
    * 
    * @param node 
    * @param result 
    * @returns Expression
    */
   static member(node: any, result: Expression)
   {
      const expression = new Expression()

      expression.type = 'literal'
      expression.value = node.property.name

      const next = node.object

      switch (next.type)
      {
         case 'ThisExpression':
         case 'Identifier':
            this.identifier(next, result)
            break

         case 'MemberExpression':
            this.member(next, result)
            break

         case 'CallExpression':
            this.callee(next, result)
            break
         default: throw new Error(`Unahdnled Expression.member next type: ${next.type}`)
      }

      if (Array.isArray(result.value))
      {
         result.value.push(expression)
      }

      return result
   }

   static expression(node: any, result: Expression)
   {
      result.type = 'expression'
      result.value = []
      
      const type = node.type

      switch (type)
      {
         case 'Identifier':
         case 'ThisExpression': return this.identifier(node, result)
         
         case 'MemberExpression': return this.member(node, result)
         case 'CallExpression': return this.callee(node, result)
         case 'JSXExpressionContainer': return this.expression(node.expression, result)

         default: throw new Error(`Unhandled Expression.expression type: ${type}`)
      }
   }

   static attribute(node: any, result: Expression)
   {
      if (node.type === 'JSXExpressionContainer')
      {
         return this.expression(node, result)
      }

      if (node.type !== 'Literal')
      {
         throw new Error(`Unhandled Expression.attribute type: ${node.type}`)
      }

      result.type = 'literal'
      result.value = node.value

      return result
   }

   static text(node: any, result: Expression)
   {
      result.type = 'literal'

      // TODO: Only trim spaces in between values of element start and end.
      result.value = node.value

      // const value = node.value.trim()
      // .replace(/\s+/g, ' ')
      // .split(' ')
      // .map(value => value.trim())

      // result.value = value.length > 1 ? value.join(' ') : node.value

      return result
   }

   static of(node: any): Expression
   {
      const result = new Expression()

      switch (node.type)
      {
         case 'JSXAttribute': return this.attribute(node.value, result)

         case 'MemberExpression':
         case 'CallExpression':
         case 'Identifier':
         case 'ThisExpression': return this.expression(node, result)

         case 'JSXText': return this.text(node, result)

         case 'Literal':
            result.type = 'literal'
            result.value = node.value
            return result
      }
     
      throw new Error(`Unhandled Expression.of type: ${node.type}`)
   }

   static from(type: any, value: any)
   {
      const result = new Expression()

      result.type = type
      result.value = value

      return result
   }
}

export class Container
{
   name: string | string[]
   namespace: string

   attribute: Map<string, Expression>
   children: (Container | Expression)[]

   constructor(name: string = null, namespace: string = null)
   {
      this.name = name
      this.namespace = namespace

      this.attribute = new Map()
      this.children = []
   }

   queryContainer(name: string, query?: any): Container
   {
      for (const children of this.children)
      {
         if (children instanceof Expression)
         {
            continue
         }

         if (children.name !== name)
         {
            continue
         }

         if (query && typeof query === 'object')
         {
            if (query.namespace && query.namespace !== children.namespace)
            {
               continue
            }
         }

         return children
      }

      return undefined
   }

   static nameof({ name: node }: any, target: Container)
   {
      if (node.type === 'JSXIdentifier')
      {
         target.name = node.name
         return target
      }

      if (node.type === 'JSXNamespacedName')
      {
         target.namespace = node.namespace.name
         return this.nameof(node, target)
      }

      if (node.type === 'JSXMemberExpression')
      {
         target.name = []

         let current = node.object

         while (current)
         {
            const type = current.type
            
            if (type === 'JSXMemberExpression')
            {
               target.name.push(current.property.name)
               current = current.object
               continue
            }

            if (type === 'JSXNamespacedName')
            {
               target.namespace = current.namespace.name
               target.name.push(current.name.name)
               current = current.object
               continue
            }

            if (type === 'JSXIdentifier')
            {
               target.name.push(current.name)
               current = current.object
               continue
            }

            throw new Error(`Unhandled type: ${current.type}`)
         }

         target.name.reverse()
         target.name.push(node.property.name)

         return target
      }

      console.log('target.element unhandled:', node.type)

      return target
   }

   static of(node: any): Container
   {
      if (node.type !== 'JSXOpeningElement')
      {
         throw new Error(`unhandled target.of: ${node.type}`)
      }

      const result = new Container()

      for (const attribute of node.attributes)
      {
         result.attribute.set(attribute.name.name, Expression.of(attribute))
      }

      return this.nameof(node, result)
   }
}

export class Module
{
   type: 'template' | 'script'
   value: string | Template
   attribute: Map<string, Expression>

   constructor()
   {
      this.value = null
      this.attribute = new Map()
   }
}

export class Variable
{
   type: 'const' | 'var' | 'let' | 'reference'
   name: string
   value: Module | Variable
}

export class Importer
{


   create(source: string)
   {

   }
}

export class Exporter
{

}

export class Template
{
   descriptor: file_descriptor

   context: vm.Context = {
      locale: {} as any
      // TODO: context global variables and function declarations
      // TODO: context.render(data)
   }

   import: Importer
   export: Exporter

   head: Container
   body: Container

   bundle: any

   constructor(renderer: Renderer)
   {
      this.context.engine = renderer.engine
      this.context.app = renderer.app

      this.import = new Importer()
      this.export = new Exporter()
   }

   element_html(childrens: any[], parent?: Container)
   {
      if (parent)
      {
         throw new Error(`Nested html element are not allowed`)
      }

      const container = new Container('html')

      for (const children of childrens)
      {
         this.transverse(children, container)
      }
   }

   element_head(childrens: any[], parent?: Container)
   {
      if (!parent || parent.name !== 'html' || this.head)
      {
         throw new Error(`Element head can only be nested once in html container`)
      }

      this.head = new Container('head')

      for (const children of childrens)
      {
         this.transverse(children, this.head)
      }
   }

   element_body(children: any[], parent?: Container)
   {
      if (!parent || parent.name !== 'html' || this.body)
      {
         throw new Error(`Element body can only be nested once in html container`)
      }

      this.body = new Container('body')

      for (const node of children)
      {
         this.transverse(node, this.body)
      }
   }

   element_meta(target: Container, parent?: Container)
   {
      if (!parent || parent.name !== 'head')
      {
         throw new Error(`Container meta can only be nested in head container`)
      }

      parent.children.push(target)
   }

   element_link(target: Container, parent?: Container)
   {
      if (!parent || parent.name !== 'head')
      {
         throw new Error(`Container link can only be nested in head container`)
      }

      parent.children.push(target)
   }

   element_title(target: Container, children: any[], parent?: Container)
   {
      if (!parent || parent.name !== 'head')
      {
         throw new Error(`Container title can only be nested in head container`)
      }

      for (const node of children)
      {
         this.transverse(node, target)
      }

      parent.children.push(target)
   }

   element({ openingElement, children }: any, parent?: Container)
   {
      const target = Container.of(openingElement)

      switch (target.name)
      {
         case 'html': return this.element_html(children, parent)
         case 'head': return this.element_head(children, parent)
         case 'body': return this.element_body(children, parent)

         case 'meta': return this.element_meta(target, parent)
         case 'link': return this.element_link(target, parent)
         case 'title': return this.element_title(target, children, parent)
      }

      if (!parent && !this.body)
      {
         this.body = target
      }

      for (const node of children)
      {
         this.transverse(node, target)
      }
   }

   expression({ expression }: any, parent?: Container)
   {
      switch (expression.type)
      {
         case 'JSXElement': return this.element(expression, parent)

         default: return console.log('unhandled expression:', expression.type)
      }
   }

   expression_container({ expression }, parent?: Container)
   {
      if (expression.type === 'JSXEmptyExpression')
      {
         return null
      }

      parent.children.push(Expression.of(expression))
   }

   text(node: any, parent?: Container)
   {
      if (parent.name === 'head')
      {
         return null
      }

      const text = Expression.of(node)
      const value = text.value as string

      if (value.trim())
      {
         parent.children.push(text)
      }
   }

   import_declaration(node: any, parent?: Container)
   {
      if (parent)
      {
         throw new Error(`Import declarations are required on top of document`)
      }
      
      // const module = this.import.create(node.source.value)

      // for (const specifier of node.specifiers)
      // {
      //    console.log(specifier)
      // }

      // // this.importer

      // console.log(node)
   }

   export_declaration(node: any, parent?: Container)
   {
      if (parent)
      {
         throw new Error(`Import declarations are required on top of document`)
      }

      const container = new Container()
   }

   transverse(node: any, parent?: Container)
   {
      switch (node.type)
      {
         case 'ExpressionStatement': return this.expression(node, parent)
         case 'JSXExpressionContainer': return this.expression_container(node, parent)
         case 'JSXElement': return this.element(node, parent)
         case 'JSXText': return this.text(node, parent)

         case 'ImportDeclaration': return this.import_declaration(node, parent)
         case 'ExportDeclaration': return this.export_declaration(node, parent)
         case 'ExportDefaultDeclaration': return this.export_declaration(node, parent)

         default: return console.log('unhandled transverse:', node.type)
      }
   }

   async parse(content: string, descriptor: file_descriptor)
   {
      const result: any = parser.parse(content, {
         ecmaVersion: 'latest',
         sourceType: 'module'
      })

      for (const node of result.body)
      {
         this.transverse(node, null)
      }

      return true
   }

   async render(locale: Locale, data: any = {})
   {
      const render = this.context.render as (data: any) => string

      if (typeof render !== 'function')
      {
         throw new Error(`Template missing render function`)
      }

      // TODO: Select locale context
      this.context.locale = {}

      // TODO: Extend data to context

      return await Promise.resolve(render(data))
   }
}