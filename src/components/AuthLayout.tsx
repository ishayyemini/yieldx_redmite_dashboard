import { Box, Button, Card, Heading, Main } from 'grommet'

import { TextField } from './app/AppComponents'

const AuthLayout = () => {
  return (
    <Main align={'center'} justify={'center'}>
      <Card>
        <form>
          <Box align={'center'}>
            <img src={'/wide-logo.png'} alt={'YieldX wide logo'} />
            <Heading level={3} margin={'none'}>
              RedMite Dashboard
            </Heading>
            <Box gap={'small'} margin={{ vertical: 'medium' }}>
              <TextField label={'Username'} name={'username'} />
              <TextField
                label={'Password'}
                name={'password'}
                type={'password'}
              />
            </Box>
            <Button label={'Login'} type={'submit'} primary />
          </Box>
        </form>
      </Card>
    </Main>
  )
}

export default AuthLayout
