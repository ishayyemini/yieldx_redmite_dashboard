import { useContext, useEffect, useState } from 'react'
import { Box, Button, Card, Heading, Select, Stack, Text } from 'grommet'
import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useNavigate,
} from 'react-router-dom'

import { Loader } from './app/AppComponents'
import GlobalContext from '../data/GlobalContext'
import API from '../data/API'

const mqttServers: { name: string; value: string }[] = [
  {
    name: 'Broker Dashboard',
    value: 'mqtts://broker.hivemq.com:8883',
  },
  {
    name: 'YieldX New Server',
    value: 'mqtts://3.64.31.133:8884',
  },
]

export const updateSettingsAction: ActionFunction = async (args) => {
  const data = await args.request.formData()
  const mqtt = mqttServers.find((item) => item.name === data.get('mqtt'))?.value

  if (!mqtt) return 'Bad form'

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
              <Text margin={{ bottom: 'xsmall' }}>MQTT Server</Text>
              <Select
                options={mqttServers}
                name={'mqtt'}
                valueKey={'value'}
                labelKey={'name'}
                defaultValue={
                  mqttServers.find(
                    (item) => item.value === user?.settings?.mqtt
                  )?.value || 'mqtts://broker.hivemq.com:8883'
                }
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
