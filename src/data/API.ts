import jwt_decode, { JwtPayload } from 'jwt-decode'
import queryString from 'query-string'

import { UpdateContextType } from './GlobalContext'
import { subscribe } from '../subscription'
import moment, { Moment } from 'moment/moment'

export type ModeType =
  | 'Idle'
  | 'Idle Sleep'
  | 'PreOpen Lid'
  | 'Training'
  | 'Done Training'
  | 'Lid Closed Daily-Cycle Done'
  | 'Lid Opened Idling'
  | 'Lid Closed Idling'
  | 'Inspecting'
  | 'Report Inspection'

export type DeviceType = {
  id: string
  location: string
  house: string
  inHouseLoc: string
  customer: string
  contact: string
  comment: string
  version?: string
  history?: OperationType[]
  detections?: DetectionType[]
  status: {
    battery: 'Ok' | 'Low'
    start: Date | 0
    end: Date | 0
    trained: Date | 0
    detection: Date | 0
    mode: ModeType
    currentCycle: number
    totalCycles: number
  }
  conf: {
    training: {
      preOpen: number
      ventDur: number
      on1: number
      sleep1: number
      train: number
    }
    detection: {
      open1: string
      close1: string
      startDet: string
      vent2: number
      on2: number
      sleep2: number
      detect: number
    }
  }
  lastUpdated: Date
  nextUpdate: Date
  afterNextUpdate: Date
  hidden?: boolean
}

export type DeviceUpdateType = {
  location: string
  house: string
  inHouseLoc: string
  contact: string
  comment: string
  preOpen: number
  ventDur: number
  on1: number
  sleep1: number
  train: number
  open1: string
  close1: string
  startDet: string
  vent2: number
  on2: number
  sleep2: number
  detect: number
}

export type SettingsType = {
  mqtt?: string
}

export type OperationType = {
  category: 'Training' | 'Daily Cycle'
  totalCycles: number
  cycles: ({ start: Moment; end?: Moment } | null)[]
}

export type DetectionType = {
  timestamp: number
  value: number
  newSession?: boolean
}

export type UserType = {
  username?: string
  id?: string
  settings?: SettingsType
  admin?: boolean
}

type APIConfigType = {
  user?: UserType
  token?: string
}

type APIRoute =
  | 'auth/login'
  | 'auth/logout'
  | 'auth/refresh'
  | 'user'
  | 'update-settings'
  | 'update-device-conf'
  | 'update-device-ota'
  | 'list-ota'
  | 'hide-device'
  | 'get-device-history'
  | 'get-device-detections'
type APIResponse<Route> = {
  user: Route extends 'auth/login' | 'user' ? UserType : never
  token: Route extends 'auth/login' | 'auth/refresh' ? string : never
  settings: Route extends 'update-settings' ? SettingsType : never
  otaList: Route extends 'list-ota' ? string[] : never
  deviceHistory: Route extends 'get-device-history' ? OperationType[] : never
  detections: Route extends 'get-device-detections' ? DetectionType[] : never
}

class APIClass {
  _config: APIConfigType = {
    user: undefined,
    token: undefined,
  }
  _setGlobalState: UpdateContextType = () => null
  _url: string =
    process.env.NODE_ENV === 'development'
      ? `${window.location.hostname}:4000`
      : 'api.yieldx-biosec.com'
  _client: WebSocket | undefined
  _mqttRetries: number = 0

  configure(setGlobalState?: UpdateContextType) {
    if (setGlobalState) this._setGlobalState = setGlobalState
  }

  private async fetcher<Route extends APIRoute>(
    route: Route,
    body?: { [p: string]: any }
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

    const getReq = [
      'list-ota',
      'get-device-history',
      'get-device-detections',
    ].includes(route)

    return fetch(
      `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${
        this._url
      }/${route}` + (getReq && body ? '?' + queryString.stringify(body) : ''),
      {
        method: getReq ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._config.token}`,
        },
        body: !getReq && body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      }
    )
      .then((res) => {
        if (route === 'get-device-history')
          return res
            .text()
            .then((r) =>
              JSON.parse(r, (key, value) =>
                ['start', 'end'].includes(key) ? moment(value) : value
              )
            )
        else return res.json()
      })
      .then((res) => {
        if (res?.data) return res.data
        else throw new Error(res?.error?.message || 'Server Error')
      })
  }

  async signIn(username: string, password: string) {
    const subscription = await subscribe().then((res) => res?.toJSON())
    return await this.fetcher('auth/login', {
      username,
      password,
      subscription,
    }).then((data) => {
      this._config.user = data.user
      this._config.token = data.token
      this.setupMqtt()
      return this._config.user
    })
  }

  async signOut() {
    if (this._config.user?.username)
      return await this.fetcher('auth/logout').finally(() => {
        this._setGlobalState((oldCtx) => ({ ...oldCtx, user: undefined }))
        this._config.user = {}
        this._config.token = undefined
        this._mqttRetries = 0
        this._client?.close(1000)
        this._client = undefined
      })
  }

  async loadUser(): Promise<UserType> {
    if (this._config.user) return this._config.user
    return await this.fetcher('user')
      .then((data) => {
        this._config.user = data.user
        if (!this._client) this.setupMqtt()
        return this._config.user
      })
      .catch((err) => {
        console.error(err)
        this._config.user = {}
        return this._config.user
      })
  }

  async updateDeviceConf(id: string, conf: DeviceUpdateType) {
    return await this.fetcher('update-device-conf', { id, ...conf })
  }

  async getOtaList() {
    await this.fetcher('list-ota').then(({ otaList }) =>
      this._setGlobalState((oldCtx) => ({ ...oldCtx, otaList }))
    )
  }

  async getDeviceHistory(id: string) {
    return await this.fetcher('get-device-history', {
      id,
      server: this._config.user?.settings?.mqtt,
    }).then((res) => {
      this._setGlobalState((oldCtx) => ({
        ...oldCtx,
        devices: oldCtx.devices?.[id]
          ? {
              ...oldCtx.devices,
              [id]: { ...oldCtx.devices[id], history: res.deviceHistory },
            }
          : oldCtx.devices,
      }))
      return res.deviceHistory
    })
  }

  async getDeviceDetections(id: string) {
    return await this.fetcher('get-device-detections', {
      id,
      server: this._config.user?.settings?.mqtt,
    }).then(({ detections }) => {
      this._setGlobalState((oldCtx) => ({
        ...oldCtx,
        devices: oldCtx.devices?.[id]
          ? {
              ...oldCtx.devices,
              [id]: { ...oldCtx.devices[id], detections },
            }
          : oldCtx.devices,
      }))
      return detections
    })
  }

  async updateDeviceOTA(id: string, version: string) {
    return await this.fetcher('update-device-ota', { id, version })
  }

  async hideDevice(id: string, hidden: boolean) {
    return await this.fetcher('hide-device', { id, hidden })
  }

  async refreshTokens() {
    const subscription = await subscribe().then((res) => res?.toJSON())
    return await this.fetcher('auth/refresh', { subscription })
      .then((data) => {
        this._config.token = data.token
        return true
      })
      .catch(() => {
        this.signOut()
        return false
      })
  }

  async updateSettings(settings: SettingsType) {
    if (this._config.user?.admin)
      return this.fetcher('update-settings', { settings }).then(
        ({ settings }) => {
          if (this._config.user) this._config.user.settings = settings
          this._setGlobalState((oldCtx) => ({
            ...oldCtx,
            user: { ...oldCtx.user, settings },
          }))
          return settings
        }
      )
  }

  async setupMqtt(): Promise<void> {
    this._mqttRetries++

    if (this._mqttRetries <= 5)
      if (!this._config.token) await this.refreshTokens()
      else {
        if (!this._mqttRetries)
          this._setGlobalState((oldCtx) => ({ ...oldCtx, devices: {} }))

        const token = this._config.token
        const ws = new WebSocket(
          `${process.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${
            this._url
          }/mqtt`
        )
        let authorized = false

        ws.onopen = () => {
          ws.send(token)
        }
        ws.onmessage = (msg) => {
          if (!authorized && msg.data === 'authorized') {
            authorized = true
            this._mqttRetries = 0
          } else if (authorized) {
            const data = JSON.parse(msg.data, (key, value) =>
              [
                'start',
                'end',
                'trained',
                'detection',
                'lastUpdated',
                'nextUpdate',
                'afterNextUpdate',
              ].includes(key) &&
              !isNaN(value) &&
              value !== 0
                ? new Date(value)
                : value
            )

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
          if (msg.code !== 1000) setTimeout(() => this.setupMqtt(), 1000)
        }

        this._client = ws
      }
    else console.log('Too many MQTT retries')
  }
}

const API = new APIClass()

export default API
