import { Box, Button, Grid, Text } from 'grommet'
import { useNavigate, useParams } from 'react-router-dom'
import { Fragment, useCallback, useContext, useEffect, useState } from 'react'
import moment from 'moment'
import * as Icons from 'grommet-icons'

import API from '../../data/API'
import GlobalContext from '../../data/GlobalContext'
import { Loader } from '../app/AppComponents'

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

  useEffect(() => {
    if (device?.lastUpdated) API.getDeviceHistory(id).then()
  }, [device?.lastUpdated, id])

  return device ? (
    <Box fill={'horizontal'} align={'center'} margin={{ top: 'medium' }}>
      <Box
        border={'bottom'}
        pad={{ bottom: 'small' }}
        align={'center'}
        fill={'horizontal'}
      >
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

      <Box
        height={{ max: '400px' }}
        width={'100%'}
        direction={'column-reverse'}
        overflow={'auto'}
        margin={{ bottom: 'medium' }}
        border={'bottom'}
      >
        {device.history?.map((operation, oIndex) => (
          <Box
            flex={false}
            key={oIndex}
            pad={{ vertical: 'small' }}
            border={oIndex ? 'bottom' : undefined}
          >
            <Text weight={'bold'} margin={{ bottom: 'xsmall' }}>
              {operation.category}{' '}
              {operation.cycles
                .find((cycle) => cycle?.start)
                ?.start.format('YYYY-MM-DD') ?? ''}
            </Text>

            <Grid columns={['auto', '1fr']} gap={{ column: 'small' }}>
              {operation.cycles.map((cycle, cIndex) => (
                <Fragment key={cIndex}>
                  <Text>
                    <Text style={{ textDecoration: 'underline' }}>
                      {operation.category === 'Training'
                        ? cIndex === 0
                          ? 'PreOpen Lid'
                          : `Cycle ${cIndex}`
                        : null}
                      {operation.category === 'Daily Cycle'
                        ? cIndex === 0
                          ? 'Lid Opened'
                          : cIndex === 1
                          ? 'Lid Closed'
                          : `Cycle ${cIndex - 1}`
                        : null}
                    </Text>
                    :
                  </Text>

                  {cycle ? (
                    <Box direction={'row'} gap={'xsmall'}>
                      {!cycle.end ? (
                        <Text style={{ fontStyle: 'italic' }}>
                          Expected at {cycle.start.format('HH:mm')}
                        </Text>
                      ) : (
                        <>
                          <Text>{cycle.start.format('HH:mm')}</Text>
                          <Icons.FormNextLink />
                          <Text
                            style={{
                              fontStyle: cycle.end.isAfter(moment())
                                ? 'italic'
                                : 'normal',
                            }}
                          >
                            {cycle.end.format('HH:mm')}
                          </Text>
                        </>
                      )}
                    </Box>
                  ) : (
                    <Text color={'var(--error)'}>Skipped</Text>
                  )}
                </Fragment>
              ))}
            </Grid>
          </Box>
        )) ?? (
          <Box justify={'center'} align={'center'} fill>
            <Box gap={'small'} margin={'medium'}>
              <Loader />
              Loading history...
            </Box>
          </Box>
        )}
      </Box>

      <Box direction={'row'} flex={false}>
        <Button label={'Close'} onClick={() => navigate('/')} secondary />
      </Box>
    </Box>
  ) : null
}

export default DeviceOverview
