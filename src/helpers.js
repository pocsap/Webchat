import Cookies from 'cookies-js'

const base64list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const INPUT_USER_ID = 'INPUT_USERID'

export const truncate = (string, length) => {
  if (string.length <= length) {
    return string
  }

  return `${string.slice(0, length - 3)}...`
}

export const getCredentialCookieName = (channelId) => {
  return `cai-conversation-${channelId}`
}

export const storeCredentialsToLocalStorage = (chatId, conversationId, timeToLive, channelId) => {
  const payload = { chatId, conversationId }
  const maxAge = 3600 * timeToLive

  if (typeof window.localStorage !== 'undefined') {
    // if maxAge is 0 then it never expires.
    // Currently timeToLive is 0.002777777 (~1 sec) if set to never.
    const expire = maxAge > 0 ? new Date().getTime() + (maxAge * 1000) : 0
    const localData = { expire, payload }
    localStorage.setItem(getCredentialCookieName(channelId), JSON.stringify(localData))
  }
}

export const getCredentialsFromLocalStorage = (channelId) => {
  if (typeof window.localStorage !== 'undefined') {
    const localStorageData = localStorage.getItem(getCredentialCookieName(channelId))

    if (localStorageData) {
      try {
        const time = new Date().getTime()
        const localData = JSON.parse(localStorageData)
        const secondsLeftBeforeExpires = localData.expire === 0 ? 9999 : parseInt((localData.expire - time) / 1000, 10)
        if (secondsLeftBeforeExpires > 0) {
          return localData.payload
        }
        // The data has expired if we got here, so remove it from the storage.
        localStorage.removeItem(getCredentialCookieName(channelId))
      } catch (err) {} // eslint-disable-line no-empty
    }
  }
  return null
}

export const setInputUserIdCookie = ( userId ) => { 
  Cookies.set( INPUT_USER_ID, userId )
  console.log(`>>> Cookies named ${INPUT_USER_ID} is set. <<<`)
}

export const getInputUserIdCookie = () => {
  return Cookies.get( INPUT_USER_ID )
}

export const setInputUserIdLocalStorage = ( userId, timeToLive, channelId ) => {
  const maxAge = ( timeToLive ) ? 3600 * timeToLive : 0

  if (typeof window.localStorage !== 'undefined') {
    //const expire = maxAge > 0 ? new Date().getTime() + (maxAge * 1000) : 0
    const localStorageCaiCredential = localStorage.getItem(getCredentialCookieName(channelId))
    let expire

    if ( localStorageCaiCredential ) {
      const caiCredentialJson = JSON.parse( localStorageCaiCredential )
      expire = ( caiCredentialJson.expire ) ? caiCredentialJson.expire : 0
    }
    else {
      expire = 0
    }

    const localData = { expire, userId }
    localStorage.setItem( INPUT_USER_ID, JSON.stringify( localData ) )
    console.log(`>>> localStorage data named ${INPUT_USER_ID} is set. <<<`)
  }
}

export const getInputUserIdLocalStorage = () => {
  if (typeof window.localStorage !== 'undefined') {
    const localStorageData = localStorage.getItem( INPUT_USER_ID )

    if ( localStorageData ) {

      try {
        const time = new Date().getTime()
        const localData = JSON.parse(localStorageData)
        const secondsLeftBeforeExpires = localData.expire === 0 ? 9999 : parseInt((localData.expire - time) / 1000, 10)
      
        if (secondsLeftBeforeExpires > 0) {
          return localData.userId
        }
        // The data has expired if we got here, so remove it from the storage.
        localStorage.removeItem( INPUT_USER_ID )
      } catch (err) {} // eslint-disable-line no-empty
    }
    
  }
}


export const base64 = {
  encode: function(s){
    var t = '', p = -6, a = 0, i = 0, v = 0, c;

    while ( (i < s.length) || (p > -6) ) {
      if ( p < 0 ) {
        if ( i < s.length ) {
          c = s.charCodeAt(i++);
          v += 8;
        } else {
          c = 0;
        }
        a = ((a&255)<<8)|(c&255);
        p += 8;
      }
      t += base64list.charAt( ( v > 0 )? (a>>p)&63 : 64 )
      p -= 6;
      v -= 6;
    }
    return t;
  },
  decode: function(s){
    var t = '', p = -8, a = 0, c, d;

    for( var i = 0; i < s.length; i++ ) {
      if ( ( c = base64list.indexOf(s.charAt(i)) ) < 0 )
        continue;
      a = (a<<6)|(c&63);
      if ( ( p += 6 ) >= 0 ) {
        d = (a>>p)&255;
        if ( c != 64 )
          t += String.fromCharCode(d);
        a &= 63;
        p -= 8;
      }
    }
    return t;
  }
}

export const convertFW2HW = function ( fwString ) {
  var hwString;
  hwString = fwString.replace( /[Ａ-Ｚａ-ｚ０-９]/g, function( s ){ return String.fromCharCode(s.charCodeAt(0) - 65248); });
  return hwString;
}
