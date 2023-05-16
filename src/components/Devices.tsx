import { useContext } from 'react'
import { Box, DataTable, Text } from 'grommet'
import TimeAgo from 'javascript-time-ago'
import { useNavigate } from 'react-router'

import GlobalContext from '../data/GlobalContext'
import { DeviceType } from '../data/API'

const calcStatus = (device: DeviceType): string => {
  let status: string
  const timeAgo = new TimeAgo('en-GB')
  const time = (t: Date) => timeAgo.format(t).replace('ago', '')
  if (!device.status.start) status = 'Idle'
  else if (!device.status.end)
    status = `In training for ${time(device.status.start)}`
  else if (!device.status.trained) status = 'Training data done'
  else if (!device.status.detection)
    status = `System in detection for ${time(device.status.trained)}`
  else
    status = `Last detection attempt ${timeAgo.format(device.status.detection)}`
  return status
}

const Devices = () => {
  const { devices, user } = useContext(GlobalContext)

  const navigate = useNavigate()

  return (
    <DataTable
      columns={[
        ...(['lior', 'amit', 'ishay2'].includes(user?.username ?? '')
          ? [{ property: 'id', header: 'Device ID' }]
          : []),
        { property: 'location', header: 'Location' },
        { property: 'house', header: 'House' },
        { property: 'inHouseLoc', header: 'In House Location' },
        {
          property: 'battery',
          header: 'Battery',
          render: (datum) => (
            <Box
              background={
                datum.status.battery === 'Ok'
                  ? 'var(--primary)'
                  : 'var(--error)'
              }
              align={'center'}
              pad={'xsmall'}
              fill
            >
              <Text color={'var(--on-primary)'}>{datum.status.battery}</Text>
            </Box>
          ),
        },
        {
          property: 'start',
          header: 'Start',
          render: (datum) => datum.status.start.toLocaleString(),
        },
        {
          property: 'end',
          header: 'End',
          render: (datum) => datum.status.end.toLocaleString(),
        },
        {
          property: 'trained',
          header: 'Trained',
          render: (datum) => datum.status.trained.toLocaleString(),
        },
        {
          property: 'detection',
          header: 'Detection',
          render: (datum) => datum.status.detection.toLocaleString(),
        },
        {
          property: 'lastUpdated',
          header: 'LastUpdated',
          render: (datum) => datum.lastUpdated.toLocaleString(),
        },
        {
          property: 'status',
          header: 'Status',
          render: (datum) => calcStatus(datum),
        },
      ]}
      data={Object.values(devices ?? {})}
      onClickRow={({ datum }) => navigate(datum.id)}
      primaryKey={'id'}
      sortable
    />
  )
}

export default Devices
