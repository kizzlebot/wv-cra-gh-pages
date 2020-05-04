import React, { Component } from 'react'
import _ from 'lodash';
import Popover from 'react-bootstrap/Popover';
import Overlay from 'react-bootstrap/Overlay';
import Button from 'react-bootstrap/Button';


class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = { showPlaceHolder: false }
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();
  }


  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({
      ...this.props.config,
      path: '/lib',
      custom: JSON.stringify(this.props?.config?.custom)
    }, this.viewerRef.current);


    this.instance = instance;
    window.instance = instance;

    instance.docViewer.one('ready', async () => {
      this.setState(({ instance }));



      instance.annotManager.on('annotationAdded', (args) => {
        console.log('annotation added', args)
      });
      instance.annotManager.on('annotationDeleted', (args) => {
        console.log('annotation deleted', args)
      });
      instance.annotManager.on('annotationUpdated', (args) => {
        console.log('annotation updated', args)
      });


      this.props.onReady({
        ...instance,
        setSigner: instance.iframeWindow.setSigner,
      });
    });
  }

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (!_.isEmpty(this.props.selectedDoc)) {
        await this.instance.loadDocument(this.props.selectedDoc, { l: this.props.config.l, extension: 'pdf' });
      }
    }
  }

  render() {
    return (
      <>
        <div
          style={{ height: '100%' }}
          ref={this.viewerRef}
        />
      </>
    );
  }
}

export default Webviewer;
