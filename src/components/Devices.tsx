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
import { useNavigate } from 'react-router'
import moment from 'moment'

import GlobalContext from '../data/GlobalContext'
import { DeviceType } from '../data/API'

const calcTime = (
  deadline: string | Date | number | moment.Moment,
  ago: boolean = false
): string => {
  if (typeof deadline === 'string') {
    const [hour, min] = deadline.split(':')
    deadline = moment().hour(+hour).minute(+min)
  }

  const minutes =
    moment(deadline)
      .add(!ago && moment().isAfter(moment(deadline)) ? 1 : 0, 'day')
      .diff(moment(), 'minutes') * (ago ? -1 : 1)

  return (
    (minutes >= 60
      ? Math.floor(minutes / 60) + ' hour' + (minutes >= 120 ? 's' : '')
      : '') +
    (minutes >= 60 && minutes % 60 ? ' and ' : '') +
    (minutes % 60
      ? (minutes % 60) + ' minute' + (minutes % 60 > 1 ? 's' : '')
      : '')
  )
}

const calcStatus = (device: DeviceType): string => {
  let time, status

  switch (device.status.mode) {
    case 'PreOpen Lid':
      time = calcTime(
        moment(device.lastUpdated).add(device.conf.training.preOpen, 'minutes')
      )
      status = time ? `Starting in ${time}` : 'Starting'
      break
    case 'Training':
      time = calcTime(device.status.start, true)
      status = time
        ? `Training in progress for ${time}`
        : 'Training started just now'
      break
    case 'Done Training':
    case 'Lid Closed Daily-Cycle Done':
      time = calcTime(device.conf.daily.open1)
      status = time ? `Return to operation in ${time}` : 'Starting'
      break
    case 'Lid Opened Idling':
      time = calcTime(device.conf.daily.close1)
      status = time ? `Closing lid in ${time}` : 'Closing lid now'
      break
    case 'Lid Closed Idling':
      time = calcTime(device.conf.detection.startDet)
      status = time ? `Inspecting in ${time}` : 'Starting inspection'
      break
    case 'Inspecting':
    case 'Report Inspection':
      time = calcTime(device.conf.detection.startDet, true)
      status = time
        ? `Inspection in progress for ${time}`
        : 'Inspection started just now'
      break
    default:
      status = device.status.mode
  }

  return status
}

const Devices = () => {
  const { devices, user } = useContext(GlobalContext)
  const size = useContext(ResponsiveContext)

  const [open, setOpen] = useState(
    Object.fromEntries(Object.keys(devices ?? {}).map((id) => [id, false]))
  )

  const navigate = useNavigate()

  const admin = ['lior', 'amit', 'ishay2'].includes(user?.username ?? '')

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
          {admin ? (
            <Box direction={'row'} justify={'between'}>
              <Text weight={'bold'} size={'small'}>
                Device ID: {item.id}
              </Text>
              <Text size={'small'}>{item.customer}</Text>
            </Box>
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
            <Card gap={'small'} width={'fit-content'} alignSelf={'center'}>
              <Box gap={'small'} direction={'row'}>
                <Box>
                  <Text>Start: </Text>
                  <Text>End: </Text>
                  <Text>Trained: </Text>
                  <Text>Last Inspection: </Text>
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
        ...(admin
          ? [
              { property: 'id', header: 'Device ID' },
              { property: 'customer', header: 'Customer' },
            ]
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
          header: 'Last Inspection',
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
