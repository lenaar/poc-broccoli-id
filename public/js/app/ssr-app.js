/* eslint no-use-before-define: ["error", "nofunc"] */

// @ts-check

import React from 'react'
import { StaticRouter } from 'react-router-dom/server'

import ReactDOMServer from 'react-dom/server'
import { compressData } from './context/compress'

import appFactory from './app'

export default _getServerSideFunctions()

function _getServerSideFunctions() {
  return {
    getCompressedData(data, dataId) {
      const code = compressData(data, dataId)
      return code
    },
    // eslint-disable-next-line no-shadow
    renderStaticPage({ applicationStore, location, basename, context, adminContext }) {
      const app = (
        <StaticRouter basename={basename} location={location}>
          {appFactory(applicationStore, context, adminContext)}
        </StaticRouter>
      )

      return ReactDOMServer.renderToString(app)
    },
  }
}
