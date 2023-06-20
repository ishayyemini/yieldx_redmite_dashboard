import { Box, Button, Grid, Text } from 'grommet'
import { useNavigate, useParams } from 'react-router-dom'
import { Fragment, useCallback, useContext, useEffect, useState } from 'react'
import moment from 'moment'
import * as Icons from 'grommet-icons'
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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
    if (device?.lastUpdated) {
      API.getDeviceHistory(id).then()
      API.getDeviceDetections(id).then()
    }
  }, [device?.lastUpdated, id])

  return device ? (
    <Box fill align={'center'} margin={{ top: 'medium' }}>
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

      {device.detections?.length ? (
        <Box
          basis={'100px'}
          pad={{ vertical: 'small' }}
          width={'100%'}
          margin={{ bottom: 'medium' }}
          border={'bottom'}
          flex={'grow'}
        >
          <ResponsiveContainer width={'100%'} height={'100%'}>
            <BarChart
              width={200}
              height={400}
              data={(device.detections || []).map((item, index) => ({
                ...item,
                index,
              }))}
              barCategoryGap={0}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <Tooltip
                labelFormatter={(index, items) =>
                  moment(Number(items?.[0]?.payload?.timestamp) || null).format(
                    'YYYY-MM-DD HH:mm'
                  )
                }
                formatter={(value, _, item) =>
                  item?.payload?.newSession
                    ? ['Start', 'New Session']
                    : [Number(value).toFixed(6), 'Value']
                }
              />

              <ReferenceLine
                x={device.detections.findIndex((item) => item.newSession)}
                stroke={'var(--error)'}
              />

              <XAxis dataKey={'index'} hide />
              <YAxis domain={[0, 1]} style={{ fontSize: '0.7em' }} width={33} />
              <Bar dataKey={'value'} fill={'var(--primary)'} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      ) : null}

      <Box
        basis={'200px'}
        width={'100%'}
        direction={'column-reverse'}
        overflow={'auto'}
        margin={{ bottom: 'medium' }}
        border={'bottom'}
        flex={'grow'}
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

                  {!cycle ? (
                    <Text color={'var(--error)'}>Skipped</Text>
                  ) : (
                    <Box direction={'row'}>
                      <Text
                        style={{ fontStyle: !cycle.end ? 'italic' : 'normal' }}
                        title={cycle.start.toLocaleString()}
                      >
                        {!cycle.end ? 'Expected at ' : null}
                        {cycle.start.format('HH:mm')}
                      </Text>
                      {cycle.end ? (
                        <>
                          <Icons.FormNextLink />
                          <Text
                            style={{
                              fontStyle: cycle.end.isAfter(moment())
                                ? 'italic'
                                : 'normal',
                            }}
                            title={cycle.end.toLocaleString()}
                          >
                            {cycle.end.format('HH:mm')}
                          </Text>
                        </>
                      ) : null}
                    </Box>
                  )}

                  {operation.cycles[cIndex + 1]?.start.isAfter(
                    cycle?.end,
                    'days'
                  ) ? (
                    <Box
                      background={'var(--outline-variant)'}
                      style={{ gridColumn: 2, fontStyle: 'italic' }}
                      align={'center'}
                    >
                      Overnight
                    </Box>
                  ) : null}
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
