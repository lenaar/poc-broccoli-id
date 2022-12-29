/* eslint no-use-before-define: ["error", "nofunc"] */
import { hydrateRoot } from 'react-dom/client'

// @ts-check

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { WebContextProvider } from './context/WebContext'
import { uncompressData } from './context/compress'
import { AdminContextProvider } from './context/AdminContext'

import '../../css/node-web.scss'

import Start from './pages/Start'
import AdminStart from './pages/AdminStart'
import Simple from './pages/Simple'

export default appFactory

_renderOnClientSide()

function _renderOnClientSide() {
  const isClientSide = typeof window !== 'undefined'
  if (!isClientSide) {
    return
  }

  const webContext = {}
  uncompressData(webContext)

  const adminContext = {}
  uncompressData(adminContext, 'admin')

  const basename = webContext.proxyPrefixPath.uri

  const app = <BrowserRouter basename={basename}>{appFactory({}, webContext, adminContext)}</BrowserRouter>

  const domElement = document.getElementById('app')
  hydrateRoot(domElement, app)
}

function appFactory(applicationStore, context, adminContext) {
  return (
    <WebContextProvider configIn={context}>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/secure" element={<Simple headingId="template_secured_page_heading" />} />
        <Route path="/silent" element={<Simple headingId="template_silent_login_page_heading" />} />
        <Route
          path="/_admin"
          element={
            <AdminContextProvider configIn={adminContext}>
              <AdminStart />
            </AdminContextProvider>
          }
        />
        <Route path="*" element={<Simple headingId="template_not_found_page_heading" />} />
      </Routes>
    </WebContextProvider>
  )
}
