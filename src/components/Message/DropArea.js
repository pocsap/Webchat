import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Dropzone from 'react-dropzone'

import './style.scss'

import { Translate, Localize } from 'react-redux-i18n'

class DropArea extends Component {
  state = {
    dndFiles: this.props.dndFiles
  }

  onDropAccepted( func, droppedFiles ){
    //Manually add the property "preview", because this property was deleted at Ver 7.0.0 of react-dropzone.
    // Follwoing code is failed. It seems that spread operator for the object is not working.
    
    /*
    this.setState({
      dndFiles: droppedFiles.map( file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))
    });
    
    // The following is just for testing
    let fileArray = droppedFiles.map( file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))

    console.log(">>> this.state.dndFiles >>>", this.state.dndFiles )
    */

    // So directly assign the value
    droppedFiles.map( file => file.preview = URL.createObjectURL( file ) )
    
    func( droppedFiles )
  }

  componentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    const {dndFiles} = this.props;
    for (let i = dndFiles.length - 1; i >= 0; i--) {
      URL.revokeObjectURL(dndFiles[i].preview);
    }
  }


  render(){
    const {
      dropped,
      dndFiles,
      dndMessage,
      dropFileAccepted,
      dropFileRejected
    } = this.props

  	return (
  		<div>
          <Dropzone
            onDropAccepted={this.onDropAccepted.bind( this, dropFileAccepted )}
            onDropRejected={ dropFileRejected }
            accept=".doc, .docx, .gif, .gz, .htm, .html, .jar, .jpg, .msg, .pdf, .png, .ppt, .pptx, .rtf, .tif, .txt, .xls, .xlsx, .xml, .zip" >
            <div className={'DropArea'}>
              <Translate value="dropArea.areaMessage"/>
              <p> </p>
              <p><Translate value="dropArea.acceptedExtentions"/></p>
            </div>
          </Dropzone>
          <p>{ dropped ? 'Selected': 'Not selected' } </p>
          <p>{ dndMessage }</p>
          { dndFiles.map( file => {
            return (
              <div key={ file.preview }>
                <p>{ file.name }</p>
                <img src={ file.preview } />
              </div>
            )
          })}
        </div>
    )
  }
}

DropArea.propTypes = {
    dropped: PropTypes.bool.isRequired,
    dndFiles: PropTypes.array.isRequired,
    dndMessage: PropTypes.string.isRequired,
    dropFileAccepted: PropTypes.func.isRequired,
    dropFileRejected: PropTypes.func.isRequired
}

export default DropArea
