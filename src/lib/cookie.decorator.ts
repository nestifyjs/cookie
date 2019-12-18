import { assignMetadata, createParamDecorator } from '@nestjs/common'
import { CookieController } from './cookie.controller'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import {
  CookieOptions,
  CookieRemoveRecord,
  CookieSetRecord
} from './cookie.interfaces'
import {
  COOKIES_REMOVE_METADATA,
  COOKIES_SET_METADATA
} from './cookie.constants'
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum'

type Param = Map<string, any> | string | number | object | undefined

const GetCookiesParamFactory = (key: string, request: { cookies: Map<string, any> }): Param => {
  return key ? request.cookies.get(key) : request.cookies
}

const setRouteRequestMetadata = (target: Object, key: string): void => {
  const meta = Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key)
  const index = Object.keys(meta).length

  Reflect.defineMetadata(
    ROUTE_ARGS_METADATA,
    assignMetadata(meta, RouteParamtypes.REQUEST, index),
    target.constructor,
    key
  )
}

const getProxyRequestHandler = (
  key: string,
  metadata: Array<CookieSetRecord> | Array<CookieRemoveRecord>
): (target: () => any, context: Object, argArray?: any) => any => {
  return (target: () => any, context: Object, argArray?: any) => {
    const request = argArray.pop()
    Reflect.defineMetadata(key, metadata, request)

    return Reflect.apply(target, context, argArray)
  }
}

export const GetCookies = createParamDecorator(GetCookiesParamFactory)

export const SetCookies = (staticCookies: Array<CookieSetRecord> = []): MethodDecorator => {
  return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>) => {
    setRouteRequestMetadata(target, key)

    descriptor.value = new Proxy(descriptor.value, {
      apply: getProxyRequestHandler(COOKIES_SET_METADATA, staticCookies)
    })

    return descriptor
  }
}
export const RemoveCookies = (staticCookies: Array<CookieRemoveRecord> = []): MethodDecorator => {
  return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>) => {
    setRouteRequestMetadata(target, key)

    descriptor.value = new Proxy(descriptor.value, {
      apply: getProxyRequestHandler(COOKIES_REMOVE_METADATA, staticCookies)
    })

    return descriptor
  }
}
