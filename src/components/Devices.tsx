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

const calcStatus = (device: DeviceType): string => {
  let status
  const time = (
    deadline: Date | number | moment.Moment,
    ago: boolean = false
  ) => {
    const minutes =
      moment(deadline)
        .add(!ago && moment().isAfter(moment(deadline)) ? 1 : 0, 'day')
        .diff(moment(), 'minutes') * (ago ? -1 : 1)
    return minutes
      ? (minutes >= 60
          ? Math.floor(minutes / 60) + ' hour' + (minutes >= 120 ? 's' : '')
          : '') +
          (minutes >= 60 && minutes % 60 ? ' and ' : '') +
          (minutes % 60
            ? (minutes % 60) + ' minute' + (minutes % 60 > 1 ? 's' : '')
            : '')
      : 'now'
  }
  const timeByHour = (s: string, ago: boolean = false) => {
    const [hour, min] = s.split(':')
    const deadline = moment().hour(+hour).minute(+min)
    return time(deadline, ago)
  }

  switch (device.status.mode) {
    case 'PreOpen Lid':
      const pOpenTime =
        device.lastUpdated.getTime() + device.conf.training.preOpen * 60000
      status = `Starting ${
        pOpenTime < Date.now() ? 'now' : 'in ' + time(pOpenTime)
      }`
      break
    case 'Training':
      status = `Training in progress for ${time(device.status.start, true)}`
      break
    case 'Done Training':
    case 'Lid Closed Daily-Cycle Done':
      status = `Return to operation in ${timeByHour(device.conf.daily.open1)}`
      break
    case 'Lid Opened Idling':
      status = `Closing Lid in ${timeByHour(device.conf.daily.close1)}`
      break
    case 'Lid Closed Idling':
      status = `Inspecting in ${timeByHour(device.conf.detection.startDet)}`
      break
    case 'Inspecting':
    case 'Report Inspection':
      status = `Inspection in progress for ${timeByHour(
        device.conf.detection.startDet,
        true
      )}`
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
