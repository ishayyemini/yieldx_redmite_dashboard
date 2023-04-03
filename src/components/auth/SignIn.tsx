import { Box, Button, Heading } from 'grommet'
import { ActionFunction, Form, redirect } from 'react-router-dom'

import { TextField } from '../app/AppComponents'
import API from '../../data/API'

export const signInAction: ActionFunction = async (args) => {
  const data = await args.request.formData()
  const username = data.get('username')
  const password = data.get('password')
  if (typeof username === 'string' && typeof password === 'string') {
    await API.signIn(username, password)
    return redirect('/')
  } else return null
}

const SignIn = () => {
  return (
    <Form action={'/login'} method={'POST'}>
      <Box align={'center'}>
        <img src={'/wide-logo.png'} alt={'YieldX wide logo'} />
        <Heading level={3} margin={'none'}>
          RedMite Dashboard
        </Heading>
        <Box gap={'small'} margin={{ vertical: 'medium' }}>
          <TextField label={'Username'} name={'username'} />
          <TextField label={'Password'} name={'password'} type={'password'} />
        </Box>
        <Button label={'Login'} type={'submit'} primary />
      </Box>
    </Form>
  )
}

export default SignIn
