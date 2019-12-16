import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Chat from 'containers/Chat'
import Expander from 'components/Expander'
import { setFirstMessage, removeAllMessages, postMessage } from 'actions/messages'
import { setCredentials, createConversation } from 'actions/conversation'
import { storeCredentialsInCookie, getCredentialsFromCookie } from 'helpers'

import { I18n } from 'react-redux-i18n'

import './style.scss'

const NO_LOCALSTORAGE_MESSAGE
  = 'Sorry, your browser does not support web storage. Are you in localhost ?'

/*
<Referrence URL> https://qiita.com/TsutomuNakamura/items/ceaa2552bbbca1bac24e
このconnect decolator はReact とRedux Store を接続する役割を持っており、引数にstate をprops と対応付ける関数と、dispatch をprops に対応付ける関数を指定することができます。
これらはstore から提供される関数を指定します。

そして@connect decolator で実行される1 つ目の関数はprops としてstore の値を取得する関数です。
返り値としてstate のkey を指定することによって、connect されたクラスのthis.props からstate の値を取得することができます。
*/
@connect(
  state => ({
    isReady: state.conversation.conversationId,
  }),
  {
    setCredentials,
    setFirstMessage,
    createConversation,
    removeAllMessages,
    postMessage,
  },
)
class App extends Component {
  state = {
    expanded: this.props.expanded || false
  }

  componentDidMount () {
    const { channelId, token, preferences, noCredentials, onRef, ssoUserId } = this.props
    const credentials = getCredentialsFromCookie(channelId)
    const payload = { channelId, token }
    const firstMessageContetns = ssoUserId ? I18n.t('application.welcomeWithName', { userId: ssoUserId, headerTitle: preferences.headerTitle })
                                           : I18n.t('application.welcome', { headerTitle: preferences.headerTitle })
    const firstMessage = (preferences.welcomeMessage) || firstMessageContetns

    const msgAttachment = { attachment: { type: "text", content: I18n.t( 'message.forLang&Intent' ) } } 
  

    if (onRef) {
      onRef(this)
    }

    if (noCredentials) {
      return false
    }

    if (credentials) {
      Object.assign(payload, credentials)
    } else {
      this.props.createConversation(channelId, token).then(({ id, chatId }) => {
        storeCredentialsInCookie(chatId, id, preferences.conversationTimeToLive, channelId)

        const customPayload = { chatId: chatId, message: msgAttachment }
        this.props.postMessage( channelId, token, customPayload )
      })
    }

    this.props.setFirstMessage(firstMessage)

    this.props.setCredentials(payload)

    // CAI memory setting function is assigned here.
    if ( ssoUserId ){
      this.setCaiMemory( { ssoUserId: ssoUserId }, true )
    }

  }

  componentWillReceiveProps (nextProps) {
    const { isReady, preferences, expanded } = nextProps

    if (isReady !== this.props.isReady) {
      let expanded = null

      switch (preferences.openingType) {
        case 'always':
          expanded = true
          break
        case 'never':
          expanded = false
          break
        case 'memory':
          if (typeof window.localStorage !== 'undefined') {
            expanded = localStorage.getItem('isChatOpen') === 'true'
          } else {
            console.log(NO_LOCALSTORAGE_MESSAGE)
          }
          break
        default:
          break
      }
      this.setState({ expanded })
    }

    if (expanded !== undefined && expanded !== this.state.expanded) {
      this.setState({ expanded })
    }
  }

  componentDidUpdate (prevState) {
    const { onToggle } = this.props

    if (prevState.expanded !== this.state.expanded) {
      if (typeof window.localStorage !== 'undefined') {
        localStorage.setItem('isChatOpen', this.state.expanded)
        if (onToggle) {
          onToggle(this.state.expanded)
        }
      } else {
        console.log(NO_LOCALSTORAGE_MESSAGE)
      }
    }
  }

  componentDidCatch (error, info) {
    console.log(error, info)
  }

  toggleChat = () => {
    const { clearMessagesOnclose } = this.props
    this.setState({ expanded: !this.state.expanded }, () => {
      if (!this.state.expanded && clearMessagesOnclose) {
        this.clearMessages()
      }
    })
  }

  clearMessages = () => {
    this.props.removeAllMessages()
  }

/*
  resetMessages = () => {
    this.props.removeAllMessages()
    if (this.props.preferences.welcomeMessage) {
      this.props.setFirstMessage(this.props.preferences.welcomeMessage)
    }
    else{
      this.props.setFirstMessage('Try again')
    }
  }
*/

  // !!! The following function can set the CAI Memory, 
  // but once the memory management code is assigned to "window.webchatMethods", it is called every times whenever the chat is sent.
  // Therefore assigning the code to "window.webchatMethods" is not really convenient.
  // However the primitive parameter like user ID would be possible to be set by this, 
  // and once this is set, it is not initialized even if the memory is reset later.
  // This is because "window.webchatMethods" is always called, so it is also called after the reset message.
  // "window.webchatMethods" is deleted when the reset button is pushed.
  setCaiMemory = ( memObj, doesMerge ) => {
    console.log( `>>> "setCaiMessage is called, handed over parameters doesMerge is ${doesMerge} and memObj is `, memObj )
    window.webchatMethods = {
      getMemory: ( conversationId ) => {
        const memory = memObj
        return { memory, merge: doesMerge }
      }
    }
  }

  // This is called by resetWebchat function of Chat, when the reset button is pushed.
  undefineWebchatMethod = () => {
    console.log( `>>> "undefineWebchatMethod is called. window.webchatMethods is set as undefined.` )
    window.webchatMethods = undefined
    //delete window.webchatMethods
  }

  render () {
    const {
      preferences,
      containerMessagesStyle,
      containerStyle,
      expanderStyle,
      logoStyle,
      showInfo,
      sendMessagePromise,
      onClickShowInfo,
      primaryHeader,
      secondaryView,
      secondaryHeader,
      secondaryContent,
      getLastMessage,
      enableHistoryInput,
      defaultMessageDelay,
      ssoUserId,
      browserLocale,
    } = this.props
    const { expanded } = this.state

    return (
      <div className='RecastApp CaiApp'>
        <link
          rel='stylesheet'
          type='text/css'
          href='https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css'
        />
        <link
          rel='stylesheet'
          type='text/css'
          href='https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css'
        />

        <Expander
          show={!expanded}
          onClick={this.toggleChat}
          preferences={preferences}
          style={expanderStyle}
        />

        <Chat
          show={expanded}
          closeWebchat={this.toggleChat}
          resetWebchat={this.resetMessages}
          preferences={preferences}
          containerMessagesStyle={containerMessagesStyle}
          containerStyle={containerStyle}
          logoStyle={logoStyle}
          showInfo={showInfo}
          onClickShowInfo={onClickShowInfo}
          sendMessagePromise={sendMessagePromise}
          primaryHeader={primaryHeader}
          secondaryView={secondaryView}
          secondaryHeader={secondaryHeader}
          secondaryContent={secondaryContent}
          getLastMessage={getLastMessage}
          enableHistoryInput={enableHistoryInput}
          defaultMessageDelay={defaultMessageDelay}
          setCaiMemory={this.setCaiMemory}
          undefineWebchatMethod={this.undefineWebchatMethod}
          ssoUserId={ssoUserId}
          browserLocale={browserLocale}
        />
      </div>
    )
  }
}

App.propTypes = {
  token: PropTypes.string,
  channelId: PropTypes.string,
  preferences: PropTypes.object.isRequired,
  containerMessagesStyle: PropTypes.object,
  expanderStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  showInfo: PropTypes.bool,
  sendMessagePromise: PropTypes.func,
  noCredentials: PropTypes.bool,
  primaryHeader: PropTypes.func,
  secondaryView: PropTypes.bool,
  secondaryHeader: PropTypes.any,
  secondaryContent: PropTypes.any,
  getLastMessage: PropTypes.func,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  removeAllMessages: PropTypes.func,
  onRef: PropTypes.func,
  clearMessagesOnclose: PropTypes.bool,
  enableHistoryInput: PropTypes.bool,
  defaultMessageDelay: PropTypes.number,
  setCaiMemory: PropTypes.func,
  undefineWebchatMethod: PropTypes.func,
  ssoUserId: PropTypes.string,
  browserLocale: PropTypes.string,
}

export default App
