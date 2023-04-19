import mqtt from 'mqtt/dist/mqtt'

import { UpdateContextType } from './GlobalContext'

type MQTTDeviceType = {
  TS: number
  STRT: number
  END: number
  DETCT: number
  TRND: number
  BSTAT: 'OK' | 'High' | 'Low'
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
  user?: { username: string; id: string }
  mqtt: {
    server: string
    port: number
    basePath: string
  }
}

class APIClass {
  _config: APIConfigType = {
    user: undefined,
    mqtt: { server: 'broker.mqttdashboard.com', port: 8000, basePath: 'mqtt' },
  }
  _setGlobalState: UpdateContextType = () => null
  _url: string = 'https://3.127.195.30:4000'
  _client: mqtt.MqttClient | null = null

  configure(setGlobalState?: UpdateContextType) {
    if (setGlobalState) this._setGlobalState = setGlobalState
  }

  async signIn(username: string, password: string) {
    return await fetch(`${this._url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.log(res.statusText)
          // TODO error handling
        }
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  async loadUser(): Promise<undefined | { username: string; id: string }> {
    return await fetch(`${this._url}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.status === 200) {
          this._client = await this.setupMqtt()
          return res.json()
        } else {
          console.log(res.statusText)
          // TODO error handling
        }
      })
      .then((res) => res?.user)
      .catch((err) => {
        console.error(err)
      })
  }

  async setupMqtt(): Promise<mqtt.MqttClient> {
    return new Promise((resolve, reject) => {
      const { server, port, basePath } = this._config.mqtt
      const client = mqtt.connect(`ws://${server}:${port}/${basePath}`)
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
    if (this._client) {
      this._setGlobalState((oldCtx) => ({ ...oldCtx, devices: {} }))
      this._client.subscribe(['YIELDX/STAT/RM/#', 'sensdata/#'])
      this._client.on('message', (topic, payload) => {
        if (topic.startsWith('YIELDX/STAT/RM/'))
          try {
            const parsed: MQTTDeviceType = JSON.parse(payload.toString())
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
          } catch {
            console.error('Cannot parse mqtt message')
          }
        if (topic.startsWith('sensdata/'))
          try {
            const parsed: MQTTSensDataType = JSON.parse(payload.toString())
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
          } catch {
            console.error('Cannot parse mqtt message')
          }
      })
    }
  }
}

const API = new APIClass()

export default API
