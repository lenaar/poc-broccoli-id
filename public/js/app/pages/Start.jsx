import React from 'react'

import { useWebContext } from '../context/WebContext'

import i18n from '../../../../i18n'

import Button from '../components/Button'

const Start = () => {
  const [webContext, setContext] = useWebContext()
  const { message, lang, count = 0 } = webContext

  const incrementCount = () => {
    const newVal = { count: count + 1 }
    setContext({ ...webContext, ...newVal })
  }

  return (
    <main id="mainContent">
      <h1>Node-web</h1>
      <h2>{i18n.message('template_app_works', lang)}</h2>
      <hr className="my-2" />
      <p>{`${i18n.message('template_store_text', lang)}: ${message}`}</p>

      <Button caption={i18n.message('template_try_me', lang)} lang={lang} />
      <hr />
      <Button
        caption={`${i18n.message('template_button_increment', lang)} ${count}`}
        lang={lang}
        onClick={incrementCount}
      />
      <hr />
      <div>
        <a href="/node/secure">{i18n.message('template_secured_page_heading', lang)}</a>
        <br />
        <a href="/node/_admin">{i18n.message('template_secured_admin_page_heading', lang)}</a>
        <br />
        <a href="/node/silent">{i18n.message('template_silent_login_page_heading', lang)}</a>
      </div>
    </main>
  )
}

export default Start
