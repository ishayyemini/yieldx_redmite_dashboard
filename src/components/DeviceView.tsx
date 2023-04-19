import { useContext, useState } from 'react'
import { Box, Button, Card, Heading, Stack } from 'grommet'
import {
  ActionFunction,
  Form,
  redirect,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { Loader, TextField } from './app/AppComponents'
import GlobalContext from '../data/GlobalContext'
import { DeviceType } from '../data/API'

export const deviceUpdateAction: ActionFunction = async (args) => {
  const data = await args.request.formData()
  const Contact = data.get('contact')
  console.log(Contact)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  return redirect('/')
}

const DeviceView = () => {
  const { id } = useParams()
  const { devices } = useContext(GlobalContext)

  const [loading, toggleLoading] = useState(false)

  const navigate = useNavigate()

  const device = (id && devices?.[id]) || ({ id } as DeviceType)

  return (
    <Card width={{ max: '400px' }}>
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
              <Heading level={4} margin={'none'}>
                Technical configuration
              </Heading>
              <Box direction={'row'} gap={'small'}>
                <TextField label={'On Period'} name={'onPeriod'} />
                <TextField label={'On Period Det'} name={'onPeriodDet'} />
              </Box>
              <TextField label={'Train'} name={'train'} />
              <Box direction={'row'} gap={'small'}>
                <TextField label={'Sleep Period'} name={'sleepPeriod'} />
                <TextField label={'Sleep Period Det'} name={'sleepPeriodDet'} />
              </Box>
              <TextField label={'Ventilation Duration'} name={'ventDur'} />
            </Box>
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

export default DeviceView
