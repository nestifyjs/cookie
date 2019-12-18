import { Injectable } from '@nestjs/common'

import { CookieOptions, CookieSameSite } from './cookie.interfaces'

@Injectable()
export class CookieService {

  public static readonly HEADER_NAME = 'Set-Cookie'

  public static readonly SPLIT_PAIRS_REGEXP = /\s*;\s*/

  public static readonly SPLIT_KEY_VALUE_REGEXP = /\s*=\s*/

  public static readonly JSON_PREFIX_REGEXP = /^j:(\[|\{)/

  public static readonly FIELD_CONTENT_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

  public static readonly DEFAULT_OPTIONS: CookieOptions = {
    domain: undefined,
    encode: encodeURIComponent,
    decode: decodeURIComponent,
    expires: undefined,
    httpOnly: false,
    path: '/',
    secure: false,
    signed: false,
    sameSite: CookieSameSite.None
  }

  constructor () {}

  public parse (cookie: string, decode?: (value: string) => string): Map<string, any> {
    decode = decode || CookieService.DEFAULT_OPTIONS.decode

    if (!Object.is(typeof decode, 'function')) {
      throw new TypeError('Argument "decode" must be a function with signature (value: string) => string')
    }

    const cookieMap = new Map()

    if (Object.is(cookie, '')) {
      return cookieMap
    }

    const pairs = cookie.split(CookieService.SPLIT_PAIRS_REGEXP)
    const length = pairs.length

    for (let i = 0; i < length; i++) {
      const pair = pairs[i].split(CookieService.SPLIT_KEY_VALUE_REGEXP)
      const key = this.decode(pair[0], decode).trim()
      let value = this.decode(pair[1], decode).trim()

      if (Object.is(key, '') || Object.is(value, '')) {
        continue
      }

      if (CookieService.JSON_PREFIX_REGEXP.test(value)) {
        value = this.JSONParse(value.slice(2))
      } else {
        value = this.JSONParse(value)
      }

      cookieMap.set(key, value)
    }

    return cookieMap
  }

  public serialize (name: string, value: any, options: Partial<CookieOptions> = {}): string {
    const encode = options.encode || CookieService.DEFAULT_OPTIONS.encode
    const { domain, path, maxAge, expires, httpOnly, secure, sameSite } = options

    if (typeof encode !=='function') {
      throw new TypeError('Option "encode" must be a function with signature (value: string) => string')
    }

    if (!CookieService.FIELD_CONTENT_REGEXP.test(name)) {
      throw new RangeError('Argument "name" has an invalid value')
    }

    if (typeof value === 'string') {
      value = this.encode(value, encode)
    } else {
      value = this.encode(JSON.stringify(value), encode)
    }

    let cookie = `${ name }=${ value }`

    if (domain !== undefined) {
      if (!CookieService.FIELD_CONTENT_REGEXP.test(domain)) {
        throw new RangeError('Option "domain" has an invalid value')
      }
      cookie += `; Domain=${ domain }`
    }

    if (path !== undefined) {
      if (!CookieService.FIELD_CONTENT_REGEXP.test(path)) {
        throw new RangeError('Option "path" has an invalid value')
      }
      cookie += `; Path=${ path }`
    }

    if (maxAge !== undefined) {
      if (isNaN(Number(maxAge))) {
        throw new TypeError('Option "maxAge" must be a Number')
      }

      const expires = new Date(Date.now() + maxAge)

      cookie += `; Max-Age=${ Math.floor(maxAge) }`
      cookie += `; Expires=${ expires.toUTCString() }`
    }

    if (expires && maxAge === undefined) {
      if (typeof expires.toUTCString !=='function') {
        throw new TypeError('Option "expires" must be a Date')
      }

      cookie += `; Expires=${ expires.toUTCString() }`
    }

    if (httpOnly) {
      cookie += `; HttpOnly`
    }

    if (secure) {
      cookie += `; Secure`
    }

    if (sameSite !== undefined) {
      cookie += `; SameSite=${ sameSite.toString() }`
    }

    return cookie
  }

  private decode (str: string, decode: (value: string) => string): string {
    try {
      return decode(str)
    } catch (error) {
      return str
    }
  }

  private encode (str: string, encode: (value: string) => string): string {
    try {
      return encode(str)
    } catch (error) {
      return str
    }
  }

  private JSONParse (value: string): any {
    try {
      return JSON.parse(value)
    } catch (error) {
      return value
    }
  }
}
