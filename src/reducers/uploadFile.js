import { handleActions } from 'redux-actions'

const initialState = {
  dropped: false,
  dndFiles: [],
  dndMessage: ''
}

export default handleActions(
  {
    DROP_FILE_ACCEPTED: ( state, { payload } ) => {
      return {
        ...state, 
        dropped: true, 
        dndFiles: payload,
        dndMessage: '下記ファイルがドロップ（選択）されました。' 
      }
    },

    DROP_FILE_REJECTED: ( state, { payload } ) => {
      return { 
        ...state,
        dropped: false, 
        dndFiles: [], 
        dndMessage: 'gif/png/jpeg/jpg形式のファイルのみ選択してください' 
      }
    },
  },
  initialState,
)