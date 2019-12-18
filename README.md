<h1 align="center">Nestify Cookie</h1>

<div align="center" style="background-color: #000000">
    <img src="https://avatars0.githubusercontent.com/u/59013950?s=400&u=0760f0d32578f25763198745838edbd3e7ee236f&v=4" width="150" alt="Nestify Logo" />
</div>

<h3 align="center">
    Library for convenient and dynamic cookies management for 
    <a href="https://nestjs.com" target="_blank">NestJS</a>
</h3>

---

A collection of decorators for cookies management. Decorators allow you to getter, setter and deleted cookies.
Decorators support static cookies values, but there is also a mechanism for dynamic cookies values set.

Supported [ExpressJS](https://expressjs.com/)(`@nestjs/platform-express`) and [FastifyJS](https://www.fastify.io/)(`@nestjs/platform-fastify`).

### Installation

```bash
npm install @nestifyjs/cookie
```

### Import decorators
To use decorators, you need to import a `CookieModule`, set an interceptor for your platform and set default options for cookies record.

Available Interceptors:
* ExpressCookieInterceptor - interceptor for `@nestjs/platform-express`
* FastifyCookieInterceptor - interceptor for `@nestjs/platform-fastify`

```typescript
import { Module } from '@nestjs/common';
import { CookieModule, ExpressCookieInterceptor, CookieSameSite } from '@nestifyjs/cookie';

@Module({
  imports: [
    CookieModule.register(ExpressCookieInterceptor, {
      encode: String,
      decode: String,
      httpOnly: true,
      path: '/path',
      secure: true,
      signed: true,
      sameSite: CookieSameSite.Strict
    }),
  ]
})
export class AppModule {}
```
Module `CookieModule` is declared global(with `@Global()` decorator), it needs to be imported only into the `AppModule` of your application.

### Use decorators
#### Getting Cookies
Use `@GetCookies(name?: string)` route parameter decorator to get cookies. 
Decorator will bind method parameter with `Map` instance containing **all** cookies.
```typescript
import { Controller, Get } from '@nestjs/common';
import { GetCookies } from '@nestifyjs/cookie';

@Controller()
export class AppController {
  @Get()
  public getCookieHandler(@GetCookies() cookie: Map<string, any>): string {
    const sid = cookie.get('sid') // get a cookie named sid
    return `Hello, you session ID is ${sid}`;
  }
}
```
Or with value of a specific cookie.
```typescript

@Controller()
export class AppController {
  @Get()
  public getCookieHandler(@GetCookies('sid') sid: string): string {
    return `Hello, you session ID is ${sid}`;
  }
}
```
#### Setting Cookies
Use `@SetCookies(staticCookies: Array<CookieSetRecord>)` route handler method decorator to set cookies.
```typescript
enum CookieSameSite {
  Strict = 'Strict',
  Lax = 'Lax',
  None = 'None'
}

interface CookieOptions {
  domain?: string
  encode: (value: string) => string
  decode: (value: string) => string
  expires?: Date
  httpOnly: boolean
  maxAge?: number
  path: string
  secure: boolean
  signed: boolean
  sameSite: CookieSameSite
}

interface CookieSetRecord {
  name: string
  value: string
  options?: Partial<CookieOptions>
}
```
Depending on the known `name`/`value`/`options` of the cookies before compilation, there are two ways to sets the cookie:

1. **Setting static cookies**
⋅⋅⋅In `@SetCookies` decorator list values and options for the cookies you want to settings. For example:
```typescript
import { Controller, Get } from '@nestjs/common';
import { SetCookies } from '@nestifyjs/cookie';

@Controller()
export class AppController {
  @Get()
  @SetCookies([
    {
      name: 'cookie1',
      value: 'cookie1 value',
      options: { domain: 'example.com', path: '/index', maxAge: 3600000 },
    },
    {
      name: 'cookie2',
      value: 'cookie2 value'
    },
  ])
  public setCookieHandler(): string {
    return `Set static cookies!`;
  }
}
```
⋅⋅⋅For each cookie, you can set individual options that will **override** the options specified when importing `CookieModule`(if they were identified).
If an object with options is not set for a specific cookie, then global options will be used.

2. **Setting dynamic cookies**
⋅⋅⋅ To setting dynamic cookies, you must use the `CookiesController`. The router controller must be inherited from the `Cookies Controller`.
`CookiesController` defines a method that can be called inside the route handler to configure cookies. Method signature:
```typescript
public setCookie (request: any, name: string, value: any, options: Partial<CookieOptions> = {}): void
```
⋅⋅⋅For example:
```typescript
import { Request, Controller, Get } from '@nestjs/common';
import { CookieController } from '@nestifyjs/cookie';

@Controller()
export class AppController extends CookieController {
  @Get()
  public setCookieHandler(@Request() request: any): string {
    this.setCookie(request, 'dynamic', [ Math.random(), Math.random() ], {
      httpOnly: true,
      maxAge: 36000,
    });

    return `Set dynamic cookies!`;
  }
}
```
#### Removing Cookies
Cookies are deleted similar to setting them, except that you do not need to set a cookie value.

>Web browsers and other compliant clients will only clear the cookie if the given options is identical to those given 
>to `@SetCookies` decorator or `CookieController.setCookie()`, excluding `expires` and `maxAge`.

1. **Setting static cookies**
⋅⋅⋅Use `@RemoveCookies(staticCookies: Array<CookieRemoveRecord>)` route handler method decorator to remove cookies.
```typescript
interface CookieRemoveRecord {
  name: string
  options?: Partial<CookieOptions>
}
```
⋅⋅⋅For example:
```typescript
import { Controller, Get } from '@nestjs/common';
import { RemoveCookies } from '@nestifyjs/cookie';

@Controller()
export class AppController {
  @Get()
  @RemoveCookies([
    {
      name: 'cookie1',
      value: 'cookie1 value',
      options: { domain: 'example.com', path: '/index', maxAge: 3600000 },
    }
  ])
  public removeCookieHandler(): string {
    return `Remove static cookies!`;
  }
}
```
2. **Setting dynamic cookies**
⋅⋅⋅Use `CookieController.removeCookie()` method to remove cookies.
```typescript
public removeCookie (request: any, name: string, options: Partial<CookieOptions> = {}): void
```
⋅⋅⋅For example:
```typescript
import { Request, Controller, Get } from '@nestjs/common';
import { CookieController } from '@nestifyjs/cookie';

@Controller()
export class AppController extends CookieController {
  @Get()
  public removeCookieHandler(@Request() request: any): string {
    this.removeCookie(request, 'dynamic', {
      httpOnly: true,
    });

    return `Remove dynamic cookies!`;
  }
}
```
