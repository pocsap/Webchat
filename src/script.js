import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from 'store'

import { getChannelPreferences } from 'actions/channel'
import App from 'containers/App'

import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n'
import { I18n } from 'react-redux-i18n'
import translationObjects from './i18n/translationObjects'
import { base64, convertFW2HW } from 'helpers'
/*
import myEnv from 'myEnv.js'
console.log("myEnv is ", JSON.stringify(myEnv))
*/

const browserLocale = (window.navigator.languages && window.navigator.languages[0]) ||
                      window.navigator.language ||
                      window.navigator.userLanguage ||
                      window.navigator.browserLanguage

// These values should be taken from the cookie.
// These values are just for test.
const mySapSso2_1 = "AjQxMDMBABhJADAAMQA5ADYANgA3ACAAIAAgACAAIAACAAYwADAAMQADABBHAFQAUAAgACAAIAAgACAABAAYMgAwADEAOAAwADgAMgAxADAANQAzADMABQAEAAAACAYAAlgACQACRQD%2fAU8wggFLBgkqhkiG9w0BBwKgggE8MIIBOAIBATELMAkGBSsOAwIaBQAwCwYJKoZIhvcNAQcBMYIBFzCCARMCAQEwaTBkMQswCQYDVQQGEwJERTEcMBoGA1UEChMTU0FQIFRydXN0IENvbW11bml0eTETMBEGA1UECxMKU0FQIFdlYiBBUzEUMBIGA1UECxMLSTAwMjAxMzU2ODIxDDAKBgNVBAMTA0dUUAIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMTgwODIxMDUzMzQzWjAjBgkqhkiG9w0BCQQxFgQU6PGQdsr%2fZ8yzOA8tlZchqx1e9iMwCQYHKoZIzjgEAwQuMCwCFF41L8%2fpbQJCRoh3Jb5jmeUeXD4gAhRCPcUgQaiLlU4M%2fAUVOzWnV3C5Qw%3d%3d"
const mySapSso2_2 = "AjExMDAgAA5wb3J0YWw6STAxOTY2N4gAE2Jhc2ljYXV0aGVudGljYXRpb24BAAdJMDE5NjY3AgADMDAwAwADSU5QBAAMMjAxOTAyMjYwNjMzBQAEAAAACAoAB0kwMTk2Njf%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0lOUDENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMTkwMjI2MDYzMzI5WjAjBgkqhkiG9w0BCQQxFgQUAMoZKPNj8m3gNYZKMwYmQq5z2tMwCQYHKoZIzjgEAwQvMC0CFA!XVMDcgECP!iCyUxbK3Noj%2FPi9AhUAsM46NVYGEuKY!ZcweUMONyjBKgQ%3D"
const fukudaSso   = "AjExMDAgAA5wb3J0YWw6STAyMTI1OYgAE2Jhc2ljYXV0aGVudGljYXRpb24BAAdJMDIxMjU5AgADMDAwAwADSU5QBAAMMjAxOTAyMjcwNTM2BQAEAAAACAoAB0kwMjEyNTn%2FAQUwggEBBgkqhkiG9w0BBwKggfMwgfACAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGB0DCBzQIBATAiMB0xDDAKBgNVBAMTA0lOUDENMAsGA1UECxMESjJFRQIBADAJBgUrDgMCGgUAoF0wGAYJKoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUxDxcNMTkwMjI3MDUzNjUxWjAjBgkqhkiG9w0BCQQxFgQUlXYFgzRxZi3jidRVE1U4CrQza4swCQYHKoZIzjgEAwQvMC0CFQCwLqANKK25Ma9%2FVwi7s9YfQRxyawIUMo8m!AePWyHr1ui43qEgEcTXYLQ%3D"

const 
  decodeSso2_1 = base64.decode(mySapSso2_1),
  decodeSso2_2 = base64.decode(mySapSso2_2),
  decodeFukudaSso = base64.decode(fukudaSso);

const
  mySsoId_1 = decodeSso2_1.slice(8,22),
  mySsoId_2 = decodeSso2_2.slice(15,22),
  fukudaSsoId = decodeFukudaSso.slice(15,22);

console.log(`>>> SSO1 = ${mySsoId_1} <<<`)
console.log(`>>> SSO2 = ${mySsoId_2} <<<`)
console.log(`>>> Fukuda SSP = ${fukudaSsoId} <<<`)

console.log(">>> browserLocale >>>", browserLocale)

// For I18N
syncTranslationWithStore(store)
store.dispatch(loadTranslations(translationObjects));
store.dispatch(setLocale(browserLocale));

const idChatDiv = 'cai-webchat-div'

if (!document.getElementById(idChatDiv)) {
  const element = document.createElement('div')
  element.id = idChatDiv
  document.body.appendChild(element)
}

const root = document.getElementById(idChatDiv)

const script = document.currentScript || document.getElementById('cai-webchat')

const channelId = script.getAttribute('channelId')
const token = script.getAttribute('token')

if (root && channelId && token) {
  getChannelPreferences(channelId, token).then(preferences => {
    ReactDOM.render(
      <Provider store={store}>
        <App token={token} channelId={channelId} preferences={preferences} ssoUserId={fukudaSsoId} />
      </Provider>,
      root,
    )
  })
}
