import { Box, Button } from 'grommet'
import { useNavigate, useParams } from 'react-router-dom'
import { useCallback, useContext, useEffect, useState } from 'react'

import API from '../../data/API'
import GlobalContext from '../../data/GlobalContext'

const DeviceOverview = () => {
  const { id } = useParams() as { id: string }
  const { devices } = useContext(GlobalContext)

  const [loading, toggleLoading] = useState(false)

  const navigate = useNavigate()

  const device = devices?.[id]

  useEffect(() => toggleLoading(false), [device?.hidden])

  const toggleHide = useCallback(() => {
    if (device) {
      toggleLoading(true)
      API.hideDevice(device.id, !device.hidden).then()
    }
  }, [device])

  return device ? (
    <Box
      gap={'medium'}
      fill={'horizontal'}
      align={'center'}
      margin={{ top: 'medium' }}
    >
      <Box border={'bottom'} pad={{ bottom: 'small' }} align={'center'} fill>
        <Button
          label={
            loading
              ? 'Updating...'
              : (device.hidden ? 'Unhide' : 'Hide') + ' Device'
          }
          onClick={toggleHide}
          disabled={loading}
          primary
        />
      </Box>

      <Box direction={'row'} flex={false}>
        <Button label={'Close'} onClick={() => navigate('/')} secondary />
      </Box>
    </Box>
  ) : null
}

export default DeviceOverview
