import * as fs from 'fs'
import * as promise from 'fs/promises'
import * as path from 'path'
import * as yaml from 'js-yaml'

export interface file_descriptor
{
   absolute: string
   relative: string
   directory: string
   ext: string
   name: string

   swapExtension(ext: string): string
}

async function exists(path: string)
{
   return await promise.stat(path)
   .then(() => true)
   .catch(() => false)
}

async function readdir(directory: string, recursively: boolean = false, result: file_descriptor[] = [], root: string = null): Promise<file_descriptor[]>
{
   if (root == null && !await exists(directory))
   {
      return []
   }

   for (const file of await promise.readdir(directory))
   {
      const absolute = path.join(directory, file)
      const stat = await promise.stat(absolute)

      if (stat.isDirectory())
      {
         await readdir(absolute, recursively, result, root || directory)
         continue
      }

      const relative = absolute.replace(root || directory, '')
      const type = path.parse(absolute)

      const descriptor = {
         absolute,
         relative,
         ext: type.ext,
         name: type.name,
         directory: relative.replace(type.base, ''),
         swapExtension(ext: string): string
         {
            return path.join(root || directory, type.name + ext)
         }
      }

      result.push(descriptor)
   }

   return result
}

async function readfile(file: string, encoding: any = undefined): Promise<Buffer>
{
   return await promise.readFile(file, { encoding })
}

async function readyaml<ReturnType>(file: string): Promise<ReturnType>
{
   return yaml.load(await readfile(file)) as ReturnType
}

async function readjson<ReturnType>(file: string): Promise<ReturnType>
{
   return JSON.parse(await (await readfile(file)).toString()) as ReturnType
}

async function readconfig<ReturnType = any>(file: string): Promise<ReturnType>
{
   if (!await exists(file))
   {
      throw new Error(`Unreadable configuration file: ${file}`)
   }

   const result = path.parse(file)

   // TODO: Load default.extension if file not found.

   switch (result.ext)
   {
      case '.yaml': return await readyaml<ReturnType>(file)
      case '.json': return await readjson<ReturnType>(file)
      case '.ts': 
      {
         const coerced = path.format({
               root: result.root,
               dir: result.dir,
               name: result.name,
               ext: '.js',
               base: `${result.name}.js`
         })

         const { default: config } = require(coerced)

         return config
      }
      case '.js': return require(file) as ReturnType

      default: throw new Error(`Unsupported configuration extension: ${result.ext}`)
   }
}

function readstream(file: string)
{
   return fs.createReadStream(file)
}

export default {
   readdir,
   readfile,
   readstream,
   readyaml,
   readconfig,
   readjson,

   exists
}