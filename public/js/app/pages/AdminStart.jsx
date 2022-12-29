import React from 'react'

import { useWebContext } from '../context/WebContext'
import { useAdminContext } from '../context/AdminContext'

import i18n from '../../../../i18n'

const AdminStart = () => {
  const [webContext] = useWebContext()
  const { message, lang } = webContext

  const [adminContext] = useAdminContext()
  const { adminData = {} } = adminContext

  return (
    <main id="mainContent">
      <h1>Node-web Admin page</h1>
      <h2>{i18n.message('template_app_works', lang)}</h2>
      <hr className="my-2" />
      <p>{`${i18n.message('template_store_text', lang)}: ${message}`}</p>

      <p>X: {adminData.x}</p>
      <p>Y: {adminData.y}</p>
      <hr />
      <div>
        <a href="/node/secure">{i18n.message('template_secured_page_heading', lang)}</a>
        <br />
        <a href="/node/silent">{i18n.message('template_silent_login_page_heading', lang)}</a>
        <br />
        <a href="/node/">{i18n.message('template_back_link', lang)}</a>
      </div>
    </main>
  )
}

export default AdminStart
