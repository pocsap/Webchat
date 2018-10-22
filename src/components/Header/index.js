import React from 'react'
import PropTypes from 'prop-types'

import './style.scss'

const Header = ({ closeWebchat, resetWebchat, preferences, logoStyle }) => (
  <div
    className="RecastAppHeader"
    style={{
      color: preferences.complementaryColor,
      backgroundColor: preferences.accentColor,
    }}
  >
    <img className="RecastAppHeader--logo" src={preferences.headerLogo} style={logoStyle} />

    <div className="RecastAppHeader--title">{preferences.headerTitle}</div>

    <div className="RecastAppHeader--btn" onClick={ resetWebchat }>
      <img src="./img/myReset2.png" />
    </div>

    <div className="RecastAppHeader--btn" onClick={closeWebchat}>
      <img src="https://cdn.recast.ai/webchat/close.svg" />
    </div>
  </div>
)

Header.propTypes = {
  closeWebchat: PropTypes.func,
  resetWebchat: PropTypes.func,
  preferences: PropTypes.object,
  logoStyle: PropTypes.object,
}

export default Header
