import React, { Component } from 'react'
import _ from 'lodash';
import Promise from 'bluebird';
import SelectSigner from './components/SelectSigner';



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
      // pdftronServer: 'https://webviewer-server.staging.enotarylog.com',
      custom: JSON.stringify(this.props?.config?.custom)
    }, this.viewerRef.current);


    this.instance = instance;
    window.instance = instance;



    instance.annotationPopup.add({
      type: 'customElement',
      title: 'Select Signer',
      render: () => (
        <SelectSigner
          annotManager={instance.annotManager}
          signers={instance.iframeWindow.getSigners()}
        />
      ),
    });


    // get fired after config.js updates
    instance.docViewer.one('ready', async () => {
      this.setState(({ instance }));


      instance.annotManager.on('widgetAdded', (args) => {
        console.log('widget added', args)
      });

      instance.annotManager.on('annotationAdded', (args) => {
        console.log('annotation added', args)
      });

      instance.annotManager.on('annotationDeleted', (args) => {
        console.log('annotation deleted', args)
      });

      instance.annotManager.on('annotationUpdated', (args) => {
        console.log('annotation updated', args)
      });





      if (!_.isEmpty(this.props.selectedDoc)) {
        await this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' });
      }


      console.log('this.props.signers', this.props.signers)
      instance.annotManager.trigger('setSigners', this.props.signers)
      instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

      instance.docViewer.on('annotationsLoaded', async () => {
        console.log('%cannotationsLoaded', 'font-size:20px; color:ref;')
        return this.loadAnnotations()
      });


      if (_.isFunction(this.props.onReady)) {
        this.props.onReady({
          ...instance,
          setSigner: instance.iframeWindow.setSigner,
        });

      }
    });
  }

  componentDidUpdate = async (prevProps, prevState) => {

    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      await this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }

    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (!_.isEmpty(this.props.selectedDoc)) {
        return this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' });
      }
    }


    if (prevProps.annotations !== this.props.annotations) {
      await this.loadAnnotations();
    }
  }


  loadAnnotations = async () => {
    const annotations = _.chain(this.props.annotations)
      .toPairs()
      .filter(([key, val]) => val.docId === this.props.selectedDoc)
      .value();


    await Promise.map(annotations, ([key, value]) => {
      return this.instance.annotManager.trigger('addAnnotation', {
        ...value,
        xfdf: unescape(value.xfdf)
      })
    });

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
