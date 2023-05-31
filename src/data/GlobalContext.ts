import { createContext } from 'react'

import type { DeviceType, UserType } from './API'

export type UpdateContextType = (
  newCtx:
    | Omit<ContextType, 'updateContext'>
    | ((
        oldCtx: Omit<ContextType, 'updateContext'>
      ) => Omit<ContextType, 'updateContext'>)
) => void

export type ContextType = {
  user?: UserType
  devices?: { [MAC: string]: DeviceType }
  otaList: string[]
  updateContext: UpdateContextType
}

const GlobalContext = createContext<ContextType>({
  otaList: [],
  updateContext: () => null,
})

export default GlobalContext
