import React from 'react'

import Button from '../components/Button'
import Results from '../components/Results'
import { useWebContext } from '../context/WebContext'

import { STATUS, ERROR_ASYNC, useQrCodeAsync } from '../hooks/qrCodeUseAsync'
import { useAuthAsync } from '../hooks/authUseAsync'
import { useCollectAsync } from '../hooks/collectUseAsync'

function QrCodeResults({ responseStatus, error = {}, data }) {
  const [prn, setPrm] = React.useState('')

  const { data: authData, status: authStatus, error: authError } = useAuthAsync({ prn }, 'onChange')
  const { message: authMessage = '', orderRef = '' } = authData || {}

  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')
  console.log('prn', prn)
  console.log('authData', authData)
  console.log('authStatus', authStatus)
  console.log('authError', authError)

  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  return (
    <Results responseStatus={responseStatus} error={error}>
      <h3>Visa resultat</h3>
      {responseStatus === 'resolved' && (
        <>
          <p>{data.qrCode}</p>
          <input type="text" value={prn} name="personal-number" onChange={e => setPrm(e.target.value)} />
          {authStatus === 'resolved' && (
            <>
              <p>{authMessage}</p>
              <p>OrderRef: {orderRef}</p>
            </>
          )}

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
  const state = useQrCodeAsync({ showQR }, 'onChange')
  console.log('state in QrCodeArea', state)

  const { data, status: responseStatus, error = {} } = state || {}
  return <QrCodeResults responseStatus={responseStatus} error={error} data={data} />
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
