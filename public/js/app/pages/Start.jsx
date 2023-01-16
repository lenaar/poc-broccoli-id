import React from 'react'
import QRCode from 'react-qr-code'

import Button from '../components/Button'
import Results from '../components/Results'
import { useWebContext } from '../context/WebContext'

import { STATUS, ERROR_ASYNC, useQrCodeAsync } from '../hooks/qrCodeUseAsync'
import { useAuthAsync, useQRAuthAsync } from '../hooks/authUseAsync'
import { useCollectAsync } from '../hooks/collectUseAsync'
// import { useWebSocketLite } from '../hooks/wsHook'

function QrCodeResults({ authStatus, authError = {}, authData }) {
  // const { data: authData, status: authStatus, error: authError } = useQRAuthAsync({ showQR }, 'onChange')
  const { message: authMessage = '', orderRef = '', qrCodeStr = '' } = authData || {}
  // useWebSocketLite
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
          <p>qrCodeStr: {qrCodeStr}</p>
          <div style={{ height: 'auto', margin: '0 auto', maxWidth: 300, width: '100%' }}>
            <QRCode
              size={256}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={qrCodeStr}
              viewBox={`0 0 256 256`}
            />
          </div>
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
  const { data: authData, status: authStatus, error: authError } = useQRAuthAsync({ showQR }, 'onChange')
  // const { message: authMessage = '', orderRef = '' } = authData || {}

  console.log('authData', authData)
  console.log('authStatus', authStatus)
  console.log('authError', authError)

  return <QrCodeResults authStatus={authStatus} authError={authError} authData={authData} />
}

function SameDeviceResults({ authStatus, authError = {}, authData }) {
  const { message: authMessage = '', orderRef = '', autoStartToken = '' } = authData || {}
  // useWebSocketLite
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
  } = useAuthAsync({ isActivated: showSameDevice }, 'onChange')
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
