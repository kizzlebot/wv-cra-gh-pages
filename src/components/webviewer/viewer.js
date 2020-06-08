import React, { Component } from 'react'
import _ from 'lodash';
import Promise from 'bluebird';
import SelectSigner from './components/SelectSigner';
import RequiredCheckbox from './components/RequiredCheckbox';
import registerTools from './lib/tools';
import { Modal } from 'react-bootstrap';



class Webviewer extends Component {
  constructor(props) {
    super(props);
    this.state = { showPlaceHolder: false }
    this.viewerRef = React.createRef();
    this.targetRef = React.createRef();
    this.containerRef = React.createRef();
    this.state = {
      certModal: { show: false, }
    }
  }


  componentDidMount = async () => {
    const { default: initWv } = await import('@pdftron/webviewer');

    const instance = await initWv({
      path: '/lib',
      ...this.props.config,
      // pdftronServer: 'https://webviewer-server.staging.enotarylog.com',
      custom: JSON.stringify(this.props?.config?.custom)
    }, this.viewerRef.current);



    // when ready is fired from public/wv-configs/config.js
    instance.docViewer.one('ready', async (instance) => {
      this.instance = instance;
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


      instance.annotManager.on('widgetAdded', this.props.onWidgetAdded);
      instance.annotManager.on('annotationAdded', this.props.onAnnotationAdded);
      instance.annotManager.on('annotationDeleted', this.props.onAnnotationDeleted);
      instance.annotManager.on('annotationUpdated', this.props.onAnnotationUpdated);
      instance.annotManager.on('fieldUpdated', this.props.onFieldUpdated);
      instance.docViewer.on('documentUnloaded', this.props.onDocumentUnloaded);
      instance.docViewer.on('documentLoaded', this.props.onDocumentLoaded);
      instance.docViewer.on('annotationsLoaded', async () => {
        await this.props.onAnnotationsLoaded(instance.getDocId())
      });


      instance.annotManager.setIsAdminUser(this.props.isAdminUser);

      if (this.props.docs[this.props.selectedDoc]) {
        await this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { 
          l: this.props.config.l, 
          docId: this.props.selectedDoc,
          extension: 'pdf' 
        });
      }

      // Set the list of signers to assign template fields for.
      instance.annotManager.trigger('setSigners', this.props.signers);

      // Set the selected signer
      instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

      // Set the currentUser
      instance.annotManager.trigger('setCurrentUser', this.props.currentUser);

      
      instance.docViewer.on('annotationsLoaded', async () => {
        // Set the selected signer
        instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

        // Set the currentUser
        instance.annotManager.trigger('setCurrentUser', this.props.currentUser);
        return this.loadAnnotations()
      });


      await registerTools(instance);


      // when cert modal clicked
      instance.docViewer.on('certModal', ({ type }) => {
        console.debug('cert type', type)
        return this.setState({ certModal: { show: true } })
      });
  





      if (_.isFunction(this.props.onReady)) {
        this.props.onReady({ ...instance, });
      }
    });
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


    // import widgets if it changes
    if (prevProps.widgetToImport !== this.props.widgetToImport) {
      console.log('%cwidget changed', 'font-size:20px;color:red;')

      if (this.props.widgetToImport) {
        const existing = await this.instance.annotManager.getWidgetById(this.props.widgetToImport.id)


        // if delete called an
        if (this.props.widgetToImport.type === 'delete' && existing){
          console.log('deleting widget');
          await this.instance.annotManager.deleteAnnotation(existing, true);
        } 
        else if (this.instance.getRunId() === this.props.widgetToImport.runId && existing) {
          console.log('%cwidget created by this browser skipping...', 'font-size:19px;color:red;')
          this.props.onWidgetImported();
        }
        else {
          const annots = await this.instance.annotManager.importAnnotations(this.props.widgetToImport.xfdf);
          await Promise.map(annots, (annot) => this.instance.annotManager.redrawAnnotation(annot));
          this.props.onWidgetImported();
          this.instance.annotManager.trigger('updateAnnotationPermission');
        }
      }
    }

    // annotsToImport will be a xfdf containing single annotation
    if (prevProps.annotToImport !== this.props.annotToImport) {
      console.log('%cannotations changed', 'font-size:20px;color:red;')

      if (this.props.annotToImport) {
        if (this.props.annotToImport.type === 'delete'){
          const toDel = this.instance.annotManager.getAnnotationById(this.props.annotToImport.id);
          if (toDel){
            this.instance.annotManager.deleteAnnotation(toDel, true);
          }
        } else {
          const annots = await this.instance.annotManager.importAnnotations(this.props.annotToImport.xfdf);
          await Promise.map(annots, (annot) => this.instance.annotManager.redrawAnnotation(annot));
        }

        this.props.onAnnotImported();
      }
      // await this.loadAnnotations();
    }


    if (prevProps.pageNumber !== this.props.pageNumber && _.isNumber(this.props.pageNumber)){
      const currPageNum = this.instance.docViewer.getCurrentPage();
      if (currPageNum !== this.props.pageNumber){
        await this.instance.setCurrentPageNumber(this.props.pageNumber);
      }
    }

  }



  // load annotations passed as props
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

        <Modal 
          show={this.state.certModal.show}
          onHide={() => this.setState({ certModal: { show: false } })}
        >
          <Modal.Header closeButton>
            Hello
          </Modal.Header>
          <Modal.Body>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis possimus quasi hic, tenetur recusandae laudantium quod labore aut doloremque, cum deserunt amet architecto perspiciatis voluptatibus qui deleniti sapiente itaque odit.
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default Webviewer;
