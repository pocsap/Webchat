import { createAction } from 'redux-actions'

// 2nd argument will be handed over to the middleware as "action.payload"
export const postMessage = createAction('API:POST_MESSAGE', (channelId, token, data) => ({
  url: `/webhook/${channelId}`,
  method: 'post',
  headers: { Authorization: token, 'X-Token': token },
  data,
}))

export const getMessages = createAction('API:GET_MESSAGES', (channelId, token, conversationId) => ({
  url: `/webhook/${channelId}/conversations/${conversationId}/messages`,
  method: 'get',
  headers: { Authorization: token, 'X-Token': token },
}))

export const pollMessages = createAction(
  'API:POLL_MESSAGES',
  (channelId, token, conversationId, lastMessageId) => ({
    url: `/webhook/${channelId}/conversations/${conversationId}/poll`,
    method: 'get',
    headers: { Authorization: token, 'X-Token': token },
    query: { last_message_id: lastMessageId }, // eslint-disable-line camelcase
  }),
)

export const removeMessage = createAction('REMOVE_MESSAGE')

export const setFirstMessage = createAction('SET_FIRST_MESSAGE')

export const removeAllMessages = createAction('REMOVE_ALL_MESSAGES')

export const addBotMessage = createAction('ADD_BOT_MESSAGE', (messages, data) => ({
  messages,
  data,
}))

export const addUserMessage = createAction('ADD_USER_MESSAGE')

export const addMessageInfo = createAction('ADD_MESSAGE_INFO')

export const dropFileAccept = createAction( 'DROP_FILE_ACCEPTED' )
export const sendDroppedFiles = createAction( 'OWN:SEND_DROPPED_FILES', ( files, conversationId ) => ({
  url: '/upload_files',
  method: 'post',
  data: files,
  convId: conversationId,
}) )
export const dropFileReject = createAction( 'DROP_FILE_REJECTED' )
export const dropFileReset = createAction( 'DROP_FILE_RESET' )

export const changeInputValue =  createAction( 'CHANGE_INPUT_VALUE' )
