import jwt_decode, { JwtPayload } from 'jwt-decode'

import { UpdateContextType } from './GlobalContext'

export type DeviceType = {
  id: string
  battery?: 'Ok' | 'Low'
  start?: Date | 0
  end?: Date | 0
  trained?: Date | 0
  detection?: Date | 0
  location?: string
  house?: string
  inHouseLoc?: string
  customer?: string
  contact?: string
  lastUpdated?: Date
  lastSens?: Date
}

type SettingsType = {
  testField: string
}

type APIConfigType = {
  user?: { username?: string; id?: string }
  token?: string
}

type APIRoute =
  | 'auth/login'
  | 'auth/logout'
  | 'auth/refresh'
  | 'user'
  | 'update-settings'
type APIResponse<Route> = {
  user: Route extends 'auth/login' | 'user'
    ? { username: string; id: string }
    : never
  token: Route extends 'auth/login' | 'auth/refresh' ? string : never
  settings: Route extends 'update-settings' ? SettingsType : never
}

class APIClass {
  _config: APIConfigType = {
    user: undefined,
    token: undefined,
  }
  _setGlobalState: UpdateContextType = () => null
  _url: string = 'api.yieldx-biosec.com'
  _client: WebSocket | undefined
  _subscribed: boolean = false

  configure(setGlobalState?: UpdateContextType) {
    if (setGlobalState) this._setGlobalState = setGlobalState
  }

  private async fetcher<Route extends APIRoute>(
    route: Route,
    body?: object
  ): Promise<APIResponse<Route>> {
    if (!route.startsWith('auth')) {
      let parsed
      try {
        parsed = jwt_decode<JwtPayload>(this._config.token ?? '')
        if (Date.now() > (parsed.exp ?? 0) * 1000) parsed = undefined
      } catch {}
      if (!parsed && !(await this.refreshTokens()))
        throw new Error('Unauthorized')
    }

    return fetch(`https://${this._url}/${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.data) return res.data
        else throw new Error(res?.error?.message || 'Server Error')
      })
  }

  async signIn(username: string, password: string) {
    return await this.fetcher('auth/login', { username, password }).then(
      async (data) => {
        this._config.user = data.user
        this._config.token = data.token
        this._client = await this.setupMqtt()
        return this._config.user
      }
    )
  }

  async signOut() {
    if (this._config.user?.username)
      return await this.fetcher('auth/logout').finally(() => {
        this._setGlobalState((oldCtx) => ({ ...oldCtx, user: undefined }))
        this._config.user = {}
        this._config.token = undefined
        this._subscribed = false
        this._client?.close()
        this._client = undefined
      })
  }

  async loadUser(): Promise<{ username?: string; id?: string }> {
    if (this._config.user) return this._config.user
    return await this.fetcher('user')
      .then(async (data) => {
        this._config.user = data.user
        if (!this._client) this._client = await this.setupMqtt()
        return this._config.user
      })
      .catch((err) => {
        console.error(err)
        this._config.user = {}
        return this._config.user
      })
  }

  async refreshTokens() {
    return await this.fetcher('auth/refresh')
      .then((data) => {
        this._config.token = data.token
        return true
      })
      .catch(() => {
        this.signOut()
        return false
      })
  }

  updateSettings(settings: SettingsType): Promise<SettingsType> {
    return this.fetcher('update-settings', { settings }).then(
      (data) => data.settings
    )
  }

  async setupMqtt(): Promise<WebSocket | undefined> {
    if (this._config.token) {
      const token = this._config.token
      const ws = new WebSocket(`wss://${this._url}/mqtt`)
      let authorized = false

      ws.onopen = () => {
        ws.send(token)
      }
      ws.onmessage = (msg) => {
        if (!authorized && msg.data === 'authorized') authorized = true
        else if (authorized) {
          const data = JSON.parse(msg.data)
          ;[
            'start',
            'end',
            'trained',
            'detection',
            'lastSens',
            'lastUpdated',
          ].forEach((key) => (data[key] = data[key] ? new Date(data[key]) : 0))

          this._setGlobalState((oldCtx) => ({
            ...oldCtx,
            devices: {
              ...(oldCtx.devices ?? {}),
              [data.id]: {
                ...(oldCtx.devices?.[data.id] ?? {}),
                ...data,
              },
            },
          }))
        }
      }
      ws.onerror = (err) => {
        console.log(err)
      }
      ws.onclose = (msg) => {
        console.log(msg)
      }

      return ws
    }
  }
}

const API = new APIClass()

export default API
