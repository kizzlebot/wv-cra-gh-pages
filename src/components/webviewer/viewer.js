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
      ...this.props.config,
      path: '/lib',
      // pdftronServer: 'https://webviewer-server.staging.enotarylog.com',
      custom: JSON.stringify(this.props?.config?.custom)
    }, this.viewerRef.current);



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


    instance.annotationPopup.add({
      type: 'customElement',
      title: 'Required',
      render: () => (
        <RequiredCheckbox
          annotManager={instance.annotManager}
          signers={instance.iframeWindow.getSigners()}
        />
      ),
    });
    

    // when ready is fired from public/wv-configs/config.js
    instance.docViewer.one('ready', async (instance) => {
      this.instance = instance;
      window.instance = instance;

      this.setState(({ instance }));


      instance.annotManager.on('widgetAdded', this.props.onWidgetAdded);
      instance.annotManager.on('annotationAdded', this.props.onAnnotationAdded);
      instance.annotManager.on('annotationDeleted', this.props.onAnnotationDeleted);
      instance.annotManager.on('annotationUpdated', this.props.onAnnotationUpdated);
      instance.annotManager.on('fieldUpdated', this.props.onFieldUpdated);


      instance.docViewer.on('documentLoaded', this.props.onDocumentLoaded);
      instance.docViewer.on('documentUnloaded', this.props.onDocumentUnloaded);
      instance.docViewer.on('annotationsLoaded', this.props.onAnnotationsLoaded);



      if (!_.isEmpty(this.props.selectedDoc)) {
        await this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' });
      }




      // Set the list of signers to assign template fields for.
      instance.annotManager.trigger('setSigners', this.props.signers);

      // Set the selected signer
      instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);

      
      instance.docViewer.on('annotationsLoaded', async () => {
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

    if (prevProps.selectedSigner !== this.props.selectedSigner) {
      await this.instance.annotManager.trigger('setSelectedSigner', this.props.selectedSigner);
    }

    console.log('selectedDoc', this.props.selectedDoc)
    if (prevProps.selectedDoc !== this.props.selectedDoc && this.instance) {
      if (!_.isEmpty(this.props.selectedDoc)) {
        return this.instance.loadDocument(this.props.docs[this.props.selectedDoc], { l: this.props.config.l, extension: 'pdf' });
      }
    }


    if (prevProps.toImport !== this.props.toImport) {
      console.log('%cannotations changed', 'font-size:20px;color:red;')
      if (this.props.toImport) {
        console.log(`%c${this.props.toImport.xfdf}`, 'font-size:20px;color:red;')
        if (this.props.toImport.type === 'delete'){
          const toDel = this.instance.annotManager.getAnnotationById(this.props.toImport.id);
          if (toDel){
            this.instance.annotManager.deleteAnnotation(toDel, true);
          }
        } else {
          const annots = await this.instance.annotManager.importAnnotCommand(this.props.toImport.xfdf);
          console.log(annots);
          await Promise.map(annots, (annot) => this.instance.annotManager.redrawAnnotation(annot));
        }
        // await instance.annotManager.redrawAnnotation(annot);
        // await instance.getInstance().fireEvent('updateAnnotationPermission', [annot]);
        this.props.onImported();
      }
      // await this.loadAnnotations();
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
