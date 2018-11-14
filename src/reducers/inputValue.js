import { handleActions } from 'redux-actions'

const initialState = {
  dateTime: ''
}

export default handleActions(
  {
    CHANGE_INPUT_VALUE: (state, { payload }) => {
      return {
        ...state, 
        dateTime: payload
      }
    },
  },

  initialState,
)