import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Grommet } from 'grommet'

import App, { appLoader } from './App'
import AuthLayout, { authLoader } from './components/AuthLayout'
import GlobalStyle, { theme } from './components/app/GlobalStyle'
import SignIn, { signInAction } from './components/auth/SignIn'
import Devices from './components/Devices'
import DeviceView, { deviceUpdateAction } from './components/DeviceView'

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        loader: appLoader,
        element: <App />,
        children: [
          { index: true, element: <Devices /> },
          { path: ':id', element: <DeviceView />, action: deviceUpdateAction },
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
