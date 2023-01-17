import React from 'react'
import QRCode from 'react-qr-code'

import Button from '../components/Button'
import Results from '../components/Results'
import { useWebContext } from '../context/WebContext'

import { useAuthAsync, useQRAuthAsync } from '../hooks/authUseAsync'
import { useCollectAsync } from '../hooks/collectUseAsync'
import { useWebSocketLite } from '../hooks/wsHook.js'

function DynamicQRCode({ orderRef, collectStatus }) {
  const ws = useWebSocketLite({
    socketUrl: 'ws://localhost:8080/node',
  })

  function sendData() {
    // to resolve and clean ws interval on server side
    ws.send({ collectStatus, orderRef })
  }

  const { data: wsdata = {} } = ws || {}
  const { nextQRCodeStr = '' } = wsdata.message || {}

  React.useEffect(() => {
    // send collect status
    sendData()
    if (collectStatus === 'resolved') ws.send('close')
  }, [collectStatus])

  // if (collectStatus === 'resolved') return null

  return (
    <>
      <div style={{ height: 'auto', margin: '0 auto', maxWidth: 300, width: '100%' }}>
        <QRCode
          size={256}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          value={nextQRCodeStr} // || qrCodeStr
          viewBox={`0 0 256 256`}
        />
      </div>
    </>
  )
}

function QrCodeResults({ authStatus, authError = {}, authData }) {
  const { message: authMessage = '', orderRef = '' } = authData || {}
  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')

  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  return (
    <Results responseStatus={authStatus} error={authError}>
      <h3>Visa resultat</h3>
      {authStatus === 'resolved' && (
        <>
          <p>{authMessage}</p>
          <p>OrderRef: {orderRef}</p>

          <DynamicQRCode orderRef={orderRef} collectStatus={collectStatus} />
          {collectStatus === 'resolved' && (
            <>
              <h3>Collection data is finished</h3>
              <p>personalNumber: {collectData.completionData.user.personalNumber}</p>
              <p>Name: {collectData.completionData.user.name}</p>
              <p>Status: {collectData.status}</p>
            </>
          )}
        </>
      )}
    </Results>
  )
}

function QrCodeArea({ showQR }) {
  const {
    data: authData,
    status: authStatus,
    error: authError,
  } = useQRAuthAsync({ showQR, method: 'qrcode' }, 'onChange')

  console.log('authData', authData)
  console.log('authStatus', authStatus)
  console.log('authError', authError)

  return <QrCodeResults authStatus={authStatus} authError={authError} authData={authData} />
}

function SameDeviceResults({ authStatus, authError = {}, authData }) {
  const { message: authMessage = '', orderRef = '', autoStartToken = '' } = authData || {}
  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')

  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  return (
    <Results responseStatus={authStatus} error={authError}>
      <h3>Visa resultat</h3>
      {authStatus === 'resolved' && (
        <>
          <p>{authMessage}</p>
          <p>autoStartToken: {autoStartToken}</p>
          <p style={{ color: 'red' }}>
            Länk: <a href={`bankid:///?autostarttoken=${autoStartToken}&redirect=null`}>Start bank id</a>
          </p>

          {collectStatus === 'resolved' && (
            <>
              <h3>Collection data is finished</h3>
              <p>personalNumber: {collectData.completionData.user.personalNumber}</p>
              <p>Name: {collectData.completionData.user.name}</p>
              <p>Status: {collectData.status}</p>
            </>
          )}
        </>
      )}
    </Results>
  )
}

function SameDeviceArea({ showSameDevice }) {
  const {
    data: authData,
    status: authStatus,
    error: authError,
  } = useAuthAsync({ isActivated: showSameDevice, method: 'autostart' }, 'onChange')
  // const { message: authMessage = '', orderRef = '' } = authData || {}

  console.log('authData', authData)
  console.log('authStatus', authStatus)
  console.log('authError', authError)

  return <SameDeviceResults authStatus={authStatus} authError={authError} authData={authData} />
}

const Start = () => {
  const [webContext] = useWebContext()
  const { lang } = webContext
  const [showQR, setShowQR] = React.useState(false)
  const [showSameDevice, setUseSameDevice] = React.useState(false)

  return (
    <main id="mainContent">
      <h1>Aktivera och använda mobilt brocolliid</h1>
      <hr />
      <Button caption={`${showQR ? 'Stänga' : 'Använda'} QRCODE`} lang={lang} onClick={() => setShowQR(!showQR)} />
      <QrCodeArea showQR={showQR} />
      <br />
      <br />
      <br />

      <Button
        caption={`${showSameDevice ? 'Stänga' : 'Använda'} SAMMA ENHET`}
        lang={lang}
        onClick={() => setUseSameDevice(!showSameDevice)}
      />
      <SameDeviceArea showSameDevice={showSameDevice} />
    </main>
  )
}

export default Start
