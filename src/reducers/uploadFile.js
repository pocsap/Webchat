import { handleActions } from 'redux-actions'

const initialState = {
  dropped: false,
  dndFiles: [],
  dndMessage: '',
  isDroppedFileSent: false
}

export default handleActions(
  {
    DROP_FILE_ACCEPTED: ( state, { payload } ) => {
        return {
            ...state,
            dropped: true,
            dndFiles: payload,
            dndMessage: "File(s) are accepted."
        }

    },

    SEND_DROPPED_FILES_SUCCESS: (state, { payload }) => {
        console.log( "=== This is the reducer SEND_DROPPED_FILES_SUCCESS called after middleware ===" )
        return {
            ...state,
            dropped: true,
            dndMessage: "File(s) are sent to the server.",
            isDroppedFileSent: true
        }
    },

    SEND_DROPPED_FILES_ERROR: (state, { payload }) => {
        console.error( "=== This is the reducer SEND_DROPPED_FILES_ERROR called after middleware ===" )
        return {
            ...state,
            dropped: true,
            dndMessage: "Sending file(s) are failed."
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

    DROP_FILE_RESET: ( state, { payload } ) => {
        return { 
            ...state,
            dropped: false, 
            dndFiles: []
        }
    }
  },
  initialState,
)