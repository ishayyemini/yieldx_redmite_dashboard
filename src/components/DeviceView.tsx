import { useContext, useEffect, useState } from 'react'
import { Box, Button, Card, Heading, Stack, Text } from 'grommet'
import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { Loader, TextField } from './app/AppComponents'
import GlobalContext from '../data/GlobalContext'
import API, { DeviceUpdateType } from '../data/API'

export const deviceUpdateAction: ActionFunction = async (args) => {
  const data = Object.fromEntries(
    [...(await args.request.formData())].map(([key, value]) => [
      key,
      [
        'preOpen',
        'ventDur',
        'on1',
        'sleep1',
        'train',
        'vent2',
        'on2',
        'sleep2',
        'detect',
      ].includes(key)
        ? +value
        : value,
    ])
  ) as DeviceUpdateType

  if (args.params.id)
    return await API.updateDeviceConf(args.params.id, data)
      .then(() => redirect('/'))
      .catch((e) => e.message)
  else return redirect('/')
}

const DeviceView = () => {
  const { id } = useParams() as { id: string }
  const error = useActionData() as string
  const { devices, user } = useContext(GlobalContext)

  const [loading, toggleLoading] = useState(false)

  useEffect(() => {
    toggleLoading(false)
  }, [error])

  const navigate = useNavigate()

  const device = devices?.[id]

  return device ? (
    <Card width={{ max: '400px' }} alignSelf={'center'}>
      <Form
        action={`/${id}`}
        method={'POST'}
        onSubmit={() => toggleLoading(true)}
      >
        <Stack>
          <Box
            align={'center'}
            style={{ visibility: loading ? 'hidden' : 'initial' }}
          >
            <Heading level={3} margin={'none'}>
              Update Configuration
            </Heading>
            {['lior', 'amit', 'ishay2'].includes(user?.username ?? '') ? (
              <Heading level={5} margin={'xsmall'}>
                Device ID: {device.id}
              </Heading>
            ) : null}
            <Box gap={'small'} margin={{ vertical: 'medium' }} fill>
              <Box border={'bottom'} pad={{ bottom: 'small' }} gap={'small'}>
                <TextField
                  label={'Location'}
                  name={'location'}
                  defaultValue={device.location}
                />
                <TextField
                  label={'House'}
                  name={'house'}
                  defaultValue={device.house}
                />
                <TextField
                  label={'In House Location'}
                  name={'inHouseLoc'}
                  defaultValue={device.inHouseLoc}
                />
                <TextField
                  label={'Contact'}
                  name={'contact'}
                  defaultValue={device.contact}
                />
                <TextField label={'Comment'} name={'comment'} />
              </Box>

              <Box border={'bottom'} pad={{ bottom: 'small' }} gap={'small'}>
                <Heading level={4} margin={'none'}>
                  Training Cycle
                </Heading>
                <TextField
                  label={'Pre Open Lid [mins]'}
                  name={'preOpen'}
                  defaultValue={device.conf.training.preOpen}
                />
                <TextField
                  label={'Vent Duration [mins]'}
                  name={'ventDur'}
                  defaultValue={device.conf.training.ventDur}
                />
                <Box direction={'row'} gap={'small'}>
                  <TextField
                    label={'Measure [mins]'}
                    name={'on1'}
                    defaultValue={device.conf.training.on1}
                  />
                  <TextField
                    label={'Sleep [mins]'}
                    name={'sleep1'}
                    defaultValue={device.conf.training.sleep1}
                  />
                </Box>
                <TextField
                  label={'Total Duration [mins]'}
                  name={'train'}
                  defaultValue={device.conf.training.train}
                />
              </Box>

              <Box border={'bottom'} pad={{ bottom: 'small' }} gap={'small'}>
                <Heading level={4} margin={'none'}>
                  Detection Cycle
                </Heading>
                <TextField
                  label={'Open Lid [HH:MM]'}
                  name={'open1'}
                  type={'time'}
                  defaultValue={device.conf.detection.open1}
                />
                <TextField
                  label={'Close Lid [HH:MM]'}
                  name={'close1'}
                  type={'time'}
                  defaultValue={device.conf.detection.close1}
                />
                <TextField
                  label={'Start [HH:MM]'}
                  name={'startDet'}
                  type={'time'}
                  defaultValue={device.conf.detection.startDet}
                />
                <TextField
                  label={'Run Vent [mins]'}
                  name={'vent2'}
                  defaultValue={device.conf.detection.vent2}
                />
                <Box direction={'row'} gap={'small'}>
                  <TextField
                    label={'Measure [mins]'}
                    name={'on2'}
                    defaultValue={device.conf.detection.on2}
                  />
                  <TextField
                    label={'Sleep [mins]'}
                    name={'sleep2'}
                    defaultValue={device.conf.detection.sleep2}
                  />
                </Box>
                <TextField
                  label={'Total Duration [mins]'}
                  name={'detect'}
                  defaultValue={device.conf.detection.detect}
                />
              </Box>
            </Box>

            {error ? (
              <Text color={'status-error'} margin={{ bottom: 'medium' }}>
                {error ?? ''}
              </Text>
            ) : null}

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
  ) : null
}

export default DeviceView
