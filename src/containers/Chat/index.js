import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'
import _concat from 'lodash/concat'
import { propOr } from 'ramda'

import {
  postMessage,
  pollMessages,
  removeMessage,
  removeAllMessages,
  addBotMessage,
  addUserMessage,
  addMessageInfo,
  dropFileAccept,
  dropFileReject,
  dropFileReset,
  sendDroppedFiles
} from 'actions/messages'

import Header from 'components/Header'
import Live from 'components/Live'
import Input from 'components/Input'

import { I18n } from 'react-redux-i18n'

import './style.scss'

@connect(
  state => ({
    token: state.conversation.token,
    chatId: state.conversation.chatId,
    channelId: state.conversation.channelId,
    conversationId: state.conversation.conversationId,
    lastMessageId: state.conversation.lastMessageId,
    messages: state.messages,
    showInfo: true,
    dropped: state.uploadFile.dropped,
    dndFiles: state.uploadFile.dndFiles,
    dndMessage: state.uploadFile.dndMessage,
    isDroppedFileSent: state.uploadFile.isDroppedFileSent,
    dateTime: state.inputValue.dateTime
  }),
  {
    postMessage,
    pollMessages,
    removeMessage,
    removeAllMessages,
    addUserMessage,
    addBotMessage,
    addMessageInfo,
    dropFileAccept,
    dropFileReject,
    dropFileReset,
    sendDroppedFiles
  },
)
class Chat extends Component {
  state = {
    messages: this.props.messages,
    showSlogan: true,
    inputHeight: 50, // height of input (default: 50px),
  }

  componentDidMount() {
    const { sendMessagePromise, show } = this.props

    this._isPolling = false
    if (!sendMessagePromise && show) {
      this.doMessagesPolling()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { messages, show } = nextProps

    if (messages !== this.state.messages) {
      this.setState({ messages }, () => {
        const { getLastMessage } = this.props
        if (getLastMessage) {
          getLastMessage(messages[messages.length - 1])
        }
      })
    }

    if (show && show !== this.props.show && !this.props.sendMessagePromise && !this._isPolling) {
      this.doMessagesPolling()
    }
  }

  sendMessage = attachment => {
    const {
      token,
      channelId,
      chatId,
      postMessage,
      sendMessagePromise,
      addUserMessage,
      addBotMessage,
    } = this.props
    const payload = { message: { attachment }, chatId }

    const message = {
      ...payload.message,
      isSending: true,
      id: `local-${Math.random()}`,
      participant: {
        isBot: false,
      },
    }

    this.setState(
      prevState => ({ messages: _concat(prevState.messages, [message]) }),
      () => {
        if (sendMessagePromise) {
          addUserMessage(message)

          sendMessagePromise(message)
            .then(res => {
              if (!res) {
                throw new Error('Fail send message')
              }
              console.log( ">>> Response Data >>>\n", res.data )
              const data = res.data
              const messages =
                data.messages.length === 0
                  ? [{ type: 'text', content: 'No reply', error: true }]
                  : data.messages
              addBotMessage(messages, data)
            })
            .catch(() => {
              addBotMessage([{ type: 'text', content: 'No reply', error: true }])
            })
        } else {
          postMessage(channelId, token, payload).then(() => {
            if (this.timeout) {
              clearTimeout(this.timeout)
              this.timeoutResolve()
              this.timeout = null
            }
          })
        }
      },
    )
  }

  cancelSendMessage = message => {
    this.props.removeMessage(message.id)
  }

  retrySendMessage = message => {
    this.props.removeMessage(message.id)
    this.sendMessage(message.attachment)
  }

  doMessagesPolling = async () => {
    if (this._isPolling) {
      return
    }
    this._isPolling = true

    let shouldPoll = true
    let index = 0

    do {
      const { lastMessageId, conversationId, channelId, token } = this.props
      let shouldWaitXseconds = false
      let timeToSleep = 0
      try {
        const { waitTime } = await this.props.pollMessages(
          channelId,
          token,
          conversationId,
          lastMessageId,
        )
        shouldPoll = waitTime === 0
        shouldWaitXseconds = waitTime > 0
        timeToSleep = waitTime * 1000
      } catch (err) {
        shouldPoll = false
      }
      index++

      /**
       * Note: If the server returns a waitTime != 0, it means that conversation has no new messages since 2 minutes.
       * So, let's poll to check new messages every "waitTime" seconds (waitTime = 120 seconds per default)
       */
      if (shouldWaitXseconds) {
        index = 0
        await new Promise(resolve => {
          this.timeoutResolve = resolve
          this.timeout = setTimeout(resolve, timeToSleep)
        })
        this.timeout = null
      } else if (!shouldPoll && index < 4) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } while (shouldPoll || index < 4)
    this._isPolling = false
  }

  resetWebchat = () => {
    this.props.dropFileReset()
    this.props.removeAllMessages()
    this.sendMessage( { type: 'text', content: 'resetdata' } )
  }

  onClickShowInfo = message => {
    const { addMessageInfo } = this.props
    const { msgData } = this.props
    console.log( 'Message :', message )
    addMessageInfo(message)
  }

  dropFileAccepted = async dndFiles => {
    //
    const {
      dropFileAccept,
      addBotMessage,
      sendDroppedFiles,
      conversationId,
      dropFileReset
    } = this.props

    dropFileAccept( dndFiles )
    addBotMessage([{ type: 'text', content: I18n.t( 'botMessage.sendingDropFiles' ), error: false }])
    // I don't know why but it is possible to use "await", even though the promise is not returned apparently.
    // Is this because that axios statement (returns promise) is returned by middleware?
    // This should be clarified later.
    // By the way, if you eliminate "await" from the following statement, console.log command below is executed before getting the response from the axios. 
    await sendDroppedFiles( dndFiles, conversationId )
    console.log("=== After sendDroppedFiles (This should be after the reducer) ===")

    if ( this.props.isDroppedFileSent ){
      this.sendMessage({ type: 'text', content: I18n.t( 'botMessage.sendFilesSuccess' ) })
    }
    else {
      addBotMessage([{ type: 'text', content: I18n.t( 'botMessage.sendFilesFailed' ), error: true }])
    }

    // Not necessary? If it resets, the preview images are gone after this statement.
    //dropFileReset()

  }

  dropFileRejected = () => {
    //
    this.props.dropFileReject()
  }

  render() {
    const {
      closeWebchat,
      resetWebchat,
      preferences,
      showInfo,
      onClickShowInfo,
      containerMessagesStyle,
      containerStyle,
      secondaryView,
      primaryHeader,
      secondaryHeader,
      secondaryContent,
      logoStyle,
      show,
      enableHistoryInput,
      dropped,
      dndFiles,
      dndMessage,
      dateTime
    } = this.props
    const { showSlogan, messages, inputHeight } = this.state

    return (
      <div
        className={cx('RecastAppChat', { open: show, close: !show })}
        style={{ backgroundColor: preferences.backgroundColor, ...containerStyle }}
      >
        {secondaryView ? (
          secondaryHeader
        ) : primaryHeader ? (
          primaryHeader(closeWebchat)
        ) : (
          <Header
            closeWebchat={closeWebchat}
            resetWebchat={this.resetWebchat}
            preferences={preferences}
            key="header"
            logoStyle={logoStyle}
          />
        )}
        <div
          className="RecastAppChat--content"
          style={{
            height: `calc(100% - ${50 + inputHeight}px`,
          }}
          key="content"
        >
          {secondaryView
            ? secondaryContent
            : [
                <Live
                  key="live"
                  messages={messages}
                  preferences={preferences}
                  sendMessage={this.sendMessage}
                  onScrollBottom={bool => this.setState({ showSlogan: bool })}
                  onRetrySendMessage={this.retrySendMessage}
                  onCancelSendMessage={this.cancelSendMessage}
                  showInfo={showInfo}
                  onClickShowInfo={this.onClickShowInfo}
                  containerMessagesStyle={containerMessagesStyle}
                  dropFileAccepted={ this.dropFileAccepted }
                  dropFileRejected={ this.dropFileRejected }
                  dropped={ dropped }
                  dndFiles={ dndFiles }
                  dndMessage={ dndMessage }
                />,
                <div
                  key="slogan"
                  className={cx('RecastAppChat--slogan', {
                    'RecastAppChat--slogan--hidden': !showSlogan,
                  })}
                >
                  {'We run with Recast.AI'}
                </div>,
              ]}
        </div>
        <Input
          onSubmit={this.sendMessage}
          onInputHeight={height => this.setState({ inputHeight: height })}
          enableHistoryInput={enableHistoryInput}
          inputPlaceholder={propOr('Write a reply', 'userInputPlaceholder', preferences)}
          characterLimit={propOr(0, 'characterLimit', preferences)}
          dateTime={ dateTime }
        />
      </div>
    )
  }
}

Chat.propTypes = {
  postMessage: PropTypes.func,
  closeWebchat: PropTypes.func,
  resetWebchat: PropTypes.func,
  pollMessages: PropTypes.func,
  chatId: PropTypes.string,
  channelId: PropTypes.string,
  lastMessageId: PropTypes.string,
  conversationId: PropTypes.string,
  messages: PropTypes.array,
  preferences: PropTypes.object,
  showInfo: PropTypes.bool,
  sendMessagePromise: PropTypes.func,
  primaryHeader: PropTypes.func,
  secondaryView: PropTypes.bool,
  secondaryHeader: PropTypes.any,
  secondaryContent: PropTypes.any,
  getLastMessage: PropTypes.func,
  containerMessagesStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  show: PropTypes.bool,
  enableHistoryInput: PropTypes.bool,
  dropFileAccept: PropTypes.func,
  dropFileReject: PropTypes.func,
}

export default Chat
