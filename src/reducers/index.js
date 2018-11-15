import { combineReducers } from 'redux'

import messages from './messages'
import conversation from './conversation'
import uploadFile from './uploadFile'
import inputValue from './inputValue'
import { i18nReducer } from 'react-redux-i18n'

export default combineReducers({
  messages,
  conversation,
  uploadFile,
  inputValue,
  i18n: i18nReducer
})
