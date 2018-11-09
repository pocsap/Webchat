import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import {InputMoment, BigInputMoment, DatePicker, DatePickerRange, TimePicker} from 'react-input-moment'

import './InputMoment.css'

class DateTime extends Component {
  constructor(props) {
    super(props);

    this.state = {
      inputMoment: moment(),
      bigInputMoment: moment(),
      datePickerMoment: moment(),
      datePickerRangeStartMoment: moment().subtract(3, 'days'),
      datePickerRangeEndMoment: moment(),
      timePickerMoment: moment(),
      showSeconds: true,
      locale: 'ja',
      size: 'small'
    };
  }

  handleShowSeconds(e) {
    this.setState({showSeconds: e.target.checked});
  }

  handleLocale(e) {
    this.setState({locale: e.target.value});
  }

  render() {
    const {
    	inputMoment, 
    	bigInputMoment, 
    	datePickerMoment, 
    	datePickerRangeStartMoment, 
    	datePickerRangeEndMoment, 
    	timePickerMoment, 
    	showSeconds, 
    	locale, 
    	size} = this.state;
    const wrapperClass = 'wrapper ' + size;

    return (
      <div className="app">
        <div className="header">InputMoment</div>
        <input
          className="output"
          type="text"
          value={inputMoment.format('llll')}
          readOnly
        />
        <div className={wrapperClass}>
          <InputMoment
            moment={inputMoment}
            locale={locale}
            showSeconds={showSeconds}
            onChange={mom => this.setState({inputMoment: mom})}
          />
        </div>
      </div>
    );
  }
}

export default DateTime
