import React from 'react'
import QRCode from 'react-qr-code'

import Button from '../components/Button'
import Results from '../components/Results'
import { useWebContext } from '../context/WebContext'

import { useAuthAsync, useQRAuthAsync } from '../hooks/authUseAsync'
import { useCollectAsync } from '../hooks/collectUseAsync'
import { useSignByPersonalNumberAsync, useQRSignAsync } from '../hooks/signUseAsync'
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

function QRCodeAuthResults({ authStatus, authError = {}, authData }) {
  const { message: authMessage = '', orderRef = '' } = authData || {}
  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')
  const [webContext, setWebContext] = useWebContext()
  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  if (collectStatus === 'resolved') {
    setWebContext({
      ...webContext,
      authCollectStatus: collectStatus,
      method: 'qrcode',
      user: collectData.completionData.user,
    })
  }

  return (
    <Results responseStatus={authStatus} error={authError}>
      <h3>Authentication result</h3>
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

function QRCodeSignResults({ signStatus, signError = {}, signData }) {
  const { message: signMessage = '', orderRef = '' } = signData || {}
  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')

  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  return (
    <Results responseStatus={signStatus} error={signError}>
      <h3>Signing result</h3>
      {signStatus === 'resolved' && (
        <>
          <p>{signMessage}</p>
          <p>OrderRef: {orderRef}</p>

          <DynamicQRCode orderRef={orderRef} collectStatus={collectStatus} />
          {collectStatus === 'resolved' && (
            <>
              <h3>Signing data is finished</h3>
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

function QRCodeAuthArea({ showQR }) {
  const {
    data: authData,
    status: authStatus,
    error: authError,
  } = useQRAuthAsync({ showQR, method: 'qrcode' }, 'onChange')
  const [{ authCollectStatus }] = useWebContext()

  if (authCollectStatus === 'resolved') return null // TODO: update when user cancel/restart

  console.log('authData', authData)
  console.log('authStatus', authStatus)
  console.log('authError', authError)

  return (
    <>
      <QRCodeAuthResults authStatus={authStatus} authError={authError} authData={authData} />
    </>
  )
}

function QRCodeSignArea({ signByQR }) {
  // const [{ authCollectStatus }] = useWebContext()
  // const isUserAuthenticated = authCollectStatus === 'resolved'
  // const isQRCodeWasUsed = method === 'qrcode'
  // if (!isUserAuthenticated || !signByQR) return null
  if (!signByQR) return null

  const {
    data: signData,
    status: signStatus,
    error: signError,
  } = useQRSignAsync({ signByQR, method: 'qrcode' }, 'onChange')

  console.log('signData', signData)
  console.log('signStatus', signStatus)
  console.log('signError', signError)

  return (
    <>
      <QRCodeSignResults signStatus={signStatus} signError={signError} signData={signData} />
    </>
  )
}

function SignResults({ signStatus, signError = {}, signData }) {
  const { orderRef = '' } = signData || {}
  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')

  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  return (
    <Results responseStatus={signStatus} error={signError}>
      <h3>Signing result</h3>
      {collectStatus === 'resolved' && (
        <>
          <h3>Signing data is finished</h3>
          <p>personalNumber: {collectData.completionData.user.personalNumber}</p>
          <p>Name: {collectData.completionData.user.name}</p>
          <p>Status: {collectData.status}</p>
        </>
      )}
    </Results>
  )
}

function SignArea() {
  const [{ authCollectStatus, user = {} }] = useWebContext()
  const isUserAuthenticated = authCollectStatus === 'resolved'
  if (!isUserAuthenticated) return null
  const { personalNumber } = user
  const {
    data: signData,
    status: signStatus,
    error: signError,
  } = useSignByPersonalNumberAsync({ personalNumber }, 'onChange')

  // TODO IF NO AUTH, THEN MAYBE USE QRCODE/AUTOSTART

  console.log('signData', signData)
  console.log('signStatus', signStatus)
  console.log('signError', signError)

  return (
    <>
      <SignResults signStatus={signStatus} signError={signError} signData={signData} />
    </>
  )
}

function SameDeviceResults({ authStatus, authError = {}, authData }) {
  const [webContext, setWebContext] = useWebContext()

  const { message: authMessage = '', orderRef = '', autoStartToken = '' } = authData || {}
  const { data: collectData, status: collectStatus, error: collectError } = useCollectAsync({ orderRef }, 'onChange')

  console.log('collectData', collectData)
  console.log('collectStatus', collectStatus)
  console.log('collectError', collectError)

  if (collectStatus === 'resolved')
    setWebContext({
      ...webContext,
      authCollectStatus: collectStatus,
      method: 'autostart',
      user: collectData.completionData.user,
    })

  return (
    <Results responseStatus={authStatus} error={authError}>
      <h3>Activate in the same device</h3>
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

  const [signByQR, setUseSignByQR] = React.useState(false)

  return (
    <main id="mainContent">
      <h1>Aktivera och använda mobilt brocolliid</h1>
      <hr />
      <Button caption={`${showQR ? 'Stänga' : 'Använda'} QRCODE`} lang={lang} onClick={() => setShowQR(!showQR)} />
      <QRCodeAuthArea showQR={showQR} />
      {signByQR && <QRCodeSignArea signByQR={signByQR} />}
      <br />
      <br />
      <br />

      <Button
        caption={`${showSameDevice ? 'Stänga' : 'Använda'} SAMMA ENHET`}
        lang={lang}
        onClick={() => setUseSameDevice(!showSameDevice)}
      />
      <SameDeviceArea showSameDevice={showSameDevice} />

      <hr />

      <br />
      <br />
      <br />

      <Button caption="Signera med användning av QR CODE" lang={lang} onClick={() => setUseSignByQR(true)} />

      <SignArea />
    </main>
  )
}

export default Start
