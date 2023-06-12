import { useContext } from 'react'
import { Card, Heading, ResponsiveContext, Tab, Tabs } from 'grommet'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import * as Icons from 'grommet-icons'

import GlobalContext from '../../data/GlobalContext'

const DeviceView = () => {
  const { id } = useParams() as { id: string }
  const size = useContext(ResponsiveContext)
  const { devices, user } = useContext(GlobalContext)

  const navigate = useNavigate()

  const device = devices?.[id]

  const { pathname } = useLocation()
  const pages = ['', 'config', 'ota']

  return device ? (
    <Card
      width={{ max: '400px' }}
      align={'center'}
      alignSelf={size !== 'small' ? 'center' : undefined}
      fill={!pathname.split('/')[2] ? 'vertical' : undefined}
    >
      <Heading level={3} margin={'none'}>
        Manage Device
      </Heading>
      {user?.admin ? (
        <Heading level={5} margin={'xsmall'}>
          Device ID: {device.id}
        </Heading>
      ) : null}

      <Tabs
        activeIndex={pages.indexOf(pathname.split('/')[2] || '')}
        flex={false}
      >
        <Tab
          title={'Overview'}
          icon={<Icons.CircleInformation />}
          onClick={() => navigate('')}
        />
        <Tab
          title={'Configuration'}
          icon={<Icons.Configure />}
          onClick={() => navigate('config')}
        />
        <Tab
          title={'OTA'}
          icon={<Icons.Sync />}
          onClick={() => navigate('ota')}
        />
      </Tabs>

      <Outlet />
    </Card>
  ) : null
}

export default DeviceView
