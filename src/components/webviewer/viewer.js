import React, { Component } from 'react'
import _ from 'lodash';
import * as R from 'ramda';
import debug from 'debug';
import Promise from 'bluebird';
import registerTools from './lib';
import initWv from '@pdftron/webviewer';
import CertPdfModal from './components/CertPdfModal';
import ConfirmationModal from './components/ConfirmationModal';
import DocSelector from './components/DocSelector';




const log = debug('viewer');
// eslint-disable-next-line no-unused-vars
const logMsg = (label, msg) => (...args) => log(`${label}: ${msg}`);

const callIfDefined = R.when(
  R.isNil,
  R.pipe(
    R.tap((val) => log('callback not defined', val)),
    R.identity
  )
)










class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = { showPlaceHolder: false }
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();
    this.state = {
      certModal: { show: false, },
      confirmationModal: { show: false, },
    }
    this.notarialCertUploadRef = React.createRef();
  }



  componentDidMount = async () => {

    const winstance = window.origInstance = await initWv({
      path: `${process.env.PUBLIC_URL}/lib`,
      ...this.props.config,
      pdftronServer: 'https://webviewer-server.staging.enotarylog.com',
      // pdftronServer: 'http://47.198.214.240:8090/',
      css: '/styles/webviewer.css',
      custom: JSON.stringify(this.props?.config?.custom),
      config: '/wv-configs/vanilla-config.js'
    }, this.viewerRef.current);

    const { docs, selectedDoc, currentUser, isAdminUser } = this.props;




    // when ready is fired from public/wv-configs/config.js
    winstance.docViewer.one('ready', async (instance) => {
      // if already initialized, then return;
      if (this.instance) {
        return;
      }

      this.instance = window.instance = instance;
      const annotManager = this.annotManager = window.annotManager = instance.annotManager;
      const docViewer = this.docViewer = window.docViewer = instance.docViewer;


      this.instance.annotManager.trigger('setSigners', this.props.signers);


      // initialize custom annotation tools
      await registerTools({
        instance,
        config: this.props.toolConfig
      });



      annotManager.setCurrentUser(currentUser);
      annotManager.setIsAdminUser(isAdminUser);


      if (_.isFunction(this.props.authenticate)){
        await this.props.authenticate();
      }

      // Overwrite client-side permission check method on the annotation manager
      // The default was set to compare the authorName
      // Instead of the authorName, we will compare authorId created from the server
      annotManager.setPermissionCheckCallback((author, annotation) => {
        const currentUser = annotManager.getCurrentUser();
        const isAdmin = annotManager.getIsAdminUser();
        return annotation.authorId === currentUser || annotation.Author === currentUser || isAdmin;
      });




        // when cert modal clicked
        instance.docViewer.on('certModal', ({ type, pdf }) => {
          if (type === 'file'){
            return this.notarialCertUploadRef.current.click()
          }
          return this.setState({ certModal: { show: true, pdf } })
        });

        instance.docViewer.on('confirmationModal', ({ message, onConfirm }) => {
          return this.setState({
            confirmationModal: {
              show: true,
              message,
              onConfirm
            }
          })
        })



      // setup listeners which apply no matter which document is loaded 
      instance.docViewer.one('documentLoaded', async () => {
        // attach event listeners to docViewer
        docViewer.on('lockChanged', callIfDefined(this.props.onLockChanged))




        // bind events that should be bound once
        if (_.isFunction(this.props.bindEvents)){
          await this.props.bindEvents({
            ...this.instance,
            selectedDoc: this.instance.getDocId(),
          })
        }


        
        docViewer.on('formFieldsRemoved', callIfDefined(this.props.onRemoveFormFields))
        docViewer.on('allAnnotsRemoved', callIfDefined(this.props.onRemoveAllAnnots));
        annotManager.on('selectedSignerChanged', R.juxt([
          R.converge(this.instance.toggleTools, [R.equals('-1')]),
          this.props.onSelectedSignerChanged
        ]));        
        
      });








      // setup listeners which listen for events fired from webviewer
      instance.docViewer.on('documentLoaded', async () => {
        
        new Promise((res) => this.instance.docViewer.trigger('setBlankPages', [this.props.blankPages, () => res()]));



        // bind events for receiving downstream updates 
        if (_.isFunction(this.props.bindDocEvents)){
          await this.props.bindDocEvents({
            ...instance,
            selectedDoc: instance.getDocId(),
          })
        }

        docViewer.on('blankPagesAdded', callIfDefined(this.props.onBlankPagesAdded));
        docViewer.on('blankPagesRemoved', callIfDefined(this.props.onBlankPagesRemoved));

        // add event listeners on annotManager for sending annots upstream
        annotManager.on('annotationAdded', this.props.onAnnotationAdded);
        annotManager.on('annotationUpdated', this.props.onAnnotationUpdated);
        annotManager.on('annotationDeleted', this.props.onAnnotationDeleted);
        annotManager.on('widgetAdded', this.props.onWidgetAdded);
        annotManager.on('widgetUpdated', this.props.onWidgetUpdated);
        annotManager.on('widgetDeleted', this.props.onWidgetDeleted);
        annotManager.on('fieldUpdated', this.props.onFieldUpdated);

        // NOTE: this fixes an issue where on initial load, if there are text annots on the page, the webviewer shows a cursor
        setTimeout(() => instance.docViewer.zoomTo(instance.docViewer.getZoom()), 2000);
      });




      // detach all listeners
      instance.docViewer.on('documentUnloaded', () => {
        docViewer.off('blankPagesAdded');
        docViewer.off('blankPagesRemoved');
        annotManager.off('annotationAdded');
        annotManager.off('annotationUpdated');
        annotManager.off('annotationDeleted');
        annotManager.off('widgetAdded');
        annotManager.off('widgetUpdated');
        annotManager.off('widgetDeleted');
        annotManager.off('fieldUpdated');
      });




      instance.docViewer.on('annotationsLoaded', async () => {

        // Set the list of signers to assign template fields for.
        instance.annotManager.trigger('setSigners', this.props.signers);

        // Set the selected signer
        instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

        // Set the currentUser
        // instance.annotManager.trigger('setCurrentUser', this.props.currentUser || this.props.userId);
        instance.annotManager.trigger('updateAnnotationPermission')

      });

      if (docs[selectedDoc]){
        await instance.loadDocument(docs[selectedDoc], {
          l: this.props.config.l, 
          docId: selectedDoc,
          filename: selectedDoc,
          extension: 'pdf' 
        })
      }
      
    });

    return winstance.docViewer.trigger('initReady');
  }




  componentWillUnmount = async () => {
    if (_.isFunction(this.props.unbindEvents)){
      await this.props.unbindEvents();
    }
  }



  componentDidUpdate = async (prevProps, prevState) => {
    if (!this.instance){
      return;
    }

    // selected document has changed. close doc and open new
    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (this.props.docs[this.props.selectedDoc]) {

        // unBind any external listeners
        if (_.isFunction(this.props.unbindDocEvents)) {
          await this.props.unbindDocEvents({
            ...this.instance,
            selectedDoc: this.instance.getDocId(),
          })
        }

        await this.instance.closeDocument();
        return this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { 
          docId: this.props.selectedDoc, 
          filename: this.props.selectedDoc,
          l: this.props.config.l, 
          extension: 'pdf' 
        });
      } else {
        return this.instance.closeDocument(); 
      }
    }

    // signers list has been updated
    if (prevProps.signers !== this.props.signers) {
      this.instance.annotManager.trigger('setSigners', this.props.signers);
    }

    // selected signer has been changed
    // TODO: move to bindEvents
    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }


    // admin user status changed
    if (prevProps.isAdminUser !== this.props.isAdminUser) {
      this.instance.annotManager.setIsAdminUser(this.props.isAdminUser);
    }
  }

  render() {
    return (
      <>
        <DocSelector />

        <div
          style={{ height: '100%' }}
          data-testid='webviewer-container'
          className='webviewer-container'
          ref={this.viewerRef}
        />


        <input
          ref={this.notarialCertUploadRef}
          type='file'
          style={{ display: 'none' }}
          accept='image/*,.pdf'
          onChange={(e) => this.setState({ certModal: { show: true, type: 'file', pdf: e.target.files[0] } })}
        />

        <ConfirmationModal
          show={this.state.confirmationModal.show}
          message={this.state.confirmationModal.message}
          onHide={() => this.setState({ confirmationModal: { show: false }})}
          onSubmit={() => {
            this.instance.docViewer.trigger(this.state.confirmationModal.onConfirm);
            return this.setState({ confirmationModal: { show: false } })
          }}
        />
        <CertPdfModal
          show={this.state.certModal.show}
          pdf={this.state.certModal.pdf}
          onHide={() => this.setState({ certModal: { show: false }})}
          onSubmit={({ img, dataUrl }) => {
            this.instance.setCertPdf({ img, dataUrl });
            this.instance.setToolMode('NotaryCertTool');
            this.setState({ certModal: { show: false } });
          }}
        />
      </>
    );
  }
}

export default Webviewer;
