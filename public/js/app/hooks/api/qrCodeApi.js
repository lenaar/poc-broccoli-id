import axios from 'axios'

/**
 * @param {string} language
 * @param {string} proxyUrl
 * @param {Object} params
 * @throws
 * @returns {Object}
 */
// eslint-disable-next-line consistent-return
async function fetchQrCode(language, proxyUrl, params) {
  try {
    const url = `${proxyUrl}/backend/qrcode`

    const result = await axios.get(url, {
      params: { l: language },
    })
    if (result) {
      if (result.status >= 400) {
        return { errorType: 'error-unknown', message: 'ERROR-fetchQrCode-' + result.status }
      }
      const { data } = result
      console.log('api data', data)
      return data
    }
  } catch (error) {
    if (error.response) {
      throw new Error('Unexpected error from fetchQrCode-' + error.message)
    }
    throw error
  }
}

export default fetchQrCode
