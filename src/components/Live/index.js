import React, { Component } from 'react'
import PropTypes from 'prop-types'
import reduceRight from 'lodash/reduceRight'

import Message from 'components/Message'
import IsTyping from 'components/Message/isTyping'

//import Dropzone from 'react-dropzone'

import './style.scss'

class Live extends Component {
  state = {
    showTyping: false,
    //dndFiles: this.props.dndFiles
  }

  componentDidMount() {
    if (this.messagesList) {
      this.messagesList.scrollTop = this.messagesList.scrollHeight
    }
    window.addEventListener('resize', this.handleScroll)
  }

  componentWillReceiveProps(nextProps) {
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

  componentDidUpdate(prevProps) {
    if (prevProps.messages.length !== this.props.messages.length) {
      if (this.messagesList) {
        this.messagesList.scrollTop = this.messagesList.scrollHeight
      }
    }
  }

  componentWillUnmount() {
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
      this.props.messages,
      (acc, cur) => {
        const nextMessage = acc[0]

        cur.displayIcon = !nextMessage || nextMessage.participant.isBot !== cur.participant.isBot

        acc.unshift(cur)
        return acc
      },
      [],
    )
  }

  //Moved to ../Message/DropArea
//  onDropAccepted( func, dndFiles ){
    //Manually add the property "preview", because this property was deleted at Ver 7.0.0 of react-dropzone.
    // Follwoing code is failed because the property "preview" is undefined.
    /*
    this.setState({
      dndFiles: dndFiles.map( file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))
    });
    */
    // So directly assign the value
//    dndFiles.map( file => file.preview = URL.createObjectURL( file ) )
    
//    func( dndFiles )
//  }

  render() {
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
    const shouldDisplayTyping =
      lastMessage &&
      lastMessage.participant.isBot === false &&
      !lastMessage.retry &&
      !lastMessage.isSending &&
      showTyping

    return (
      <div
        className="RecastAppLive"
        ref={ref => (this.messagesList = ref)}
        onScroll={this.handleScroll}
        style={containerMessagesStyle}
      >
        {/* Moved to ../Message/DropArea
        <div>
          <Dropzone
            onDropAccepted={this.onDropAccepted.bind( this, dropFileAccepted )}
            onDropRejected={ dropFileRejected }
            accept="image/gif, image/jpeg, image/png, image/jpg" >
            <div>
              Specify the file or Drag & Dropzone
              <p>Format: gif/png/jpeg/jpg</p>
            </div>
          </Dropzone>
          <h1>{ dropped ? 'Selected': 'Not selected' } </h1>
          <h1>{ dndMessage }</h1>
          { dndFiles.map( file => {
            return (
              <div key={ file.preview }>
                <h1>{ file.name }</h1>
                <img src={ file.preview } />
              </div>
            )
          })}
        </div>
        */}
        <div className="RecastAppLive--message-container">
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
