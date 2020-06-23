import React, { Component, useEffect } from 'react'
import _ from 'lodash';
import * as R from 'ramda';
import debug from 'debug';
import Promise from 'bluebird';
import SelectSigner from '../webviewer/components/SelectSigner';
import RequiredCheckbox from '../webviewer/components/RequiredCheckbox';
import registerTools from '../webviewer/lib/tools';
import initWv from '@pdftron/webviewer';
import CertPdfModal from '../webviewer/components/CertPdfModal';
import { withUseServer } from '../../lib/hooks/useServerProvider';


const log = debug('viewer');
const logMsg = (label, msg) => (...args) => log(`${label}: ${msg}`);

const callIfDefined = R.when(
  R.isNil,
  R.pipe(
    R.tap((val) => console.log('callback not defined', val)),
    R.identity
  )
)




const createEnableDisableTools = (disable) => (instance) => instance.setHeaderItems((header) => {
  _.chain(header.headers.default)
    .map('dataElement')
    .filter(R.complement(_.isNil))
    .forEach((dataEl) => {
      instance.updateElement(dataEl, { disable: disable });
    })
    .value()

  instance.annotManager.setReadOnly(disable)
})





class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = { showPlaceHolder: false }
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();
    this.state = {
      certModal: { show: false, },
    }
  }

  disableAllTools = createEnableDisableTools(true)
  enableAllTools = createEnableDisableTools(false)

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

    const { docs, selectedDoc, currentUser } = this.props;




    // when ready is fired from public/wv-configs/config.js
    winstance.docViewer.one('ready', async (instance) => {
      // if already initialized, then return;
      if (this.instance) {
        return;
      }

      this.instance = window.instance = instance;
      const annotManager = this.annotManager = window.annotManager = instance.annotManager;
      const docViewer = this.docViewer = window.docViewer = instance.docViewer;
      const fieldManager = this.fieldManager = window.fieldManager = this.instance.annotManager.getFieldManager();


      this.instance.annotManager.trigger('setSigners', this.props.signers);


      // initialize custom annotation tools
      await registerTools({
        instance,
        config: {
          toolNames: [
            'SelectSigner', 
            'Divider', 
            'AddBlankPage', 
            'RemoveBlankPage', 
            'Divider', 
            'RemoveFormFields', 
            'Divider', 
            'FormFieldTools', 
            'TemplateTools', 
            'Divider', 
            'StampTools', 
            'CertTool'
          ]
        }
      });

      instance.annotationPopup.add({
        type: 'customElement',
        title: 'Select Signer',
        render: () => (
          <SelectSigner
            annotManager={instance.annotManager}
            instance={instance}
            signers={instance.getSigners()}
          />
        ),
      });


      instance.annotationPopup.add({
        type: 'customElement',
        title: 'Required',
        render: () => (
          <RequiredCheckbox
            annotManager={instance.annotManager}
            signers={instance.getSigners()}
          />
        ),
      });
    




      let authorId = currentUser;
      annotManager.setCurrentUser(currentUser);


      await this.props.authenticate();

      // Overwrite client-side permission check method on the annotation manager
      // The default was set to compare the authorName
      // Instead of the authorName, we will compare authorId created from the server
      annotManager.setPermissionCheckCallback((author, annotation) => annotation.authorId === authorId || annotation.Author === authorId);


      instance.docViewer.one('documentLoaded', () => {
        // attach event listeners to docViewer
        docViewer.on('blankPagesAdded', callIfDefined(this.props.onBlankPagesAdded));
        docViewer.on('blankPagesRemoved', callIfDefined(this.props.onBlankPagesRemoved));
        docViewer.on('removeFormFields', callIfDefined(this.props.onRemoveFormFields))

        // when cert modal clicked
        instance.docViewer.on('certModal', ({ type, pdf }) => this.setState({ certModal: { show: true, pdf } }));
      });


      instance.docViewer.on('documentLoaded', async () => {
        
        new Promise((res) => this.instance.docViewer.trigger('setBlankPages', [this.props.blankPages, () => res()]));



        // bind events for receiving downstream updates 
        if (_.isFunction(this.props.bindEvents)){
          await this.props.bindEvents({
            ...instance,
            selectedDoc: instance.getDocId(),
          })
        }


        // add event listeners on annotManager for sending annots upstream
        annotManager.on('annotationAdded', this.props.onAnnotationAdded);
        annotManager.on('annotationUpdated', this.props.onAnnotationUpdated);
        annotManager.on('annotationDeleted', this.props.onAnnotationDeleted);
        annotManager.on('widgetAdded', this.props.onWidgetAdded);
        annotManager.on('widgetUpdated', this.props.onWidgetUpdated);
        annotManager.on('widgetDeleted', this.props.onWidgetDeleted);
        annotManager.on('fieldUpdated', this.props.onFieldUpdated);
        annotManager.on('selectedSignerChanged', this.props.onSelectedSignerChanged)
      });




      // detach all listeners
      instance.docViewer.on('documentUnloaded', () => {
        annotManager.off('annotationAdded');
        annotManager.off('annotationUpdated');
        annotManager.off('annotationDeleted');
        annotManager.off('widgetAdded');
        annotManager.off('widgetUpdated');
        annotManager.off('widgetDeleted');
        annotManager.off('fieldUpdated');
      })




      instance.docViewer.on('annotationsLoaded', async () => {

        // Set the list of signers to assign template fields for.
        instance.annotManager.trigger('setSigners', this.props.signers);

        // Set the selected signer
        instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

        // Set the currentUser
        instance.annotManager.trigger('setCurrentUser', this.props.currentUser || this.props.userId);

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





  componentDidUpdate = async (prevProps, prevState) => {
    if (!this.instance){
      return;
    }

    // selected document has changed. close doc and open new
    if (prevProps.selectedDoc !== this.props.selectedDoc) {
      if (this.props.docs[this.props.selectedDoc]) {

        // unBind any external listeners
        if (_.isFunction(this.props.unbindEvents)) {
          await this.props.unbindEvents({
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

    // the current user has been changed
    if (prevProps.currentUser !== this.props.currentUser) {
      this.instance.annotManager.trigger('setCurrentUser', this.props.currentUser);
    }

    // selected signer has been changed
    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }

    // admin user status changed
    if (prevProps.isAdminUser !== this.props.isAdminUser) {
      this.instance.annotManager.setIsAdminUser(this.props.isAdminUser);
    }


    if (prevProps.blankPages !== this.props.blankPages){
      if (_.isNumber(this.props.blankPages)){
        this.instance.docViewer.trigger('setBlankPages', [this.props.blankPages]);
        await new Promise((res) => this.instance.docViewer.trigger('setBlankPages', [this.props.blankPages, () => res()]));
      }
    }



  }

  render() {
    return (
      <>
        <div
          style={{ height: '100%' }}
          data-testid='webviewer-container'
          className='webviewer-container'
          ref={this.viewerRef}
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

export default withUseServer(Webviewer);
