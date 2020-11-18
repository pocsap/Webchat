const config = (() => {
  let script
  if (typeof document !== 'undefined') {
    script = document && (document.currentScript || document.getElementById('cai-webchat'))
  }
  const apiRoot = (script && script.getAttribute('apiRoot')) || 'https://api.cai.tools.sap'

  const fileUploadRoot = (script && script.getAttribute('fileUploadRoot')) || 'https://iitsm-mw.cfapps.eu10.hana.ondemand.com'

  return {
    apiUrl: `${apiRoot}${apiRoot.slice(-1) === '/' ? '' : '/'}connect/v1`,
    fileUploadBaseUrl: fileUploadRoot,
  }
})()


export default {
  apiUrl: config.apiUrl,
  // In order to test the uploaded file, it is necessary to change this url (ownUrl) to the local.
  //ownUrl: 'http://localhost:8080'
  fileUploadBaseUrl: config.fileUploadBaseUrl
}

