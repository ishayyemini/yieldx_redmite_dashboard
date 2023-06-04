import { useContext, useEffect, useState } from 'react'
import { Box, Button, Heading, Select, Stack, Text } from 'grommet'
import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { Loader } from '../app/AppComponents'
import GlobalContext from '../../data/GlobalContext'
import API from '../../data/API'

export const deviceOtaAction: ActionFunction = async (args) => {
  const version = (await args.request.formData()).get('version')
  if (args.params.id && typeof version === 'string')
    return await API.updateDeviceOTA(args.params.id, version)
      .then(() => redirect('..'))
      .catch((e) => e.message)
  else return redirect('/')
}

const DeviceOTA = () => {
  const { id } = useParams() as { id: string }
  const error = useActionData() as string
  const { devices, otaList } = useContext(GlobalContext)

  const [loading, toggleLoading] = useState(false)

  useEffect(() => {
    toggleLoading(false)
  }, [error])

  const navigate = useNavigate()

  const device = devices?.[id]

  return device ? (
    <Form
      method={'POST'}
      onSubmit={() => toggleLoading(true)}
      style={{ width: '100%' }}
    >
      <Stack>
        <Box
          align={'center'}
          style={{ visibility: loading ? 'hidden' : 'initial' }}
        >
          <Box gap={'small'} margin={{ vertical: 'medium' }} fill>
            <Box border={'bottom'} pad={{ bottom: 'small' }} gap={'small'}>
              <Heading level={4} margin={'none'}>
                Current version
              </Heading>
              <Text>
                {device.version?.startsWith('http')
                  ? 'Updating to ' + device.version.match(/(?<=fw).*?(?=\.bin)/)
                  : device.version}
              </Text>
            </Box>

            <Box border={'bottom'} pad={{ bottom: 'small' }} gap={'small'}>
              <Heading level={4} margin={'none'}>
                Select new OTA version
              </Heading>
              <Select
                options={otaList}
                name={'version'}
                placeholder={'Choose Version'}
              />
            </Box>
          </Box>

          {error ? (
            <Text color={'status-error'} margin={{ bottom: 'medium' }}>
              {error ?? ''}
            </Text>
          ) : null}

          <Box direction={'row'} gap={'medium'}>
            <Button label={'Cancel'} onClick={() => navigate('/')} secondary />
            <Button label={'Push OTA'} type={'submit'} primary />
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
  ) : null
}

export default DeviceOTA
