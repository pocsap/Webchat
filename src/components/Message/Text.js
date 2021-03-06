import React from 'react'
import PropTypes from 'prop-types'
import sanitizeHtml from 'sanitize-html-react'
import ReactMarkdown from 'react-markdown'

import DateTime from 'components/Message/DateTime/ReactDateTime.js'
import DropArea from './DropArea'

import { truncate } from 'helpers'

import { I18n } from 'react-redux-i18n'

import './style.scss'


const allowedMarkdownTypes = [
  'paragraph',
  'text',
  'emphasis',
  'strong',
  'link',
  'blockquote',
  'delete',
  'list',
  'listItem',
  'heading',
  'code',
  'thematicBreak',
  'table',
  'tableHead',
  'tableBody',
  'tableRow',
  'tableCell',
]

const Text = ({ content, style, isMarkdown, dropFileAccepted, dropFileRejected, dropped, dndFiles, dndMessage }) => {

  let respond

  if (typeof isMarkdown !== 'boolean') {
    isMarkdown = false
  }

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

  let maxLengthLimit = 640
  // JIRA: https://sapjira.wdf.sap.corp/browse/SAPMLCONV-4904
  if (isMarkdown) {
    // Remove markdown tags and replace [Link Name Text](http:url...) with 'Link Name Text' only.
    const displayText = respond.replace(/__|\*|#|(?:\[([^\]]*)\]\([^)]*\))/gm, '$1')
    // Increase the max length limit to include any markdown (links) strings, to avoid losing the href strings.
    maxLengthLimit += Math.max(respond.length - displayText.length, 0)
  }

  const compiledResponse = sanitizeHtml(truncate(respond, maxLengthLimit), {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
  })
    .replace(/&amp;/g, 'g')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  // Markdown links need to open in new window.
  // BCP: https://support.wdf.sap.corp/sap/support/message/1980408289
  const LinkRenderer = (props) => {
    return <a href={props.href} target='_blank' rel='noopener noreferrer'>{props.children}</a>
  }

  return (
    <div style={style} className={'RecastAppText CaiAppText'}>
      {isMarkdown ? (
        <ReactMarkdown
          source={compiledResponse}
          renderers={{ link: LinkRenderer }}
          allowedTypes={allowedMarkdownTypes}
        />
        ) : (
          compiledResponse
        )}

      <div>
        { content === I18n.t('triggerPhrase.calendar') && <DateTime /> }
        { content === I18n.t('triggerPhrase.dropArea') && <DropArea 
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
  isMarkdown: PropTypes.bool,
}

export default Text
