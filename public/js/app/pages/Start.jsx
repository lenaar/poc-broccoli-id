import React from 'react'

import Button from '../components/Button'
import Results from '../components/Results'
import { useWebContext } from '../context/WebContext'
import QRCode from 'react-qr-code'

import { STATUS, ERROR_ASYNC, useQrCodeAsync } from '../hooks/qrCodeUseAsync'
import { useQRAuthAsync } from '../hooks/authUseAsync'
import { useCollectAsync } from '../hooks/collectUseAsync'

function QrCodeResults({ authStatus, authError = {}, authData }) {
  // const { data: authData, status: authStatus, error: authError } = useQRAuthAsync({ showQR }, 'onChange')
  const { message: authMessage = '', orderRef = '', qrCodeStr = '' } = authData || {}

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
              <p>Message{collectData.message}</p>
              <p>Status: {collectData.status}</p>
              <p>completionData: {collectData.completionData}</p>
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

const Start = () => {
  const [webContext] = useWebContext()
  const { lang } = webContext
  const [showQR, setShowQR] = React.useState(false)

  return (
    <main id="mainContent">
      <h1>Aktivera och använda mobilt brocolliid</h1>
      <hr />
      <Button
        caption={`${showQR ? 'Stänga' : 'Använda'} Mobilt broccoliid`}
        lang={lang}
        onClick={() => setShowQR(!showQR)}
      />
      <QrCodeArea showQR={showQR} />
    </main>
  )
}

export default Start
