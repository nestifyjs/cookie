import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util'

import { CookieOptions } from './cookie.interfaces'
import {
  COOKIES_REMOVE_METADATA,
  COOKIES_SET_METADATA
} from './cookie.constants'

export abstract class CookieController {

  public setCookie (request: any, name: string, value: any, options: Partial<CookieOptions> = {}): void {
    extendArrayMetadata(COOKIES_SET_METADATA, [ {
      name,
      value,
      options
    } ], request)
  }

  public removeCookie (request: any, name: string, options: Partial<CookieOptions> = {}): void {
    extendArrayMetadata(COOKIES_REMOVE_METADATA, [ {
      name,
      options
    } ], request)
  }
}
