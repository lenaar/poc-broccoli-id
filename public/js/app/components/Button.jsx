import React, { useState } from 'react'

import i18n from '../../../../i18n'

function Button({ caption = 'N/A', lang = 'sv', onClick = null }) {
  const [buttonClicked, setButtonClicked] = useState(false)
  const doClick = onClick || setButtonClicked
  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => doClick(true)}>
        {caption}
      </button>
      {buttonClicked ? <p>{i18n.message('template_button_works', lang)}</p> : null}
    </>
  )
}

export default Button
