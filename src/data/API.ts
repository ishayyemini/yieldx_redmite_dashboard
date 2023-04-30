import mqtt from 'mqtt/dist/mqtt'

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
  mqtt: {
    server: string
    port: number
    secPort: number
    basePath: string
  }
}

type APIRoute = 'login' | 'user' | 'logout'

const adminUsers = ['ishay2', 'lior', 'amit']

class APIClass {
  _config: APIConfigType = {
    user: undefined,
    mqtt: {
      server: 'broker.hivemq.com',
      port: 8000,
      secPort: 8884,
      basePath: 'mqtt',
    },
  }
  _setGlobalState: UpdateContextType = () => null
  _url: string = 'https://api.yieldx-biosec.com'
  _client: mqtt.MqttClient | null = null
  _subscribed: boolean = false

  configure(setGlobalState?: UpdateContextType) {
    if (setGlobalState) this._setGlobalState = setGlobalState
  }

  private fetcher(route: APIRoute, body?: object) {
    return fetch(`${this._url}/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    return await this.fetcher('login', { username, password }).then(
      async (data) => {
        this._client = await this.setupMqtt()
        this._config.user = { username: data.user.username, id: data.user.id }
        return data.user
      }
    )
  }

  async signOut() {
    return await this.fetcher('logout').finally(() => {
      this._setGlobalState((oldCtx) => ({ ...oldCtx, user: undefined }))
      this._config.user = {}
      this._subscribed = false
      this._client?.end()
      this._client = null
    })
  }

  async loadUser(): Promise<{ username?: string; id?: string }> {
    if (this._config.user) return this._config.user
    else
      return await this.fetcher('user')
        .then(async (data) => {
          if (data?.user?.username && data.user.id) {
            this._client = await this.setupMqtt()
            this._config.user = {
              username: data.user.username,
              id: data.user.id,
            }
            return this._config.user
          } else throw new Error('No user data')
        })
        .catch((err) => {
          console.error(err)
          this._config.user = {}
          return this._config.user
        })
  }

  async setupMqtt(): Promise<mqtt.MqttClient> {
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
