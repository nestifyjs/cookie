import { Inject, Injectable } from '@nestjs/common'
import { Request, Response } from 'express'
import { CookieService } from '../cookie.service'
import { COOKIES_OPTIONS } from '../cookie.constants'
import {
  CookieOptions,
  CookieRemoveRecord,
  CookieSetRecord
} from '../cookie.interfaces'
import { AbstractCookieInterceptor } from './cookie.interceptor'

declare module 'express' {

  interface Request {
    cookies: Map<string, any>
  }
}

@Injectable()
export class ExpressCookieInterceptor extends AbstractCookieInterceptor<Request, Response> {

  constructor (
    @Inject(COOKIES_OPTIONS) options: CookieOptions,
    cookies: CookieService
  ) {
    super(options, cookies)
  }

  public getCookiesHandler (request: Request): void {
    const rawCookies = request.header('cookie') || ''
    request.cookies = this.cookies.parse(rawCookies, this.options.decode)
  }

  public setCookiesHandler (cookies: Array<CookieSetRecord>, request: Request, response: Response): void {
    for (const cookie of cookies) {
      const { name, value, options } = cookie

      response.cookie(name, value, options)
    }
  }

  public removeCookiesHandler (cookies: Array<CookieRemoveRecord>, request: Request, response: Response): void {
    for (const cookie of cookies) {
      const { name, options } = cookie

      response.clearCookie(name, options)
    }
  }
}
