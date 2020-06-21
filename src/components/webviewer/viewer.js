import React, { Component, useEffect } from 'react'
import _ from 'lodash';
import * as R from 'ramda';
import debug from 'debug';
import Promise from 'bluebird';
import SelectSigner from './components/SelectSigner';
import RequiredCheckbox from './components/RequiredCheckbox';
import registerTools from './lib/tools';
import initWv from '@pdftron/webviewer';
import CertPdfModal from './components/CertPdfModal';


const log = debug('viewer');

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
    // const { default: initWv } = await import('@pdftron/webviewer');

    
    const instance = window.origInstance = await initWv({
      path: `${process.env.PUBLIC_URL}/lib`,
      ...this.props.config,
      // pdftronServer: 'https://webviewer-server.staging.enotarylog.com',
      pdftronServer: 'http://47.198.214.240:8090/',
      css: '/styles/webviewer.css',
      custom: JSON.stringify(this.props?.config?.custom)
    }, this.viewerRef.current);

    // instance.CoreControls.SetPreRenderLevel(5)
    // instance.CoreControls.setProgressiveTime(2000);
    // when ready is fired from public/wv-configs/config.js
    instance.docViewer.one('ready', async (instance) => {
      // if already initialized, then return;
      if (this.instance){
        return;
      }

      this.instance = instance;
      this.fieldManager = this.instance.annotManager.getFieldManager();
      window.instance = instance;

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
    

      this.setState(({ instance }));



      instance.docViewer.on('documentUnloaded', R.pipeP(
        R.pipe(callIfDefined(this.props.onDocumentUnloaded), R.bind(Promise.resolve, Promise)),
        async () => this.disableAllTools(this.instance),
      ));

      instance.docViewer.on('annotationsLoaded', R.pipeP(
        async () => {

          // Set the list of signers to assign template fields for.
          instance.annotManager.trigger('setSigners', this.props.signers);

          // Set the selected signer
          instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

          // Set the currentUser
          instance.annotManager.trigger('setCurrentUser', this.props.currentUser);

        },
        async () => {

          const iter = this.props.onAnnotationsLoaded(instance.getDocId(), instance.docViewer.getPageCount());



          // load the annots
          const { value: annotsToLoad } = await iter.next();
          console.log('loading annotations', annotsToLoad)
          if (_.values(annotsToLoad).length > 0){
            // this.instance.showMessage('Processing annotations...');
            await new Promise((res) => this.instance.annotManager.trigger('addAnnotation', [_.values(annotsToLoad), () => res()]))
          }

          const { value: blankPages = 0 } = await iter.next();
          console.log('blankPages', blankPages);
          await new Promise((res) => instance.docViewer.trigger('setBlankPages', [blankPages, () => res()]));




          console.log('instance.docViewer.isInViewportRenderMode()', await instance.docViewer.isInViewportRenderMode());
          // go to page number
          const { value: pageNumber } = await iter.next();
          // console.log('setting pageNumber', pageNumber);
          // const pgCnt = await this.instance.docViewer.getPageCount();
          // if (pageNumber <= pgCnt && pageNumber > 0){
          //   await this.instance.setCurrentPageNumber(this.props.pageNumber);
          // }

          // await instance.docViewer.zoomTo(instance.docViewer.getZoom())
          await iter.next();
        },
        async () => this.enableAllTools(this.instance),
        async () => this.instance.hideMessage(),
      ));







      // Bind event handlers to functions passed as prop
      instance.annotManager.on('widgetAdded', callIfDefined(this.props.onWidgetAdded));
      instance.annotManager.on('annotationAdded', callIfDefined(this.props.onAnnotationAdded));
      instance.annotManager.on('annotationDeleted', callIfDefined(this.props.onAnnotationDeleted));
      instance.annotManager.on('annotationUpdated', callIfDefined(this.props.onAnnotationUpdated));
      instance.annotManager.on('fieldUpdated', R.pipe(
        ({ name, value }) => {
          const { widgets } = instance.annotManager.getFieldManager().getField(name)
          const widget = _.head(_.uniqBy(widgets, 'CustomData.id'));
          console.log(name, value);
          return {
            name, value, widget
          }
        },
        callIfDefined(this.props.onFieldUpdated)
      ));

      instance.docViewer.on('blankPagesAdded', callIfDefined(this.props.onBlankPagesAdded));
      instance.docViewer.on('blankPagesRemoved', callIfDefined(this.props.onBlankPagesRemoved));
      instance.docViewer.on('removeFormFields', callIfDefined(this.props.onRemoveFormFields))


      instance.annotManager.setIsAdminUser(this.props.isAdminUser);


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
      

      const sigTool = instance.docViewer.getTool('AnnotationCreateSignature');
      sigTool.on('signatureSaved', R.pipe(
        ([annot]) => {
          if (annot instanceof instance.Annotations.FreeHandAnnotation){
            return ({
              annotClass: 'FreeHandAnnotation',
              type: annot.CustomData.type,
              data: annot.getPaths(),
              authorId: annot.Author,
            })
          } else {
            return {
              annotClass: 'StampAnnotation',
              type: annot.CustomData.type,
              data: annot.ImageData,
              authorId: annot.Author
            };
          }
        },
        callIfDefined(this.props.onSignatureSaved)
      ));

      // when cert modal clicked
      instance.docViewer.on('certModal', ({ type, pdf }) => this.setState({ certModal: { show: true, pdf } }));
  



      if (this.props.docs[this.props.selectedDoc]) {
        console.log('loading doc')
        
        this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { 
          l: this.props.config.l, 
          docId: this.props.selectedDoc,
          filename: this.props.selectedDoc,
          extension: 'pdf' 
        });
      }



      if (_.isFunction(this.props.onReady)) {
        this.props.onReady({ ...instance, });
      }
    });

    return instance.docViewer.trigger('initReady');
  }





  componentDidUpdate = async (prevProps, prevState) => {
    if (!this.instance){
      return;
    }


    if (prevProps.isAdminUser !== this.props.isAdminUser) {
      await this.instance.annotManager.setIsAdminUser(this.props.isAdminUser);
    }

    if (prevProps.currentUser !== this.props.currentUser) {
      await this.instance.annotManager.trigger('setCurrentUser', this.props.currentUser);
    }

    if (prevProps.signers !== this.props.signers) {
      await this.instance.annotManager.trigger('setSigners', this.props.signers);
    }

    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      await this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }

    if (prevProps.selectedDoc !== this.props.selectedDoc && this.instance) {
      console.log('loading doc cdm')
      
      if (this.props.docs[this.props.selectedDoc]) {
        return this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { 
          docId: this.props.selectedDoc, 
          l: this.props.config.l, 
          extension: 'pdf' 
        });
      } else {
        return this.instance.closeDocument(); 
      }
    }

    if (!this.instance.docViewer.getDocument()){
      log('no document loaded. returning')
      return;
    }


    // await this.instance.docViewer.getAnnotationsLoadedPromise();
    if (prevProps.blankPages !== this.props.blankPages){
      if (_.isNumber(this.props.blankPages)){
        this.instance.docViewer.trigger('setBlankPages', [this.props.blankPages]);
        await new Promise((res) => this.instance.docViewer.trigger('setBlankPages', [this.props.blankPages, () => res()]));
      }
    }

    // update fields if applicable
    // _.map(this.props.fields, (val, key) => {
    //   const field = this.fieldManager.getField(key);
    //   if (field && field.value !== val) {
    //     field.setValue(val);
    //   }
    // });

    // annotsToImport will be a xfdf containing single annotation
    if (prevProps.annotToImport !== this.props.annotToImport) {

      if (!_.isEmpty(this.props.annotToImport)) {
        await new Promise((res) => this.instance.annotManager.trigger('addAnnotation', [this.props.annotToImport, async () => {
          await this.props.onAnnotImported();
          return res();
        }]));
      }
    }




    if (prevProps.pageNumber !== this.props.pageNumber && _.isNumber(this.props.pageNumber)){
      const currPageNum = this.instance.docViewer.getCurrentPage();
      if (currPageNum !== this.props.pageNumber){
        await this.instance.setCurrentPageNumber(this.props.pageNumber);
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
          onSubmit={({ img, dataUrl }) => {
            this.instance.setCertPdf({ img, dataUrl });

            this.instance.setToolMode('NotaryCertTool');
            this.setState({ certModal: { show: false } });
          }}
          
          onHide={() => this.setState({ certModal: { show: false } })}
        />
      </>
    );
  }
}

export default Webviewer;
