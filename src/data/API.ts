import mqtt from 'mqtt/dist/mqtt'
import jwt_decode, { JwtPayload } from 'jwt-decode'

import { UpdateContextType } from './GlobalContext'

type MQTTDeviceType = {
  TS: number
  STRT: number
  END: number
  DETCT: number
  TRND: number
  BSTAT: 'OK' | 'High' | 'Low'
  Customer: string
}

type MQTTSensDataType = {
  BoardID: string
  Location: string
  House: string
  InHouseLoc: string
  Contact: string
  Customer: string
}

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

type APIConfigType = {
  user?: { username?: string; id?: string }
  token?: string
  mqtt: {
    server: string
    port: number
    secPort: number
    basePath: string
  }
}

type APIRoute = 'auth/login' | 'auth/logout' | 'auth/refresh' | 'user'
type APIResponse<Route> = {
  user: Route extends 'auth/login' | 'user'
    ? { username: string; id: string }
    : never
  token: Route extends 'auth/login' | 'auth/refresh' ? string : never
}

const adminUsers = ['ishay2', 'lior', 'amit']

class APIClass {
  _config: APIConfigType = {
    user: undefined,
    token: undefined,
    mqtt: {
      server: 'broker.hivemq.com',
      port: 8000,
      secPort: 8884,
      basePath: 'mqtt',
    },
  }
  _setGlobalState: UpdateContextType = () => null
  _url: string = 'api.yieldx-biosec.com'
  _client: mqtt.MqttClient | null = null
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
        this._client?.end()
        this._client = null
      })
  }

  async loadUser(): Promise<{ username?: string; id?: string }> {
    if (this._config.user) return this._config.user
    return await this.fetcher('user')
      .then(async (data) => {
        console.log(data)
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

  async setupMqtt(): Promise<mqtt.MqttClient> {
    if (this._config.token) {
      const token = this._config.token
      let ws = new WebSocket(`wss://${this._url}/echo`)
      let authorized = false
      ws.onopen = () => {
        ws.send(token)
      }
      ws.onmessage = (msg) => {
        if (!authorized && msg.data === 'authorized') authorized = true
        console.log(msg)
      }
      ws.onerror = (err) => {
        console.log(err)
      }
      ws.onclose = (msg) => {
        console.log(msg)
        console.log('closed')
      }

      setTimeout(() => {
        if (authorized) ws.send('hey')
      }, 5000)
    }

    return new Promise((resolve, reject) => {
      let { server, port, basePath } = this._config.mqtt
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      if (protocol === 'wss') port = this._config.mqtt.secPort
      const client = mqtt.connect(`${protocol}://${server}:${port}/${basePath}`)
      const timeout = setTimeout(() => {
        console.error('Failed to connect')
        client.end()
        reject('Connection timed out')
      }, 5000)
      client.on('connect', () => {
        clearTimeout(timeout)
        resolve(client)
      })
      client.on('error', (err) => {
        console.error('Connection error: ', err)
        client.end()
        reject(err)
      })
      window.onbeforeunload = () => {
        client.end()
      }
    })
  }

  subscribeToRM() {
    if (this._client && !this._subscribed) {
      this._subscribed = true
      this._setGlobalState((oldCtx) => ({ ...oldCtx, devices: {} }))
      this._client.subscribe(['YIELDX/STAT/RM/#', 'sensdata/#'])
      this._client.on('message', (topic, payload) => {
        if (topic.startsWith('YIELDX/STAT/RM/'))
          try {
            const parsed: MQTTDeviceType = JSON.parse(payload.toString())
            if (
              parsed.Customer === this._config.user?.username ||
              adminUsers.includes(this._config.user?.username ?? '')
            ) {
              const device: DeviceType = {
                id: topic.split('/')[3],
                start: parsed.STRT ? new Date(parsed.STRT * 1000) : 0,
                end: parsed.END ? new Date(parsed.END * 1000) : 0,
                detection: parsed.DETCT ? new Date(parsed.DETCT * 1000) : 0,
                trained: parsed.TRND ? new Date(parsed.TRND * 1000) : 0,
                battery: parsed.BSTAT === 'Low' ? 'Low' : 'Ok',
                lastUpdated: new Date(parsed.TS * 1000),
              }
              this._setGlobalState((oldCtx) => ({
                ...oldCtx,
                devices: {
                  ...(oldCtx.devices ?? {}),
                  [device.id]: {
                    ...(oldCtx.devices?.[device.id] ?? {}),
                    ...device,
                  },
                },
              }))
            }
          } catch {
            console.error('Cannot parse mqtt message')
          }
        if (topic.startsWith('sensdata/'))
          try {
            const parsed: MQTTSensDataType = JSON.parse(payload.toString())
            if (
              parsed.Customer === this._config.user?.username ||
              adminUsers.includes(this._config.user?.username ?? '')
            ) {
              const id = topic.split('/')[1]
              const time = new Date(topic.split('/')[2])
              const {
                Location: location,
                House: house,
                InHouseLoc: inHouseLoc,
                Customer: customer,
                Contact: contact,
              } = parsed
              this._setGlobalState((oldCtx) => {
                if ((oldCtx.devices?.[id]?.lastSens ?? 0) < time)
                  return {
                    ...oldCtx,
                    devices: {
                      ...(oldCtx.devices ?? {}),
                      [id]: {
                        id,
                        ...(oldCtx.devices?.[id] ?? {}),
                        lastSens: time,
                        location,
                        house,
                        inHouseLoc,
                        customer,
                        contact,
                      },
                    },
                  }
                else return oldCtx
              })
            }
          } catch {
            console.error('Cannot parse mqtt message')
          }
      })
    }
  }
}

const API = new APIClass()

export default API
