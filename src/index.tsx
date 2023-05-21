import React from 'react'
import ReactDOM from 'react-dom/client'
import en from 'javascript-time-ago/locale/en'
import TimeAgo from 'javascript-time-ago'

import Top from './Top'
import * as serviceWorker from './serviceWorker'

TimeAgo.addDefaultLocale(en)

const root = ReactDOM.createRoot(document.getElementById('root') as Element)
root.render(
  <React.StrictMode>
    <Top />
  </React.StrictMode>
)

serviceWorker.register()
