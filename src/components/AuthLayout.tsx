import { Card, Main } from 'grommet'
import { ActionFunction, Outlet, redirect } from 'react-router-dom'

import API from '../data/API'

export const authLoader: ActionFunction = async (args) => {
  const user = await API.loadUser()
  if (user) return redirect('/')
  else return null
}

const AuthLayout = () => {
  return (
    <Main align={'center'} justify={'center'}>
      <Card>
        <Outlet />
      </Card>
    </Main>
  )
}

export default AuthLayout
