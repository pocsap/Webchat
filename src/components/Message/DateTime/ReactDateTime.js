import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import Datetime from 'react-datetime'

import './ReactDateTime.css'

class DateTime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      locale: 'ja',
      today: moment()
    };
  }

  render() {
    const { 
    	locale,
    	today 
    } = this.state;

    return (
      <Datetime
      	locale={locale}
      	defaultValue={today}
      	dateFormat="YYYY-MM-DD"
     	timeFormat="HH:mm:ss"
      />
  	)}
}

export default DateTime