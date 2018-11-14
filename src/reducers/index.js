import { combineReducers } from 'redux'

import messages from './messages'
import conversation from './conversation'
import uploadFile from './uploadFile'
import inputValue from './inputValue'

export default combineReducers({
  messages,
  conversation,
  uploadFile,
  inputValue
})
