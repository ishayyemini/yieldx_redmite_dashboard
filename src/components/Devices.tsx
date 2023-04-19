import { useContext } from 'react'
import { Box, DataTable, Text } from 'grommet'
import TimeAgo from 'javascript-time-ago'

import GlobalContext from '../data/GlobalContext'
import { DeviceType } from '../data/API'

const calcStatus = (device: DeviceType): string => {
  let status: string
  const timeAgo = new TimeAgo('en-GB')
  const time = (t: Date) => timeAgo.format(t).replace('ago', '')
  if (!device.start) status = 'Idle'
  else if (!device.end) status = `In training for ${time(device.start)}`
  else if (!device.trained) status = 'Training data done'
  else if (!device.detection)
    status = `System in detection for ${time(device.trained)}`
  else status = `Last detection attempt ${timeAgo.format(device.detection)}`
  return status
}

const Devices = () => {
  const { devices } = useContext(GlobalContext)

  return (
    <DataTable
      columns={[
        { property: 'location', header: 'Location' },
        { property: 'house', header: 'House' },
        { property: 'inHouseLoc', header: 'In House Location' },
        {
          property: 'battery',
          header: 'Battery',
          render: (datum) => (
            <Box
              background={
                datum.battery === 'Ok' ? 'var(--primary)' : 'var(--error)'
              }
              align={'center'}
              pad={'xsmall'}
              fill
            >
              <Text color={'var(--on-primary)'}>{datum.battery}</Text>
            </Box>
          ),
        },
        {
          property: 'start',
          header: 'Start',
          render: (datum) => datum.start?.toLocaleString(),
        },
        {
          property: 'end',
          header: 'End',
          render: (datum) => datum.end?.toLocaleString(),
        },
        {
          property: 'trained',
          header: 'Trained',
          render: (datum) => datum.trained?.toLocaleString(),
        },
        {
          property: 'detection',
          header: 'Detection',
          render: (datum) => datum.detection?.toLocaleString(),
        },
        {
          property: 'lastUpdated',
          header: 'LastUpdated',
          render: (datum) => datum.lastUpdated?.toLocaleString(),
        },
        {
          property: 'status',
          header: 'Status',
          render: (datum) => calcStatus(datum),
        },
      ]}
      data={Object.values(devices ?? {})}
      primaryKey={'id'}
      sortable
    />
  )
}

export default Devices
