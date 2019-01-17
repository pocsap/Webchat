import React from 'react'
import PropTypes from 'prop-types'
import sanitizeHtml from 'sanitize-html-react'

import DateTime from 'components/Message/DateTime/ReactDateTime.js'
import DropArea from './DropArea'

import { truncate } from 'helpers'

import './style.scss'


const Text = ({ content, style, dropFileAccepted, dropFileRejected, dropped, dndFiles, dndMessage }) => {
  let respond

  if (typeof content === 'string') {
    respond = content
  } else if (typeof content === 'object') {
    respond = JSON.stringify(content)
  } else if (typeof content === 'number') {
    respond = content.toString()
  } else if (content === undefined) {
    respond = 'undefined'
  } else {
    respond = ''
  }

  return (
    <div style={style} className={'CaiAppText'}>
      {sanitizeHtml(truncate(respond, 640))
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
