import { useContext, useEffect, useState } from 'react'
import { Box, Button, Heading, Stack, Text } from 'grommet'
import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useNavigate,
  useParams,
} from 'react-router-dom'
import moment from 'moment'

import { Loader, TextField } from '../app/AppComponents'
import GlobalContext from '../../data/GlobalContext'
import API, { DeviceUpdateType } from '../../data/API'

export const deviceConfigAction: ActionFunction = async (args) => {
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

  const [open, close, start] = [data.open1, data.close1, data.startDet].map(
    (item) =>
      moment({
        hours: Number(item.split(':')[0]),
        minutes: Number(item.split(':')[1]),
      })
  )
  if (close.isBefore(open)) close.add(1, 'day')
  if (start.isBefore(close)) start.add(1, 'day')

  const dailyCycle = start.diff(open, 'minutes') + data.detect

  if (dailyCycle > 24 * 60) return "Total daily cycle mustn't be over 24 hours"

  if (args.params.id)
    return await API.updateDeviceConf(args.params.id, data)
      .then(() => redirect('..'))
      .catch((e) => e.message)
  else return redirect('/')
}

const DeviceConfig = () => {
  const { id } = useParams() as { id: string }
  const error = useActionData() as string
  const { devices } = useContext(GlobalContext)

  const [loading, toggleLoading] = useState(false)

  useEffect(() => {
    toggleLoading(false)
  }, [error])

  const navigate = useNavigate()

  const device = devices?.[id]

  return device ? (
    <Form method={'POST'} onSubmit={() => toggleLoading(true)}>
      <Stack>
        <Box
          align={'center'}
          style={{ visibility: loading ? 'hidden' : 'initial' }}
        >
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
              <TextField
                label={'Comment'}
                name={'comment'}
                defaultValue={device.comment}
              />
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
                label={'Vent Duration [secs]'}
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
                label={'Run Vent [secs]'}
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
            <Button label={'Cancel'} onClick={() => navigate('/')} secondary />
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
  ) : null
}

export default DeviceConfig
