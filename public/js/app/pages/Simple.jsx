import React from 'react'

import { useWebContext } from '../context/WebContext'

import i18n from '../../../../i18n'

const SimplePage = ({ headingId }) => {
  const [webContext] = useWebContext()
  const { lang } = webContext
  return (
    <>
      <h1>{i18n.message(headingId, lang)}</h1>
      <a href="/node/">{i18n.message('template_back_link', lang)}</a>
    </>
  )
}

export default SimplePage
