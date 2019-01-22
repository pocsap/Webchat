import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Slider from 'react-slick'
import sum from 'ramda/es/sum'
import map from 'ramda/es/map'
import values from 'ramda/es/values'

import { truncate } from 'helpers'

import Text from './Text'
import { PrevArrow, NextArrow } from 'components/arrows'

class QuickReplies extends Component {
  state = {
    displayQuickReplies: this.props.isLastMessage,
    showArrow: true,
  }

  componentDidMount () {
    const widthQuickReplies = sum(
      values(
        map(button => {
          const dimensions = button.getBoundingClientRect()
          return dimensions.width
        }, this.buttons),
      ),
    )

    if (widthQuickReplies <= 270) {
      this.setState({ showArrow: false }) // eslint-disable-line react/no-did-mount-set-state
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ displayQuickReplies: nextProps.isLastMessage })
  }

  buttons = {}

  doSendMessage = message => {
    this.props.sendMessage(message)
    this.setState({ displayQuickReplies: false })
  }

  render () {
    const { content, style } = this.props
    const { displayQuickReplies, showArrow } = this.state
    const { title, buttons } = content
    const customStyle = {
      border: `1px solid ${style.accentColor}`,
      color: style.accentColor
    }

    document.documentElement.style.setProperty('--qrColor', style.accentColor)

    return (
      <div
        className='CaiAppQuickReplies'
        ref={ref => {
          this.container = ref
        }}
      >
        <Text content={title} style={style} />

        {displayQuickReplies
          && buttons
          && !!buttons.length && (
          <Slider
            arrows={showArrow}
            variableWidth
            speed={200}
            infinite={false}
            draggable={false}
            prevArrow={<PrevArrow />}
            nextArrow={<NextArrow />}
            className='CaiAppSlider CaiAppQuickReplies--slider'
          >
            {buttons.map((b, i) => (
              <div
                ref={ref => {
                  this.buttons[i] = ref
                }}
                key={i}
                className='CaiAppQuickReplies--button'
                onClick={() => this.doSendMessage({ type: 'quickReply', content: b })}
                /*  I don't know why but the following style does not work! 
                    And If you eliminate the following style statement, arrow button of quick reply is gone.
                    !!! This strange behavior might be happened due to lack of curly bracket surrounds this comment.
                    !!! Check this later. 
                    !!! If this is right, following standard code should be fine, and delete the variant customStyle, style.setProperty statement, and style setting in the style sheet (color/border of the class .CaiAppQuickReplies)
                  style={{
                    border: `1px solid ${style.accentColor}`,
                    color: style.accentColor,
                  }} */
                  style={customStyle}
              >
                {truncate(b.title, 20)}
              </div>
            ))}
          </Slider>
        )}
      </div>
    )
  }
}

QuickReplies.propTypes = {
  style: PropTypes.object,
  content: PropTypes.object,
  sendMessage: PropTypes.func,
}

export default QuickReplies
