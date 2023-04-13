import { useContext } from 'react'
import { DataTable, Main } from 'grommet'
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
    <Main>
      <DataTable
        columns={[{ property: 'status', render: (datum) => calcStatus(datum) }]}
        primaryKey={'id'}
        data={Object.values(devices ?? {})}
      />
    </Main>
  )
}

export default Devices
