import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Grommet } from 'grommet'

import App, { appLoader } from './App'
import AuthLayout, { authLoader } from './components/AuthLayout'
import GlobalStyle, { theme } from './components/app/GlobalStyle'
import SignIn, { signInAction } from './components/auth/SignIn'
import Devices from './components/devices/Devices'
import DeviceView from './components/devices/DeviceView'
import DeviceConfig, {
  deviceConfigAction,
} from './components/devices/DeviceConfig'
import DeviceOTA, { deviceOtaAction } from './components/devices/DeviceOTA'
import Settings, { updateSettingsAction } from './components/Settings'
import DeviceOverview from './components/devices/DeviceOverview'

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        loader: appLoader,
        element: <App />,
        children: [
          { index: true, element: <Devices /> },
          {
            path: ':id',
            element: <DeviceView />,
            children: [
              { index: true, element: <DeviceOverview /> },
              {
                path: 'config',
                element: <DeviceConfig />,
                action: deviceConfigAction,
              },
              { path: 'ota', element: <DeviceOTA />, action: deviceOtaAction },
            ],
          },
          {
            path: 'settings',
            element: <Settings />,
            action: updateSettingsAction,
          },
        ],
      },
      {
        loader: authLoader,
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <SignIn />,
            action: signInAction,
          },
        ],
      },
    ],
  },
])

const Top = () => (
  <Grommet theme={theme}>
    <GlobalStyle />
    <RouterProvider router={router} />
    <Outlet />
  </Grommet>
)

export default Top
