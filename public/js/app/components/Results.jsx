import React from 'react'

import PropTypes from 'prop-types'

import i18n from '../../../../i18n'
import { STATUS, ERROR_ASYNC } from '../hooks/authUseAsync'

import { useWebContext } from '../context/WebContext'

const errorItalicParagraph = (error = {}, languageIndex) => {
  const { statisticsLabels: labels } = i18n.messages[languageIndex]
  const { errorType, errorExtraText } = error
  const errorText = errorType ? labels[errorType].text : errorType // NULL
  if (!errorText)
    throw new Error(
      `Missing translations for errorType: ${errorType}. Allowed types: ${Object.values(ERROR_ASYNC).join(', ')}`
    )

  return (
    <>
      <p>
        <i>{errorText}</i>
      </p>
      {errorExtraText && (
        <p>
          <i>{errorExtraText}</i>
        </p>
      )}
    </>
  )
}

function Results({ responseStatus, error = {}, children }) {
  const [{ languageIndex }] = useWebContext()
  const { errorType } = error
  if (responseStatus === STATUS.missingParameters) return null

  if (responseStatus === STATUS.resolved) {
    console.log('resolved')
    return <>{children}</>
  }

  if (responseStatus === STATUS.idle) return null
  if (responseStatus === STATUS.pending) {
    // const { searchLoading } = i18n.messages[languageIndex]
    // return <p>{searchLoading}</p>
    return <p>Loading</p>
  }

  if (errorType) return errorItalicParagraph(error, languageIndex)

  return null
}

Results.propTypes = {
  languageIndex: PropTypes.oneOf([0, 1]),
  // responseStatus: PropTypes.oneOf([...Object.values(STATUS), null]),
  // error: PropTypes.shape({
  //   errorType: PropTypes.oneOf([...Object.values(ERROR_ASYNC), '']),
  //   errorExtraText: PropTypes.string,
  // }),
}

Results.defaultProps = {
  languageIndex: 0,
  error: {},
  responseStatus: null,
}

export default Results
