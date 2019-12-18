import {
  CallHandler,
  ExecutionContext, NestInterceptor
} from '@nestjs/common'
import { Observable } from 'rxjs'

import { CookieService } from '../cookie.service'
import { tap } from 'rxjs/operators'
import {
  COOKIES_REMOVE_METADATA,
  COOKIES_SET_METADATA
} from '../cookie.constants'
import {
  CookieOptions,
  CookieRemoveRecord,
  CookieSetRecord
} from '../cookie.interfaces'

type Record = CookieSetRecord | CookieRemoveRecord

export abstract class AbstractCookieInterceptor<Request = any, Response = any> implements NestInterceptor {

  protected constructor (
    protected options: CookieOptions,
    protected cookies: CookieService
  ) {}

  public intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()

    this.getCookiesHandler(request)

    return next.handle().pipe(
      tap(() => this.invokeHandler(COOKIES_SET_METADATA, request, response, this.setCookiesHandler)),
      tap(() => this.invokeHandler(COOKIES_REMOVE_METADATA, request, response, this.removeCookiesHandler)),
      tap(() => this.cleanMetadata(request))
    )
  }

  public abstract getCookiesHandler (request: Request): void

  public abstract setCookiesHandler (cookies: Array<CookieSetRecord>, request: Request, response: Response): void

  public abstract removeCookiesHandler (cookies: Array<CookieRemoveRecord>, request: Request, response: Response): void

  private invokeHandler = (
    metadataKey: string,
    request: Request,
    response: Response,
    handler: (cookies: Array<Record>, request: Request, response: Response) => void
  ): void => {
    const records: Array<Record> = Reflect.getMetadata(metadataKey, request)

    if (records === undefined || !Array.isArray(records) || records.length === 0) {
      return undefined
    }

    for (const record of records) {
      record.options = this.assignOptions(record.options)
    }

    Reflect.apply(handler, this, [ records, request, response ])
  }

  private assignOptions (options: Partial<CookieOptions> = {}): CookieOptions {
    return Object.assign({}, this.options, options)
  }

  private cleanMetadata (request: Request): void {
    Reflect.defineMetadata(COOKIES_SET_METADATA, null, request)
    Reflect.defineMetadata(COOKIES_REMOVE_METADATA, null, request)
  }
}
