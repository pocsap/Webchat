import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from 'store'

import { getChannelPreferences } from 'actions/channel'
import App from 'containers/App'

import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n'
import { I18n } from 'react-redux-i18n'
import translationObjects from './i18n/translationObjects'


const browserLocale = (window.navigator.languages && window.navigator.languages[0]) ||
                      window.navigator.language ||
                      window.navigator.userLanguage ||
                      window.navigator.browserLanguage

console.log(">>> browserLocale >>>", browserLocale)

// For I18N
syncTranslationWithStore(store)
store.dispatch(loadTranslations(translationObjects));
store.dispatch(setLocale(browserLocale));

const idChatDiv = 'recast-webchat-div'

if (!document.getElementById(idChatDiv)) {
  const element = document.createElement('div')
  element.id = idChatDiv
  document.body.appendChild(element)
}

const root = document.getElementById(idChatDiv)

const script = document.currentScript || document.getElementById('recast-webchat')

const channelId = script.getAttribute('channelId')
const token = script.getAttribute('token')

if (root && channelId && token) {
  getChannelPreferences(channelId, token).then(preferences => {
    ReactDOM.render(
      <Provider store={store}>
        <App token={token} channelId={channelId} preferences={preferences} />
      </Provider>,
      root,
    )
  })
}
