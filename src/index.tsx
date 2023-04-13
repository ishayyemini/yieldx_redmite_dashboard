import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Grommet } from 'grommet'
import en from 'javascript-time-ago/locale/en'
import TimeAgo from 'javascript-time-ago'

import App, { appLoader } from './App'
import AuthLayout, { authLoader } from './components/AuthLayout'
import GlobalStyle, { theme } from './components/app/GlobalStyle'
import SignIn, { signInAction } from './components/auth/SignIn'
import Devices from './components/Devices'

TimeAgo.addDefaultLocale(en)

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        loader: appLoader,
        element: <App />,
        children: [{ index: true, element: <Devices /> }],
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

const root = ReactDOM.createRoot(document.getElementById('root') as Element)
root.render(
  <React.StrictMode>
    <Grommet theme={theme}>
      <GlobalStyle />
      <RouterProvider router={router} />
      <Outlet />
    </Grommet>
  </React.StrictMode>
)
