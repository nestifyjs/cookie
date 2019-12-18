export enum CookieSameSite {
  Strict = 'Strict',
  Lax = 'Lax',
  None = 'None'
}

export interface CookieOptions {
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

export interface CookieSetRecord {
  name: string
  value: string
  options?: Partial<CookieOptions>
}

export interface CookieRemoveRecord {
  name: string
  options?: Partial<CookieOptions>
}

