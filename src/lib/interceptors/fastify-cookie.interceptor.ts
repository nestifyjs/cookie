import { IncomingMessage, ServerResponse } from 'http'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { Inject, Injectable } from '@nestjs/common'
import * as fastify from 'fastify'
import { FastifyReply, FastifyRequest } from 'fastify'

import { AbstractCookieInterceptor } from './abstract-cookie.interceptor'
import { COOKIES_OPTIONS } from '../cookie.constants'
import {
  CookieOptions,
  CookieRemoveRecord,
  CookieSetRecord
} from '../cookie.interfaces'
import { CookieService } from '../cookie.service'

type HttpResponse = ServerResponse | Http2ServerResponse
type HttpRequest = IncomingMessage | Http2ServerRequest
type Request = FastifyRequest<HttpRequest>
type Response = FastifyReply<HttpResponse>

declare module 'fastify' {

  interface FastifyRequest<HttpRequest,
    Query = fastify.DefaultQuery,
    Params = fastify.DefaultParams,
    Headers = fastify.DefaultHeaders,
    Body = fastify.DefaultBody> {
    cookies: Map<string, any>
  }
}

@Injectable()
export class FastifyCookieInterceptor extends AbstractCookieInterceptor<Request, Response> {

  constructor (
    @Inject(COOKIES_OPTIONS) options: CookieOptions,
    cookies: CookieService
  ) {
    super(options, cookies)
  }

  public getCookiesHandler (request: Request): void {
    const rawCookies = request.headers['cookie'] || ''
    request.cookies = this.cookies.parse(rawCookies, this.options.decode)
  }

  public removeCookiesHandler (cookies: Array<CookieRemoveRecord>, request: Request, response: Response): void {
    for (const cookie of cookies) {
      const { name, options = {} } = cookie

      options.maxAge = 0

      response.header(CookieService.HEADER_NAME, this.cookies.serialize(name, '', options))
    }
  }

  public setCookiesHandler (cookies: Array<CookieSetRecord>, request: Request, response: Response): void {
    for (const cookie of cookies) {
      const { name, value, options } = cookie

      response.header(CookieService.HEADER_NAME, this.cookies.serialize(name, value, options))
    }
  }
}
