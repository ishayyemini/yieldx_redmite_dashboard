import React, { useContext, useEffect, useState } from 'react'
import {
  ActionFunction,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Box, Button, Card, Main, ResponsiveContext, Select } from 'grommet'
import moment from 'moment'

import GlobalContext, { ContextType } from './data/GlobalContext'
import API, { DeviceType, UserType } from './data/API'

type GlobalState = Omit<ContextType, 'updateContext'>

export const appLoader: ActionFunction = async () => {
  const user = await API.loadUser()
  if (user.username) return user
  else return redirect('/login')
}

const filters: { [p: string]: (device: DeviceType) => boolean } = {
  All: (device) => !device.hidden,
  Active: (device) =>
    !device.hidden &&
    moment().subtract(10, 'minutes').isSameOrBefore(device.nextUpdate),
  Outdated: (device) =>
    !device.hidden &&
    moment().subtract(10, 'minutes').isAfter(device.nextUpdate),
  Hidden: (device) => !!device.hidden,
}

const App = () => {
  const user = useLoaderData() as UserType
  const size = useContext(ResponsiveContext)

  const [globalState, setGlobalState] = useState<GlobalState>({
    user,
    otaList: [],
  })
  const [filter, setFilter] = useState<string>(
    localStorage.getItem('deviceFilter') || 'All'
  )

  useEffect(() => {
    API.getOtaList().then()
    API.configure(setGlobalState)
  }, [])

  useEffect(() => {
    localStorage.setItem('deviceFilter', filter)
  }, [filter])

  const navigate = useNavigate()
  const { pathname } = useLocation()

  const customerList = user.admin
    ? [
        ...new Set(
          Object.values(globalState.devices ?? {})
            .filter((device) => device.customer)
            .map((device) => 'Customer: ' + device.customer)
        ),
      ]
    : []

  const filterElement = (
    <Select
      value={filter}
      options={[...new Set([...Object.keys(filters), ...customerList, filter])]}
      onChange={({ option }) => setFilter(option)}
    />
  )

  return (
    <GlobalContext.Provider
      value={{ ...globalState, updateContext: setGlobalState }}
    >
      <Main>
        <Card direction={'row'} justify={'between'} align={'center'}>
          <>{user.username}</>
          {size !== 'small' && pathname === '/' ? (
            <Box direction={'row'} align={'center'} gap={'medium'}>
              Filter Devices: {filterElement}
            </Box>
          ) : null}
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
        {size === 'small' && pathname === '/' ? (
          <Box pad={'small'} margin={{ bottom: 'small' }}>
            {filterElement}
          </Box>
        ) : null}
        <Outlet
          context={{
            filterFunc: filter.startsWith('Customer: ')
              ? (device: DeviceType) =>
                  device.customer === filter.replace('Customer: ', '')
              : filters[filter] || filters.All,
          }}
        />
      </Main>
    </GlobalContext.Provider>
  )
}

export default App
