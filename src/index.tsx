import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App'
import AuthLayout from './components/AuthLayout'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // {
      //   path: '/',
      //   element: <MainLayout />,
      //   loader: mainLoader,
      //   children: [
      //     {
      //       path: 'reports',
      //       element: <Reports />,
      //       loader: reportsLoader,
      //       children: [
      //         { index: true, element: <ChooseReport /> },
      //         {
      //           path: ':UID',
      //           element: <ReportView />,
      //         },
      //       ],
      //     },
      //     {
      //       path: 'devices',
      //       element: <DevicesInfo />,
      //       children: [
      //         {
      //           path: ':MAC',
      //           element: <DeviceView />,
      //           loader: deviceViewLoader,
      //         },
      //       ],
      //     },
      //     {
      //       path: 'settings',
      //       element: <Settings />,
      //     },
      //   ],
      // },
      {
        path: '/',
        element: <AuthLayout />,
        // children: [
        //   {
        //     path: '/login',
        //     element: <SignIn />,
        //     action: signInAction,
        //   },
        // ],
      },
    ],
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as Element)
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
