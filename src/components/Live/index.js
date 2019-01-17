import React, { Component } from 'react'
import PropTypes from 'prop-types'
import reduceRight from 'ramda/es/reduceRight'
import pathOr from 'ramda/es/pathOr'

import Message from 'components/Message'
import IsTyping from 'components/Message/isTyping'

//import Dropzone from 'react-dropzone'

import './style.scss'

class Live extends Component {
  state = {
    showTyping: false,
    //dndFiles: this.props.dndFiles
  }

  componentDidMount () {
    if (this.messagesList) {
      this.messagesList.scrollTop = this.messagesList.scrollHeight
    }
    window.addEventListener('resize', this.handleScroll)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.messages.length !== this.props.messages.length) {
      this.setState({ showTyping: true }, () => {
        // FIXME Scroll to the bottom when typing. setTimeout is a bit dirty and can be improved
        setTimeout(() => {
          if (this.messagesList) {
            this.messagesList.scrollTop = this.messagesList.scrollHeight
          }
        }, 100)
      })
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.messages.length !== this.props.messages.length) {
      if (this.messagesList) {
        this.messagesList.scrollTop = this.messagesList.scrollHeight
      }
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleScroll)

    // Make sure to revoke the data uris to avoid memory leaks
    /*
    const{ dndFiles } = this.state
    for (let i = dndFiles.length; i >= 0; i--) {
      const file = dndFiles[i];
      URL.revokeObjectURL( file.preview );
    }
    */
  }

  handleScroll = () => {
    if (!this.messagesList) {
      return
    }

    const { onScrollBottom } = this.props
    const { clientHeight, scrollTop, scrollHeight } = this.messagesList

    const isScrollBottom = scrollHeight - clientHeight === scrollTop
    onScrollBottom(isScrollBottom)
  }

  onImageLoaded = () => {
    if (this.messagesList) {
      this.messagesList.scrollTop = this.messagesList.scrollHeight
    }
  }

  fmtMessages = () => {
    return reduceRight(
      (cur, acc) => {
        const nextMessage = acc[0]
        cur.displayIcon = !nextMessage || nextMessage.participant.isBot !== cur.participant.isBot
        acc.unshift(cur)
        return acc
      },
      [],
      this.props.messages,
    )
  }

  render () {
    const {
      messages,
      sendMessage,
      preferences,
      onRetrySendMessage,
      onCancelSendMessage,
      containerMessagesStyle,
      showInfo,
      onClickShowInfo,
      dropped,
      dndFiles,
      dndMessage,
      dropFileAccepted,
      dropFileRejected
    } = this.props
    const { showTyping } = this.state
    const lastMessage = messages.slice(-1)[0]

    const sendMessagePromiseCondition
      = lastMessage
      && (pathOr(false, ['data', 'hasDelay'], lastMessage)
        ? pathOr(false, ['data', 'hasNextMessage'], lastMessage)
        : lastMessage.participant.isBot === false)
    const pollMessageCondition = lastMessage && pathOr(false, ['attachment', 'delay'], lastMessage)
    const shouldDisplayTyping = !!(
      lastMessage
      && (sendMessagePromiseCondition || pollMessageCondition)
      && !lastMessage.retry
      && !lastMessage.isSending
      && showTyping
    )

    return (
      <div
        className='CaiAppLive'
        ref={ref => (this.messagesList = ref)}
        onScroll={this.handleScroll}
        style={containerMessagesStyle}
      >
        <div className='CaiAppLive--message-container'>
          {this.fmtMessages().map((message, index) => (
            <Message
              key={message.id}
              message={message}
              sendMessage={sendMessage}
              preferences={preferences}
              onImageLoaded={this.onImageLoaded}
              isLastMessage={messages.length === index + 1}
              retry={message.retry}
              isSending={message.isSending}
              onRetrySendMessage={() => onRetrySendMessage(message)}
              onCancelSendMessage={() => onCancelSendMessage(message)}
              showInfo={showInfo}
              onClickShowInfo={onClickShowInfo}
              error={message.error}
              dropFileAccepted={ dropFileAccepted }
              dropFileRejected={ dropFileRejected }
              dropped={ dropped }
              dndFiles={ dndFiles }
              dndMessage={ dndMessage }
            />
          ))}

          {shouldDisplayTyping && (
            <IsTyping
              image={preferences.botPicture}
              callAfterTimeout={() => this.setState({ showTyping: false })}
              timeout={20000}
            />
          )}
        </div>
      </div>
    )
  }
}

Live.propTypes = {
  messages: PropTypes.array,
  sendMessage: PropTypes.func,
  preferences: PropTypes.object,
  onRetrySendMessage: PropTypes.func,
  onCancelSendMessage: PropTypes.func,
  showInfo: PropTypes.bool,
  dropped: PropTypes.bool.isRequired,
  dndFiles: PropTypes.array.isRequired,
  dndMessage: PropTypes.string.isRequired,
  dropFileAccepted: PropTypes.func.isRequired,
  dropFileRejected: PropTypes.func.isRequired
}

export default Live
