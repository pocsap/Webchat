import React from 'react'
import PropTypes from 'prop-types'

import './style.scss'
import imgClear from '../../../img/myReset.png'

const Header = ({ closeWebchat, resetWebchat, preferences, logoStyle }) => (
  <div
    className='RecastAppHeader CaiAppHeader'
    style={{
      color: preferences.complementaryColor,
      backgroundColor: preferences.accentColor,
    }}
  >
    <img className='RecastAppHeader--logo CaiAppHeader--logo' src={preferences.headerLogo} style={logoStyle} />

    <div className='RecastAppHeader--title CaiAppHeader--title'>{preferences.headerTitle}</div>

    <div className="RecastAppHeader--btn CaiAppHeader--btn" onClick={ resetWebchat }>
      {/* <img className="myIcon" src="./img/myReset.png" /> */}
      <img className="myIcon" src={imgClear} />

    </div>

    <div className='RecastAppHeader--btn CaiAppHeader--btn' onClick={closeWebchat}>
      <img src='https://cdn.cai.tools.sap/webchat/close.svg' />
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
