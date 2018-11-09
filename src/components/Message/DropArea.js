import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Dropzone from 'react-dropzone'

import './style.scss'


class DropArea extends Component {
  onDropAccepted( func, dndFiles ){
    //Manually add the property "preview", because this property was deleted at Ver 7.0.0 of react-dropzone.
    // Follwoing code is failed because the property "preview" is undefined.
    /*
    this.setState({
      dndFiles: dndFiles.map( file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))
    });
    */
    // So directly assign the value
    dndFiles.map( file => file.preview = URL.createObjectURL( file ) )
    func( dndFiles )
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
            accept="image/gif, image/jpeg, image/png, image/jpg" >
            <div>
              Specify the file or Drag & Dropzone
              <p>Format: gif/png/jpeg/jpg</p>
            </div>
          </Dropzone>
          <h1>{ dropped ? 'Selected': 'Not selected' } </h1>
          <h1>{ dndMessage }</h1>
          { dndFiles.map( file => {
            return (
              <div key={ file.preview }>
                <h1>{ file.name }</h1>
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
