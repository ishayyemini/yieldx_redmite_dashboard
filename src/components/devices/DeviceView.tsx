import { useContext } from 'react'
import { Card, Heading, Tab, Tabs } from 'grommet'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import GlobalContext from '../../data/GlobalContext'

const DeviceView = () => {
  const { id } = useParams() as { id: string }
  const { devices, user } = useContext(GlobalContext)

  const navigate = useNavigate()

  const device = devices?.[id]

  const { pathname } = useLocation()
  const pages = ['', 'ota'] // TODO add overview page

  return device ? (
    <Card width={{ max: '400px' }} align={'center'} alignSelf={'center'}>
      <Heading level={3} margin={'none'}>
        Manage Device
      </Heading>
      {user?.admin ? (
        <Heading level={5} margin={'xsmall'}>
          Device ID: {device.id}
        </Heading>
      ) : null}

      <Tabs activeIndex={pages.indexOf(pathname.split('/')[2] || '')}>
        {/*<Tab title="Overview" onClick={() => navigate('')} />*/}
        <Tab title="Configuration" onClick={() => navigate('')} />
        <Tab title="OTA" onClick={() => navigate('ota')} />
      </Tabs>

      <Outlet />
    </Card>
  ) : null
}

export default DeviceView
