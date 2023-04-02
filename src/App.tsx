import React from 'react'
import { Grommet, ThemeType } from 'grommet'
import { Outlet } from 'react-router-dom'
import { css } from 'styled-components'

import GlobalStyle from './components/app/GlobalStyle'

const theme: ThemeType = {
  global: {
    font: { family: 'Lato, sans-serif' },
    colors: {
      brand: 'var(--main)',
      'accent-1': 'var(--accent1)',
      'accent-2': 'var(--accent2)',
      muted: 'var(--muted)',
      border: 'var(--outline-variant)',
    },
  },
  checkBox: {
    color: 'var(--primary)',
  },
  dataTable: {
    pinned: { header: { background: 'var(--background)' } },
    body: {
      extend: css`
        tr:nth-of-type(odd) {
          background: var(--md-ref-palette-neutral95);
        }
        tr:nth-of-type(even) {
          background: var(--md-ref-palette-neutral98);
        }
      `,
    },
  },
  card: {
    container: {
      background: 'var(--surface-variant)',
      margin: 'small',
      pad: 'medium',
      round: 'small',
      elevation: 'none',
      extend: css`
        //color: var(--on-surface-variant);
      `,
    },
  },
  layer: {
    background: 'var(--background)',
  },
  button: {
    primary: {
      background: 'var(--primary)',
      font: { weight: 400 },
      extend: css`
        color: var(--on-primary);
        transition: opacity 0.2s;
      `,
    },
    default: {
      background: 'var(--secondary-container)',
      font: { weight: 400 },
      extend: css`
        color: var(--on-secondary-container);
        transition: opacity 0.2s;
      `,
    },
    secondary: {
      border: { color: 'var(--primary)', width: '1px' },
      font: { weight: 400 },
      extend: css`
        color: var(--primary);
        transition: opacity 0.2s;
      `,
    },
    hover: {
      extend: css`
        opacity: 0.8;
        transition: opacity 0.1s;
      `,
    },
  },
}

const App = () => {
  return (
    <Grommet theme={theme}>
      <GlobalStyle />
      <Outlet />
    </Grommet>
  )
}

export default App
