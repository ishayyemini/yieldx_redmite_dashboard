import { useContext, useEffect, useState } from 'react'
import { Box, Button, Card, Heading, Stack, Text } from 'grommet'
import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useNavigate,
} from 'react-router-dom'

import { Loader, TextField } from './app/AppComponents'
import GlobalContext from '../data/GlobalContext'
import API from '../data/API'

export const updateSettingsAction: ActionFunction = async (args) => {
  const data = await args.request.formData()
  const mqtt = data.get('mqtt')

  if (typeof mqtt !== 'string') return 'Bad form'

  return await API.updateSettings({ mqtt })
    .then(() => {
      API.setupMqtt()
      return redirect('/')
    })
    .catch((e) => e.message)
}

const Settings = () => {
  const error = useActionData() as string
  const { user } = useContext(GlobalContext)

  const [loading, toggleLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.admin) navigate('/', { replace: true })
  }, [navigate, user?.admin])

  useEffect(() => {
    toggleLoading(false)
  }, [error])

  return (
    <Card width={{ max: '400px' }} alignSelf={'center'}>
      <Form
        action={`/settings`}
        method={'POST'}
        onSubmit={() => toggleLoading(true)}
      >
        <Stack>
          <Box
            align={'center'}
            style={{ visibility: loading ? 'hidden' : 'initial' }}
            gap={'small'}
          >
            <Heading level={3} margin={'none'}>
              Settings
            </Heading>
            <Box fill>
              <TextField
                label={'MQTT (protocol://address:port)'}
                name={'mqtt'}
                defaultValue={
                  user?.settings?.mqtt || 'mqtts://broker.hivemq.com:8883'
                }
                pattern={'mqtts?://[a-z0-9-_.]+:[0-9]{2,4}'}
              />
            </Box>
            <Text color={'status-error'}>{error ?? ''}</Text>
            <Box direction={'row'} gap={'medium'}>
              <Button label={'Cancel'} onClick={() => navigate(-1)} secondary />
              <Button label={'Update'} type={'submit'} primary />
            </Box>
          </Box>

          {loading ? (
            <Box justify={'center'} align={'center'} fill>
              <Box gap={'small'}>
                <Loader />
                Submitting...
              </Box>
            </Box>
          ) : null}
        </Stack>
      </Form>
    </Card>
  )
}

export default Settings
