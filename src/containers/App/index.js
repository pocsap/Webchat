import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Chat from 'containers/Chat'
import Expander from 'components/Expander'
import { setFirstMessage, removeAllMessages } from 'actions/messages'
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
  },
)
class App extends Component {
  state = {
    expanded: this.props.expanded || false
  }

  componentDidMount () {
    const { channelId, token, preferences, noCredentials, onRef } = this.props
    const credentials = getCredentialsFromCookie()
    const payload = { channelId, token }
    const firstMessage = (preferences.welcomeMessage) || I18n.t('application.welcome', {headerTitle: preferences.headerTitle })

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
        storeCredentialsInCookie(chatId, id, preferences.conversationTimeToLive)
      })
    }

    /*
    if (preferences.welcomeMessage) {
      this.props.setFirstMessage(preferences.welcomeMessage)
    }
    */
    this.props.setFirstMessage(firstMessage)

    this.props.setCredentials(payload)
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
    } = this.props
    const { expanded } = this.state

    return (
      <div className='CaiApp'>
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
}

export default App
