import React from 'react'
import PropTypes from 'prop-types'
import sanitizeHtml from 'sanitize-html-react'

import DateTime from 'components/Message/DateTime/ReactDateTime.js'
import DropArea from './DropArea'

import { truncate } from 'helpers'

import './style.scss'

const Text = ({ content, style, dropFileAccepted, dropFileRejected, dropped, dndFiles, dndMessage }) => {

  return (
    <div style={style} className={'RecastAppText'}>
      {sanitizeHtml(truncate(content, 640))
        .replace(/&amp;/g, 'g')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')}
      <div>
        { content === '発生日時を入力してください' && <DateTime /> }
        { content === 'ファイルを添付してください' && <DropArea 
                                                dropFileAccepted={ dropFileAccepted }
                                                dropFileRejected={ dropFileRejected }
                                                dropped={ dropped }
                                                dndFiles={ dndFiles }
                                                dndMessage={ dndMessage }/> }
      </div>
    </div>
  )
}

Text.propTypes = {
  style: PropTypes.object,
  content: PropTypes.string,
}

export default Text
