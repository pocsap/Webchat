import config from 'config'
import qs from 'query-string'
import axios from 'axios'

export default store => next => action => {
  let targetUrl,
      fData = new FormData(),
      bodyData

  if ( !action.type.startsWith('API:') && !action.type.startsWith('OWN:') ) {
    return next(action)
  }

  const { dispatch } = store
  const prefix = action.type.split(':')[1]
  const { method = 'get', url, data, headers, query, convId } = action.payload

  // >>>>> START Temporary Logging >>>>>>>>>>>>>
  console.log(`API Middleware is called, the action is ${action.type}.`)
  
  if ( prefix === 'POST_MESSAGE' ) {
    console.log(`Sending data is "${data.message.attachment.content}".`)
    if (data.memoryOptions) console.log(`>>> Memory "ssoUserId" is "${data.memoryOptions.memory.ssoUserId}". <<<`)
  }

  // <<<<< END Temporary Logging <<<<<<<<<<<<<<<

  if ( action.type.startsWith('API') ){
    targetUrl = `${config.apiUrl}${url}${query ? '?' : ''}${qs.stringify(query || {})}`
    bodyData = data
  } 
  else {
    //i.e OWN
    targetUrl = `${config.fileUploadBaseUrl}${path}`
    console.log(`>>> Target server's URL is ${config.fileUploadBaseUrl}${path}`)

    data.map( file => {
      fData.append( 'uploadFiles', file )
    })

    fData.append( 'convId', convId ) 
    
    // To check the contents of fData: for(item of fData) console.log(item);
    bodyData = fData
  }

  const options = {
    method,
    data: bodyData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    url: targetUrl,
  }

  return axios(options)
    .then(res => {
      dispatch({ type: `${prefix}_SUCCESS`, payload: { ...res.data.results } })
      return res.data.results
    })
    .catch(err => {
      dispatch({ type: `${prefix}_ERROR`, payload: data })
      throw new Error(err)
    })
}
