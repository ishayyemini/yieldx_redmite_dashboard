import React, { useEffect, useState } from 'react'
import {
  ActionFunction,
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom'
import { Box, Button, Card, Main } from 'grommet'

import GlobalContext, { ContextType } from './data/GlobalContext'
import API, { UserType } from './data/API'

type GlobalState = Omit<ContextType, 'updateContext'>

export const appLoader: ActionFunction = async () => {
  const user = await API.loadUser()
  if (user.username) return user
  else return redirect('/login')
}

const App = () => {
  const user = useLoaderData() as UserType

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
        <Card direction={'row'} justify={'between'} align={'center'}>
          <>{user.username}</>
          <Box direction={'row'} gap={'medium'}>
            {user.admin ? (
              <Button
                label={'Settings'}
                onClick={() => navigate('/settings')}
                primary
              />
            ) : null}
            <Button
              label={'Logout'}
              onClick={() => API.signOut().then(() => navigate('/login'))}
              secondary
            />
          </Box>
        </Card>
        <Outlet />
      </Main>
    </GlobalContext.Provider>
  )
}

export default App
