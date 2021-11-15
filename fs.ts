import * as callback from 'fs'
import * as promise from 'fs/promises'
import * as path from 'path'

import * as YAML from 'js-yaml'

export async function exists(absolute: string) {
  return callback.existsSync(absolute)
}

export async function yaml(absolute: string) {
  const contents = await callback.readFileSync(absolute, 'utf-8')
  return YAML.load(contents)
}

export interface FileDescriptor {
  absolute: string
  relative: string
  name: string
  dir: string
  ext: string
}

export async function readdirRecursive(directory: string, result: FileDescriptor[] = [], root: string = directory) {
  if (root === directory && !await exists(directory)) {
    // TODO: Warn about that, perhaps
    return []
  }

  const files = callback.readdirSync(directory)

  for (const entry of files) {
    const absolute = path.join(directory, entry)
    const stat = callback.statSync(absolute)

    if (stat.isDirectory()) {
      await readdirRecursive(absolute, result, root)
      continue
    }

    const relative = absolute.replace(root + path.sep, '')
    const data = path.parse(relative)

    result.push({
      absolute,
      relative,
      name: data.name,
      dir: data.dir,
      ext: data.ext
    })
  }

  return result
}