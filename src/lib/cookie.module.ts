import { DynamicModule, Global, Module, Type } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CookieService } from './cookie.service'
import { CookieOptions } from './cookie.interfaces'
import { COOKIES_OPTIONS } from './cookie.constants'
import { AbstractCookieInterceptor } from './interceptors/abstract-cookie.interceptor'

@Global()
@Module({})
export class CookieModule {

  public static register (
    interceptor: Type<AbstractCookieInterceptor>,
    options: Partial<CookieOptions> = {}
  ): DynamicModule {
    const opts = Object.assign({}, CookieService.DEFAULT_OPTIONS, options)

    return {
      module: CookieModule,
      providers: [
        CookieService,
        {
          provide: COOKIES_OPTIONS,
          useValue: opts
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: interceptor
        }
      ],
      exports: [
        CookieService,
        {
          provide: COOKIES_OPTIONS,
          useValue: opts
        },
      ]
    }
  }
}
