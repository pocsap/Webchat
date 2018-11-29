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
  const { method = 'get', url, data, headers, query } = action.payload

  if ( action.type.startsWith('API') ){
    targetUrl = `${config.apiUrl}${url}${query ? '?' : ''}${qs.stringify(query || {})}`
    bodyData = data
  } 
  else {
    targetUrl = `${config.ownUrl}${url}`

    data.map( file => {
      fData.append( 'uploadFiles', file )
    })

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
