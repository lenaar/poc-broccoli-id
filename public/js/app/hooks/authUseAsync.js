import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useWebContext } from '../context/WebContext'
// import { Alert } from '../components/alert'
import { auth } from './api/bankIdApi'

const STATUS = {
  idle: 'idle',
  pending: 'pending',
  resolved: 'resolved',
  missingParameters: 'missingParameters',
  rejected: 'rejected',
}
const ERROR_ASYNC = {
  missingParameters: 'missingParameters',
  rejected: 'errorUnknown',
}

function asyncReducer(state, action) {
  switch (action.type) {
    case 'missingParameters': {
      return {
        status: STATUS.missingParameters,
        data: null,
        error: { errorType: ERROR_ASYNC.missingParameters, errorExtraText: 'smth missing' }, // action.data.missingValues()
      }
    }
    case 'pending': {
      return { status: STATUS.pending, data: null, error: {} }
    }
    case 'resolved': {
      return { status: STATUS.resolved, data: action.data, error: {} }
    }
    case 'rejected': {
      console.error(`Error: ${action.error}`)
      return { status: STATUS.rejected, data: null, error: { errorType: ERROR_ASYNC.rejected } } // for debug use: action.error
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}
const missingParametersDispatch = (dispatch, data) => dispatch({ type: STATUS.missingParameters, data })

function useAsync(asyncCallback, initialState) {
  const [state, dispatch] = React.useReducer(asyncReducer, {
    status: STATUS.idle,
    data: null,
    error: {},
    ...initialState,
  })
  useEffect(() => {
    const promise = asyncCallback()
    if (!promise) return
    dispatch({ type: STATUS.pending })
    promise.then(
      data => {
        const { errorCode } = data
        if (errorCode) dispatch({ type: STATUS.rejected })
        else if (data.errorType === 'error-missing-parameters-in-query') missingParametersDispatch(dispatch, data)
        else if (data.errorType === 'error-unknown') dispatch({ type: STATUS.rejected })
        else dispatch({ type: STATUS.resolved, data })
      },
      error => dispatch({ type: STATUS.rejected, error }) // error will be replaced by ERROR_ASYNC.rejected, for debug use: action.error
    )
  }, [asyncCallback])

  return state
}

// function renderAlertToTop(error = {}, languageIndex) {
//   const { errorType = '', errorExtraText = '' } = error
//   const alertContainer = document.getElementById('alert-placeholder')
//   if (alertContainer) {
//     ReactDOM.render(
//       <Alert alertType={errorType} languageIndex={languageIndex}>
//         {errorExtraText}
//       </Alert>,
//       alertContainer
//     )
//   }
// }
function dismountTopAlert() {
  const alertContainer = document.getElementById('alert-placeholder')
  if (alertContainer) ReactDOM.unmountComponentAtNode(alertContainer)
}

function _getThisHost(thisHostBaseUrl) {
  return thisHostBaseUrl.slice(-1) === '/' ? thisHostBaseUrl.slice(0, -1) : thisHostBaseUrl
}

function useAuthAsync(chosenOptions, loadType = 'onChange') {
  const [{ proxyPrefixPath, language, languageIndex }] = useWebContext()
  const { prn } = chosenOptions
  const dependenciesList = loadType === 'onChange' ? [prn] : []
  const asyncCallback = React.useCallback(() => {
    console.log('prn', prn)
    if (!prn && prn.length < 10) return

    const proxyUrl = _getThisHost(proxyPrefixPath.uri)
    console.log('proxyUrl', proxyUrl)

    // eslint-disable-next-line consistent-return
    return auth(language, proxyUrl, chosenOptions)
  }, [...dependenciesList])

  const initialStatus = { status: STATUS.idle }

  const state = useAsync(asyncCallback, initialStatus)

  const { status: responseStatus, error = {} } = state || {}
  const { errorType = '' } = error

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      if (errorType && errorType !== null) {
        console.log('Alert ', error, languageIndex)
        // renderAlertToTop(error, languageIndex)
      } else dismountTopAlert()
    }
    return () => (isMounted = false)
  }, [responseStatus])

  return state
}

function useQRAuthAsync(chosenOptions, loadType = 'onChange') {
  const [{ proxyPrefixPath, language, languageIndex }] = useWebContext()
  const { showQR } = chosenOptions
  const dependenciesList = loadType === 'onChange' ? [showQR] : []
  const asyncCallback = React.useCallback(() => {
    if (!showQR) return

    const proxyUrl = _getThisHost(proxyPrefixPath.uri)
    console.log('proxyUrl', proxyUrl)

    // eslint-disable-next-line consistent-return
    return auth(language, proxyUrl, chosenOptions)
  }, [...dependenciesList])

  const initialStatus = { status: STATUS.idle }

  const state = useAsync(asyncCallback, initialStatus)

  const { status: responseStatus, error = {} } = state || {}
  const { errorType = '' } = error

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      if (errorType && errorType !== null) {
        console.log('Alert ', error, languageIndex)
        // renderAlertToTop(error, languageIndex)
      } else dismountTopAlert()
    }
    return () => (isMounted = false)
  }, [responseStatus])

  return state
}

export { STATUS, ERROR_ASYNC, useAsync, useAuthAsync, useQRAuthAsync }
