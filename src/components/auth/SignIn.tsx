import { Box, Button, Heading, Text } from 'grommet'
import { ActionFunction, Form, redirect, useActionData } from 'react-router-dom'

import { TextField } from '../app/AppComponents'
import API from '../../data/API'

export const signInAction: ActionFunction = async (args) => {
  const data = await args.request.formData()
  const username = data.get('username')
  const password = data.get('password')
  if (typeof username === 'string' && typeof password === 'string') {
    return await API.signIn(username, password)
      .then(() => redirect('/'))
      .catch((e) => e.message)
  } else return null
}

const SignIn = () => {
  const error = useActionData() as string

  return (
    <Form action={'/login'} method={'POST'} onError={(e) => console.log(e)}>
      <Box align={'center'} gap={'small'}>
        <img src={'/wide-logo.png'} alt={'YieldX wide logo'} />
        <Heading level={3} margin={{ bottom: 'small', top: 'none' }}>
          RedMite Dashboard
        </Heading>
        <Box gap={'small'}>
          <TextField label={'Username'} name={'username'} />
          <TextField label={'Password'} name={'password'} type={'password'} />
        </Box>
        <Text color={'status-error'}>{error ?? ''}</Text>
        <Button label={'Login'} type={'submit'} primary />
      </Box>
    </Form>
  )
}

export default SignIn
