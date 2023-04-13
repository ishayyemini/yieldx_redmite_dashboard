import React, { useEffect, useState } from 'react'
import {
  ActionFunction,
  Outlet,
  redirect,
  useLoaderData,
} from 'react-router-dom'
import { Main } from 'grommet'

import GlobalContext, { ContextType } from './data/GlobalContext'
import API from './data/API'

type GlobalState = Omit<ContextType, 'updateContext'>

export const appLoader: ActionFunction = async () => {
  const user = await API.loadUser()
  if (user) return user
  else return redirect('/login')
}
const App = () => {
  const user = useLoaderData() as { username: string; id: string }

  const [globalState, setGlobalState] = useState<GlobalState>({})

  useEffect(() => {
    API.configure(setGlobalState)
    API.subscribeToRM()
  }, [])

  console.log(globalState)

  return (
    <GlobalContext.Provider
      value={{ ...globalState, updateContext: setGlobalState }}
    >
      <Main>
        We are logged in! User {user.username} ID {user.id}
        <Outlet />
      </Main>
    </GlobalContext.Provider>
  )
}

export default App
