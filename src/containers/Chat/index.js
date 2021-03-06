import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'
import propOr from 'ramda/es/propOr'
import concat from 'ramda/es/concat'

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
import { setInputUserIdCookie, setInputUserIdLocalStorage } from 'helpers'

import './style.scss'

const MAX_GET_MEMORY_TIME = 10 * 1000 // in ms
const FAILED_TO_GET_MEMORY = 'Could not get memory from webchatMethods.getMemory :'
const WRONG_MEMORY_FORMAT
  = 'Wrong memory format, expecting : { "memory": <json>, "merge": <boolean> }'

@connect(
  state => ({
    token: state.conversation.token,
    chatId: state.conversation.chatId,
    channelId: state.conversation.channelId,
    conversationId: state.conversation.conversationId,
    lastMessageId: state.conversation.lastMessageId,
    messages: state.messages,
    showInfo: false,
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

  static getDerivedStateFromProps (props, state) {
    const { messages, show } = props

    if (props.getLastMessage && messages && messages !== state.messages && messages.length > 0) {
      props.getLastMessage(messages[messages.length - 1])
    }

    if (messages !== state.messages || show !== state.show) {
      return { messages, show }
    }
    return null
  }

  componentDidMount () {
    const { sendMessagePromise, show } = this.props

    this._isPolling = false
    if (!sendMessagePromise && show) {
      this.doMessagesPolling()
    }

  }

  componentDidUpdate ( prevProps, prevState ) {
    const { messages, show } = this.state
    const { getLastMessage, voice } = this.props

    //>>>>>>>>>> Start of additional function of voice message. >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    if (typeof SpeechSynthesisUtterance == 'function' && voice ){
      let ssu = new SpeechSynthesisUtterance(),
          ssi = window.speechSynthesis,
          voices = ssi.getVoices(),
          msgObj =  messages[messages.length - 1]

      // Sometimes it never speak anything suddenly even though the code is executed without error.
      // To avoid this case, make it stop by the following cancel method for just in case. 
      //if ( !ssi.speaking || ssi.pending ) ssi.cancel()
      
      // ssu.voice = voices[7] // voices[7]:Google 日本人 ja-JP // If you set this value, the pronunciation became very bad for Japanese.
      switch( this.props.browserLocale ){
        case 'ja':
          ssu.lang = 'ja-JP';
          break;
        case 'en':
          ssu.lang = 'en-US'
      }
      
      if ( show && msgObj ){
        //if ( msgObj.isWelcomeMessage || messages !== prevState.messages ){
        if ( msgObj.isWelcomeMessage || msgObj !== prevState.messages[ prevState.messages.length - 1 ] ){
          ssu.text = msgObj.attachment.content.title || msgObj.attachment.content
          ssu.text = ssu.text.replace( /\*/g, "" )
          if ( ssi.speaking ) ssi.cancel()
          ssi.speak(ssu)
        }
      }
    }
    //<<<<<<<<<< End of additional function of voice message. <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    if (show && !this.props.sendMessagePromise && !this._isPolling) {
      this.doMessagesPolling()
    }
  }

  componentWillUnmount () {
    if (this.messagesDelays.length) {
      this.messagesDelays.forEach(messageDelay => clearTimeout(messageDelay))
    }
  }

  messagesDelays = []

  /*
    The window.webchatMethods.getMemory function can return
    a JSON object or a Promise resolving to a JSON object
    Accepted format for the returned object is :
    { memory: arbitrary JSON, merge: boolean }
  */
  getMemoryOptions = chatId => {
    const checkResponseFormat = memoryOptions => {
      if (typeof memoryOptions !== 'object') {
        console.error(WRONG_MEMORY_FORMAT)
        console.error('Got : ')
        console.error(memoryOptions)
        return undefined
      }
      if (!('merge' in memoryOptions) || typeof memoryOptions.merge !== 'boolean') {
        console.error(WRONG_MEMORY_FORMAT)
        console.error('Got : ')
        console.error(memoryOptions)
        return undefined
      }
      if (!('memory' in memoryOptions) || typeof memoryOptions.memory !== 'object') {
        console.error(WRONG_MEMORY_FORMAT)
        console.error('Got : ')
        console.error(memoryOptions)
        return undefined
      }
      return memoryOptions
    }

    return new Promise(resolve => {
      if (!window.webchatMethods || !window.webchatMethods.getMemory) {
        return resolve()
      }
      // so that we send the message in all cases
      setTimeout(resolve, MAX_GET_MEMORY_TIME)
      try {
        const memoryOptionsResponse = window.webchatMethods.getMemory(chatId)
        if (!memoryOptionsResponse) {
          return resolve()
        }
        if (memoryOptionsResponse.then && typeof memoryOptionsResponse.then === 'function') {
          // the function returned a Promise
          memoryOptionsResponse
            .then(memoryOptions => resolve(checkResponseFormat(memoryOptions)))
            .catch(err => {
              console.error(FAILED_TO_GET_MEMORY)
              console.error(err)
              resolve()
            })
        } else {
          resolve(checkResponseFormat(memoryOptionsResponse))
        }
      } catch (err) {
        console.error(FAILED_TO_GET_MEMORY)
        console.error(err)
        resolve()
      }
    })
  }

  shouldHideBotReply = responseData => {
    return (
      responseData.conversation
      && responseData.conversation.skill === 'qna'
      && Array.isArray(responseData.nlp)
      && !responseData.nlp.length
      && Array.isArray(responseData.messages)
      && !responseData.messages.length
    )
  }

  sendMessage = ( attachment, userMessage, caiMemOption ) => {
    const {
      token,
      channelId,
      chatId,
      postMessage,
      sendMessagePromise,
      addUserMessage,
      addBotMessage,
      defaultMessageDelay,
      setCaiMemory,
    } = this.props
    const payload = { message: { attachment }, chatId }

    const backendMessage = {
      ...payload.message,
      isSending: true,
      id: `local-${Math.random()}`,
      participant: {
        isBot: false,
      },
    }

    if (userMessage) {
      userMessage = {
        ...JSON.parse(JSON.stringify(backendMessage)),
        attachment: { type: 'text', content: userMessage },
      }
    }

    //>>> Start of user id manipulation. >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    const msgContent = attachment.content
    const rePattern = /^[0-9a-zA-Z]*$/
    let prevMsgContent

    if ( this.props.messages.length > 2 ){
      if ( this.props.messages[this.props.messages.length - 1].attachment.type === 'text' 
        && typeof this.props.messages[this.props.messages.length -1 ].attachment.content === 'string' ) 
      {
        prevMsgContent = this.props.messages[this.props.messages.length - 1].attachment.content
      }
    }
    
    if ( prevMsgContent ){
      if ( 
        prevMsgContent.indexOf( I18n.t( 'message.askUserID' ) ) !== -1
        && attachment.type === 'text' 
        && msgContent.length >= 5
        && msgContent.length <= 10
        && rePattern.test(msgContent) 
        )
      {
        //setInputUserIdCookie( msgContent )
        setInputUserIdLocalStorage( msgContent, channelId )
        setCaiMemory( { ssoUserId: msgContent }, true )
      }
    }
    //<<< End of user id manipulation. <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    this.setState(
      prevState => ({ messages: concat(prevState.messages, [backendMessage]) }),
      () => {
        if (sendMessagePromise) {
          addUserMessage(userMessage || backendMessage)

          sendMessagePromise(backendMessage)
            .then(res => {
              if (!res) {
                throw new Error('Fail send message')
              }
              console.log( ">>> Response Data >>>\n", res.data )
              const data = res.data
              const messages
                = data.messages.length === 0
                  ? [{ type: 'text', content: 'No reply', error: true }]
                  : data.messages
              if (!this.shouldHideBotReply(data)) {
                let delay = 0
                messages.forEach((message, index) => {
                  this.messagesDelays[index] = setTimeout(
                    () =>
                      addBotMessage([message], {
                        ...data,
                        hasDelay: true,
                        hasNextMessage: index !== messages.length - 1,
                      }),
                    delay,
                  )

                  delay
                    += message.delay || message.delay === 0
                      ? message.delay * 1000
                      : defaultMessageDelay === null || defaultMessageDelay === undefined
                        ? 0
                        : defaultMessageDelay * 1000
                })
              }
            })
            .catch(() => {
              addBotMessage([{ type: 'text', content: 'No reply', error: true }])
            })
        } else {
          // get potential memoryOptions from website developer
          this.getMemoryOptions(chatId)
            .then(memoryOptions => {
              if (memoryOptions) {
                payload.memoryOptions = memoryOptions
              }
              else if (caiMemOption){
                //If memoryOptions exists, caiMemOption is ignored.
                payload.memoryOptions = caiMemOption
              }

              return postMessage(channelId, token, payload)
            })
            .then(() => {
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
    const { conversationId } = this.props
    if (this._isPolling || !conversationId) {
      return
    }
    this._isPolling = true

    let shouldPoll = true
    let index = 0

    do {
      const { lastMessageId, channelId, token } = this.props
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
    const {
      dropFileReset,
      removeAllMessages,
      setCaiMemory,
      undefineWebchatMethod,
      ssoUserId,
    } = this.props
    const caiMemOption = { memory: { ssoUserId: ssoUserId }, merge: false }

    dropFileReset()
    removeAllMessages()
    //setCaiMemory( { webchatUser: 'suyamat'}, false )
    this.sendMessage( { type: 'text', content: I18n.t('message.reset') }, null, caiMemOption )
    //undefineWebchatMethod()
    //console.log( 'window.webchatMethods should be nothing here: ', window.webchatMethods )

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

  render () {
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
        className={cx('RecastAppChat CaiAppChat', { open: show, close: !show })}
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
            key='header'
            logoStyle={logoStyle}
          />
        )}
        <div
          className='RecastAppChat--content CaiAppChat--content'
          style={{
            height: `calc(100% - ${50 + inputHeight}px`,
          }}
          key='content'
        >
          {secondaryView
            ? secondaryContent
            : [
              <Live
                key='live'
                messages={messages}
                preferences={preferences}
                sendMessage={this.sendMessage}
                onScrollBottom={bool => this.setState({ showSlogan: bool })}
                onRetrySendMessage={this.retrySendMessage}
                onCancelSendMessage={this.cancelSendMessage}
                showInfo={showInfo}
                onClickShowInfo={onClickShowInfo}
                containerMessagesStyle={containerMessagesStyle}
                dropFileAccepted={ this.dropFileAccepted }
                dropFileRejected={ this.dropFileRejected }
                dropped={ dropped }
                dndFiles={ dndFiles }
                dndMessage={ dndMessage }
              />,
              <div
                key='slogan'
                className={cx('RecastAppChat--slogan CaiAppChat--slogan', {
                  'RecastAppChat--slogan--hidden CaiAppChat--slogan--hidden': !showSlogan,
                })}
              >
                {'We run with SAP Conversational AI'}
              </div>,
            ]}
        </div>
        <Input
          menu={preferences.menu && preferences.menu.menu}
          onSubmit={this.sendMessage}
          preferences={preferences}
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
  defaultMessageDelay: PropTypes.number,
  ssoUserId: PropTypes.string,
}

export default Chat
