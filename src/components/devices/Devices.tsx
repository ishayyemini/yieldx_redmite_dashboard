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
import { useNavigate, useOutletContext } from 'react-router-dom'
import styled from 'styled-components'

import GlobalContext from '../../data/GlobalContext'
import { StatusDisplay } from '../app/AppComponents'
import { DeviceType } from '../../data/API'

const OutdatedWrapper = styled(Box)`
  tr:has(span.error),
  .itemRow:has(span.error) {
    background: var(--error-container);
    color: var(--on-error-container);

    span.error {
      background: var(--error);
      color: var(--on-error);
      padding: 0 5px;
      box-decoration-break: clone;
    }
  }
`

const Devices = () => {
  const { devices, user } = useContext(GlobalContext)
  const { filterFunc } = useOutletContext() as {
    filterFunc: (device: DeviceType) => boolean
  }
  const size = useContext(ResponsiveContext)

  const [open, setOpen] = useState(
    Object.fromEntries(Object.keys(devices ?? {}).map((id) => [id, false]))
  )

  const navigate = useNavigate()

  const admin = ['lior', 'amit', 'ishay2'].includes(user?.username ?? '')

  const filteredDevices = Object.values(devices ?? {}).filter(filterFunc)

  return size === 'small' ? (
    <OutdatedWrapper>
      {filteredDevices.map((item, index) => (
        <Box
          fill={'horizontal'}
          border={'bottom'}
          background={`var(--md-ref-palette-neutral${index % 2 ? '95' : '98'})`}
          pad={'small'}
          onClick={() =>
            setOpen((oldOpen) => ({ ...oldOpen, [item.id]: !oldOpen[item.id] }))
          }
          className={'itemRow'}
          key={item.id}
        >
          {admin ? (
            <Box direction={'row'} justify={'between'}>
              <Text weight={'bold'} size={'small'}>
                Device ID: {item.id} {item.comment ? `(${item.comment})` : ''}
              </Text>
              <Text size={'small'}>{item.customer}</Text>
            </Box>
          ) : item.comment ? (
            <Text weight={'bold'} size={'small'}>
              Comment: {item.comment}
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
          <Text weight={'bold'}>
            Status: <StatusDisplay device={item} />{' '}
            <Text
              size={'small'}
              margin={{ top: '4px' }}
              style={{ float: 'right' }}
            >
              {item.version?.includes('-RM(')
                ? `V${item.version.split('-RM(')[0]}`
                : null}
              {item.version?.startsWith('http')
                ? `Updating to ${item.version.match(/(?<=fw).*?(?=\.bin)/)}`
                : null}
            </Text>
          </Text>
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
                label={'Manage Device'}
                onClick={() => navigate(item.id)}
                alignSelf={'center'}
                primary
              />
            </Card>
          </Collapsible>
        </Box>
      ))}
    </OutdatedWrapper>
  ) : (
    <OutdatedWrapper>
      <DataTable
        columns={[
          ...(admin
            ? [
                {
                  property: 'id',
                  header: 'Device ID',
                  render: (datum: DeviceType) =>
                    datum.id +
                    (datum.version?.includes('-RM(')
                      ? ` (V${datum.version.split('-RM(')[0]})`
                      : '') +
                    (datum.version?.startsWith('http')
                      ? ` (Updating to ${datum.version.match(
                          /(?<=fw).*?(?=\.bin)/
                        )})`
                      : ''),
                },
                { property: 'customer', header: 'Customer' },
              ]
            : []),
          { property: 'comment', header: 'Comment' },
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
            render: (datum) => <StatusDisplay device={datum} />,
          },
        ]}
        data={filteredDevices}
        onClickRow={({ datum }) => navigate(datum.id)}
        primaryKey={'id'}
        sortable
      />
    </OutdatedWrapper>
  )
}

export default Devices
