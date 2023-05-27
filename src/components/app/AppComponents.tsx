import {
  FC,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  useEffect,
  useState,
} from 'react'
import { Box, Card, Layer, Text } from 'grommet'
import styled from 'styled-components'
import * as Icons from 'grommet-icons'
import { Oval } from 'react-loader-spinner'
import 'react-circular-progressbar/dist/styles.css'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import moment from 'moment'

import { DeviceType } from '../../data/API'

const TextFieldWrapper = styled(Box)<{ error?: string }>`
  position: relative;
  background-color: inherit;
  flex-direction: row;

  fieldset {
    position: absolute;
    padding: 0 9px;
    margin: 0;
    border: 1px solid var(${(props) => (props.error ? '--error' : '--outline')});
    border-radius: 4px;
    bottom: 0;
    right: 0;
    top: -5px;
    left: 0;
  }

  input {
    width: 100%;
  }

  legend {
    visibility: hidden;
    font-size: 0.65em;
    line-height: 1em;
    transition: max-width 50ms cubic-bezier(0, 0, 0.2, 1) 0ms;

    padding: 0;
    max-width: 0.001px;
  }

  input {
    z-index: 1;
    padding: 13px;
    border: none;
    background-color: inherit;
    color: var(--on-surface);
  }

  label {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  span {
    font-size: 0.9em;
    padding: 0 13px;
    color: var(
      ${(props) => (props.error ? '--error' : '--on-surface-variant')}
    );
    opacity: 0.3;
    font-style: italic;
    transition: transform 0.15s ease-out, font-size 0.15s ease-out,
      background-color 0.2s ease-out, color 0.15s ease-out,
      opacity 0.15s ease-out;
  }

  svg {
    align-self: center;
    position: absolute;
    right: 10px;
  }

  input:-webkit-autofill {
    transition: background-color 5000s ease-in-out 0s;
  }

  input:focus {
    outline: none;
  }

  input:focus + label span,
  input:-webkit-autofill + label span,
  input:not(:placeholder-shown) + label span {
    background-color: inherit;
    font-size: 0.65em;
    padding: 0 13px;
    opacity: 1;
    color: var(${(props) => (props.error ? '--error' : '--outline')});
    transform: translate(0, -21px);
  }

  input:focus ~ fieldset legend,
  input:-webkit-autofill ~ fieldset legend,
  input:not(:placeholder-shown) ~ fieldset legend {
    padding: 0 3px;
    max-width: 100%;
  }

  input:hover {
    color: var(--on-surface);
  }

  input:hover + label span,
  input:hover ~ fieldset,
  input:hover ~ svg {
    color: var(
      ${(props) => (props.error ? '--on-error-container' : '--on-surface')}
    );
    border-color: var(
      ${(props) => (props.error ? '--on-error-container' : '--on-surface')}
    );
    opacity: 1;
    stroke: var(--on-error-container);
  }

  input:focus + label span,
  input:focus ~ fieldset,
  input:focus ~ svg {
    border-color: var(${(props) => (props.error ? '--error' : '--primary')});
    color: var(${(props) => (props.error ? '--error' : '--primary')});
    stroke: var(--error);
    opacity: 1;
    border-width: 2px;
  }
`

interface TextFieldProps extends Partial<JSX.IntrinsicElements['input']> {
  label: string
  error?: string
}

const TextField: ForwardRefExoticComponent<
  PropsWithoutRef<TextFieldProps> & RefAttributes<HTMLInputElement>
> = forwardRef(({ label, name, error, ...args }, ref) => {
  return (
    <>
      <TextFieldWrapper error={error}>
        <input name={name} id={name} {...args} placeholder={' '} ref={ref} />
        <label htmlFor={name}>
          <span>{label}</span>
        </label>
        <fieldset>
          <legend style={{ whiteSpace: 'nowrap' }}>{label}</legend>
        </fieldset>
        {error ? <Icons.StatusCritical color={'var(--error)'} /> : null}
      </TextFieldWrapper>
      {error ? (
        <Text margin={'5px 13px'} size={'0.6em'} color={'var(--error)'}>
          {error}
        </Text>
      ) : null}
    </>
  )
})

const Loader: FC<{ full?: boolean; size?: string }> = ({ full, size }) => {
  const spinner = (
    <Box align={'center'} justify={'center'} fill>
      <Oval
        secondaryColor={'var(--surface-variant)'}
        color={'var(--primary)'}
        height={size}
        width={size}
      />
    </Box>
  )

  return full ? (
    <Layer animation={'none'} full>
      {spinner}
    </Layer>
  ) : (
    spinner
  )
}

const ProgressLoader: FC<
  | { percentage?: number; size?: string; stub?: false; label?: string }
  | { stub: true; size?: string; percentage?: undefined; label?: string }
> = ({ size = '80px', percentage, stub, label }) => {
  const [stubbed, setStubbed] = useState<number>(0)
  useEffect(() => {
    let stubInterval: NodeJS.Timer | undefined
    if (stub && !percentage)
      stubInterval = setInterval(
        () =>
          setStubbed((old) => Math.min(old + Math.random() * (6 - 3) + 3, 95)),
        1000
      )
    return () => {
      if (stubInterval) clearInterval(stubInterval)
    }
  })

  return (
    <Box align={'center'} justify={'center'} fill>
      <Card align={'center'} justify={'center'} gap={'small'}>
        <Box height={size} width={size}>
          <CircularProgressbar
            value={stub ? stubbed : Number(percentage)}
            text={`${stub ? Math.round(stubbed) : Number(percentage)}%`}
            styles={buildStyles({
              pathColor: `var(--primary)`,
              textColor: 'var(--primary)',
              trailColor: 'var(--surface-variant)',
              backgroundColor: 'var(--surface-variant)',
              textSize: '24px',
              strokeLinecap: 'flat',
            })}
            strokeWidth={5}
          />
        </Box>
        {stub && stubbed >= 95 ? 'Still loading...' : 'Loading...'}
        {label}
      </Card>
    </Box>
  )
}

// const FAB = styled(Button)`
//   width: 48px;
//   height: 48px;
//   padding: 0;
//   align-items: center;
//   justify-content: center;
//   display: flex;
//   box-shadow: black 0 0 10px 10px;
// `

const CollapsibleSide = styled(Box).attrs({
  round: { corner: 'left', size: 'medium' },
})<{ open: boolean | string }>`
  position: absolute;
  align-self: center;
  height: 300px;
  width: ${(props) =>
    props.open
      ? typeof props.open === 'string'
        ? props.open
        : '350px'
      : '0px'};
  box-shadow: ${(props) =>
    props.open ? 'rgb(0 0 0 / 10%) 0 0 50px 50px' : 'none'};
  transition: width 0.3s ease 0s, box-shadow 0.3s ease 0s;
  right: 0;
  z-index: 1;
  overflow: hidden;
  background: var(--surface-variant);
`

const calcTime = (
  deadline: string | Date | number | moment.Moment,
  ago: boolean = false
): string => {
  if (typeof deadline === 'string') {
    const [hour, min] = deadline.split(':')
    deadline = moment().hour(+hour).minute(+min)
    if (ago && deadline.isAfter(moment())) deadline.subtract(1, 'day')
    if (!ago && deadline.isBefore(moment())) deadline.add(1, 'day')
  }
  deadline = moment(deadline).second(0)
  const now = moment().second(0)

  const minutes = deadline.diff(now, 'minutes') * (ago ? -1 : 1)

  return (
    (minutes >= 60
      ? Math.floor(minutes / 60) + ' hour' + (minutes >= 120 ? 's' : '')
      : '') +
    (minutes >= 60 && minutes % 60 ? ' and ' : '') +
    (minutes > 0 && minutes % 60
      ? (minutes % 60) + ' minute' + (minutes % 60 > 1 ? 's' : '')
      : '')
  )
}

const StatusDisplay: FC<{ device: DeviceType }> = ({ device }) => {
  const [, refreshTime] = useState(moment().minutes())

  useEffect(() => {
    setInterval(() => refreshTime(moment().minutes()), 1000)
  }, [])

  let time, status
  const isOutdated = moment().subtract(10, 'minutes').isAfter(device.nextUpdate)

  switch (device.status.mode) {
    case 'PreOpen Lid':
      time = calcTime(device.nextUpdate)
      status = time ? `Starting in ${time}` : 'Starting'
      if (isOutdated) status = "Device didn't start training"
      break
    case 'Training':
      time = calcTime(device.status.start, true)
      status = time
        ? `Training in progress for ${time}`
        : 'Training started just now'
      if (isOutdated)
        status = `Device stuck in training mode and didn't update for ${
          moment().diff(device.nextUpdate, 'days') < 1
            ? calcTime(device.nextUpdate, true)
            : 'more than a day'
        }`
      break
    case 'Done Training':
    case 'Lid Closed Daily-Cycle Done':
      time = calcTime(device.nextUpdate)
      status = time ? `Return to operation in ${time}` : 'Starting'
      if (isOutdated) status = "Device didn't start daily cycle"
      break
    case 'Lid Opened Idling':
      time = calcTime(device.nextUpdate)
      status = time ? `Closing lid in ${time}` : 'Closing lid now'
      if (isOutdated)
        status = "Device stuck in daily cycle and didn't close lid"
      break
    case 'Lid Closed Idling':
      time = calcTime(device.nextUpdate)
      status = time ? `Inspecting in ${time}` : 'Starting inspection'
      if (isOutdated) status = "Device didn't start inspection"
      break
    case 'Inspecting':
    case 'Report Inspection':
      time = calcTime(device.conf.detection.startDet, true)
      status = time
        ? `Inspection in progress for ${time}`
        : 'Inspection started just now'
      if (isOutdated)
        status = `Device stuck in inspection mode and didn't update for ${
          moment().diff(device.nextUpdate, 'days') < 1
            ? calcTime(device.nextUpdate, true)
            : 'more than a day'
        }`
      break
    default:
      status = device.status.mode
  }

  return <Text className={isOutdated ? 'error' : ''}>{status}</Text>
}

export { TextField, Loader, CollapsibleSide, ProgressLoader, StatusDisplay }
