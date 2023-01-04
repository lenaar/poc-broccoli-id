/* eslint no-use-before-define: ["error", "nofunc"] */
import { hydrateRoot } from 'react-dom/client'

// @ts-check

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { WebContextProvider } from './context/WebContext'
import { uncompressData } from './context/compress'
import { AdminContextProvider } from './context/AdminContext'
import { ErrorBoundary } from 'react-error-boundary'

import '../../css/node-web.scss'

import Start from './pages/Start'
import AdminStart from './pages/AdminStart'
import Simple from './pages/Simple'

export default appFactory

function ErrorFallback({ error, resetErrorBoundary }) {
  console.error(error)
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}
_renderOnClientSide()

function _renderOnClientSide() {
  const isClientSide = typeof window !== 'undefined'
  if (!isClientSide) {
    return
  }

  const webContext = {}
  uncompressData(webContext)

  const basename = webContext.proxyPrefixPath.uri

  const app = (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        location.reload()
        // reset the state of your app so the error doesn't happen again
      }}
    >
      <BrowserRouter basename={basename}>{appFactory({}, webContext)}</BrowserRouter>{' '}
    </ErrorBoundary>
  )
  const domElement = document.getElementById('app')
  hydrateRoot(domElement, app)
}

function appFactory(applicationStore, context) {
  return (
    <WebContextProvider configIn={context}>
      <Routes>
        <Route exact path="/" element={<Start />} />
        <Route exact path="/node" element={<Start />} />

        <Route path="*" element={<Simple headingId="template_not_found_page_heading" />} />
      </Routes>
    </WebContextProvider>
  )
}
