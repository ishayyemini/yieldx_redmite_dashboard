import { useContext, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Collapsible,
  DataTable,
  ResponsiveContext,
  Text,
} from 'grommet'
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
  const size = useContext(ResponsiveContext)

  const [open, setOpen] = useState(
    Object.fromEntries(Object.keys(devices ?? {}).map((id) => [id, false]))
  )

  const navigate = useNavigate()

  return size === 'small' ? (
    <>
      {Object.values(devices ?? {}).map((item, index) => (
        <Box
          fill={'horizontal'}
          border={'bottom'}
          background={`var(--md-ref-palette-neutral${index % 2 ? '95' : '98'})`}
          pad={'small'}
          onClick={() =>
            setOpen((oldOpen) => ({ ...oldOpen, [item.id]: !oldOpen[item.id] }))
          }
          key={item.id}
        >
          {['lior', 'amit', 'ishay2'].includes(user?.username ?? '') ? (
            <Text weight={'bold'} size={'small'}>
              Device ID: {item.id}
            </Text>
          ) : null}
          <Box direction={'row'} align={'center'} justify={'between'}>
            <Text>
              {item.location + ' -> ' + item.house + ' -> ' + item.inHouseLoc}
            </Text>
            <Box
              background={
                item.status.battery === 'Ok' ? 'var(--primary)' : 'var(--error)'
              }
              pad={'xsmall'}
            >
              <Text size={'small'} color={'var(--on-primary)'}>
                Battery {item.status.battery}
              </Text>
            </Box>
          </Box>
          <Text weight={'bold'}>Status: {calcStatus(item)}</Text>
          <Collapsible open={open[item.id]}>
            <Card gap={'small'}>
              <Box gap={'small'} direction={'row'}>
                <Box>
                  <Text>Start: </Text>
                  <Text>End: </Text>
                  <Text>Trained: </Text>
                  <Text>Detection: </Text>
                  <Text>Last Updated:</Text>
                </Box>
                <Box>
                  <Text>{item.status.start.toLocaleString()}</Text>
                  <Text>{item.status.end.toLocaleString()}</Text>
                  <Text>{item.status.trained.toLocaleString()}</Text>
                  <Text>{item.status.detection.toLocaleString()}</Text>
                  <Text>{item.lastUpdated.toLocaleString()}</Text>
                </Box>
              </Box>
              <Button
                label={'Edit Configuration'}
                onClick={() => navigate(item.id)}
                alignSelf={'center'}
                primary
              />
            </Card>
          </Collapsible>
        </Box>
      ))}
    </>
  ) : (
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
          header: 'Last Updated',
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
