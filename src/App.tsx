import React, { useEffect, useState } from 'react'
import {
  ActionFunction,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom'
import { Button, Card, Main } from 'grommet'

import GlobalContext, { ContextType } from './data/GlobalContext'
import API, { SettingsType } from './data/API'

type GlobalState = Omit<ContextType, 'updateContext'>

export const appLoader: ActionFunction = async () => {
  const user = await API.loadUser()
  if (user.username) return user
  else return redirect('/login')
}

const App = () => {
  const user = useLoaderData() as {
    username: string
    id: string
    settings?: SettingsType
  }

  const [globalState, setGlobalState] = useState<GlobalState>({ user })

  useEffect(() => {
    API.configure(setGlobalState)
  }, [])

  const navigate = useNavigate()

  return (
    <GlobalContext.Provider
      value={{ ...globalState, updateContext: setGlobalState }}
    >
      <Main>
        <Card
          direction={'row'}
          gap={'small'}
          justify={'between'}
          align={'center'}
        >
          <>
            We are logged in! User {user.username} ID {user.id}
          </>
          <Button
            label={'Settings'}
            onClick={() => navigate('/settings')}
            primary
          />
          <Button
            label={'Logout'}
            onClick={() => API.signOut().then(() => navigate('/login'))}
            secondary
          />
        </Card>
        <Outlet />
      </Main>
    </GlobalContext.Provider>
  )
}

export default App
