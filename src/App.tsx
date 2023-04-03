import React from 'react'
import { ActionFunction, redirect, useLoaderData } from 'react-router-dom'

import API from './data/API'

export const appLoader: ActionFunction = async () => {
  const user = await API.loadUser()
  if (user) return user
  else return redirect('/login')
}
const App = () => {
  const user = useLoaderData() as { username: string; id: string }

  return (
    <>
      We are logged in! User {user.username} ID {user.id}
    </>
  )
}

export default App
