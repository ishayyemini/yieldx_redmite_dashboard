import { createContext } from 'react'

import type { DeviceType } from './API'

export type UpdateContextType = (
  newCtx:
    | Omit<ContextType, 'updateContext'>
    | ((
        oldCtx: Omit<ContextType, 'updateContext'>
      ) => Omit<ContextType, 'updateContext'>)
) => void

export type ContextType = {
  user?: { username: string; id: string }
  devices?: { [MAC: string]: DeviceType }
  updateContext: UpdateContextType
}

const GlobalContext = createContext<ContextType>({
  updateContext: () => null,
})

export default GlobalContext
