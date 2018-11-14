import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import moment from 'moment'
import Datetime from 'react-datetime'

import { changeInputValue } from 'actions/messages' 

import './ReactDateTime.css'

@connect(
  null,
  {
    changeInputValue
  },
)

class DateTime extends Component {

  constructor(props) {
    super(props);

    this.state = {
      locale: 'ja',
      isInputShow: false,
      today: moment(),
      dateTime: moment(),
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm:ss'
    };

    this.onChange = this.onChange.bind(this)
  }

  componentWillMount() {
    this.props.changeInputValue( this.state.today.format( this.state.dateFormat + ' ' + this.state.timeFormat ) )
  }

  onChange( dt ){
    //this.setState({ dateTime: dt })
    //console.log('>>> dateTime is >>>', this.state.dateTime );
    this.props.changeInputValue( dt.format( this.state.dateFormat + ' ' + this.state.timeFormat ) )
  }

  render() {
    const { 
    	locale,
      isInputShow,
    	today,
      dateFormat,
      timeFormat
    } = this.state;

    return (
      <Datetime
      	locale={locale}
        input={isInputShow}
      	defaultValue={today}
      	dateFormat={dateFormat}
     	  timeFormat={timeFormat}
        onChange={this.onChange}
      />
  	)}
}

export default DateTime