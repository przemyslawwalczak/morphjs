import { format } from 'util'

function createException(type: string, message: string) {
  return class Exception extends Error {
    type: string = type

    constructor(...args: string[]) {
      super(`${type}: ${format(message, ...args)}`)
    }
  }
}

export const INVALID_FILE_PATH = createException('INVALID_FILE_PATH', '%s')
export const CONFIGURATION_REQUIRED = createException('CONFIGURATION_REQUIRED', '%s')
