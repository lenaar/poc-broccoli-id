import axios from 'axios'

/**
 * @param {string} language
 * @param {string} proxyUrl
 * @param {Object} params
 * @throws
 * @returns {Object}
 */
// eslint-disable-next-line consistent-return
async function apiCall(url, language, proxyUrl, params) {
  try {
    const result = await axios.get(url, {
      params: { l: language },
    })
    if (result) {
      if (result.status >= 400) {
        return { errorType: 'error-unknown', message: 'ERROR-apiCall-' + result.status }
      }
      const { data } = result
      console.log('api data', url, data)
      return data
    }
  } catch (error) {
    if (error.response) {
      throw new Error('Unexpected error from apiCall-' + error.message)
    }
    throw error
  }
}

async function auth(language, proxyUrl, params) {
  try {
    const { method } = params
    console.log('trying to authenticate to backend by method', method)

    const url = `${proxyUrl}/backend/auth/${method}`
    return await apiCall(url, language, proxyUrl, params)
  } catch (error) {
    if (error.response) {
      throw new Error('Unexpected error from auth-' + error.message)
    }
    throw error
  }
}

async function sign(language, proxyUrl, params) {
  try {
    const { method } = params
    console.log('trying to sign to backend by method', method)

    const url = `${proxyUrl}/backend/sign/${method}`
    return await apiCall(url, language, proxyUrl, params)
  } catch (error) {
    if (error.response) {
      throw new Error('Unexpected error from sign-' + error.message)
    }
    throw error
  }
}

async function signByPersonalNumber(language, proxyUrl, params) {
  try {
    const { personalNumber } = params
    console.log('trying to sign to backend by personal number', personalNumber)

    const url = `${proxyUrl}/backend/signByPersonalNumber/${personalNumber}`
    return await apiCall(url, language, proxyUrl, params)
  } catch (error) {
    if (error.response) {
      throw new Error('Unexpected error from signByPersonalNumber-' + error.message)
    }
    throw error
  }
}

async function collect(language, proxyUrl, params) {
  try {
    const { orderRef } = params
    console.log('trying to connect to backend to collect order', orderRef)
    const url = `${proxyUrl}/backend/collect/${orderRef}`
    return await apiCall(url, language, proxyUrl, params)
  } catch (error) {
    if (error.response) {
      throw new Error('Unexpected error from collect-' + error.message)
    }
    throw error
  }
}

export { auth, collect, sign, signByPersonalNumber }
