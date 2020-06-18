import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';
// import createDeleteTool from 'lib/pdftron/createDeleteTool';
// import { createCertModalHeader } from 'utils/helpers/createCertModalHeader';



const loadImg = async (url) => new Promise((res) => {
  const img = new window.Image();

  img.addEventListener('load', () => res(img));
  img.src = url;
});


function blobToDataURL(blob) {
  return new Promise((res) => {
    const a = new FileReader();

    a.onload = function onload(e) {
      return res(e.target.result);
    };

    a.readAsDataURL(blob);
  });
}

class CertViewer extends Component {
  constructor(props) {
    super(props);

    this.viewer = React.createRef();
    this.inputRef = React.createRef();
    this.docViewer = null;
    this.annotManager = null;
    this.instance = null;
    this.CoreControls = null;
    this.state = { loaded: false };
  }


  async componentDidMount() {
    const { default: WebViewer } = await import('@pdftron/webviewer');
    const instance = await WebViewer({
      path: '/lib',
      fullAPI: true,
      initialDoc: this.props.pdf,
      l: 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7',
      enableAnnotations: true,
      pdftronServer: 'https://demo.pdftron.com/',
      disabledElements: [
      ]
    }, this.viewer.current);

    // await createCertModalHeader(instance);
    // at this point, the viewer is 'ready'
    // call methods from instance, docViewer and annotManager as needed
    this.instance = instance;

    if (this.props.images) {
      await this.setNotarySignatures();
    }

    const {
      docViewer, annotManager, CoreControls,
    } = instance;

    this.docViewer = docViewer;
    this.annotManager = annotManager;
    this.CoreControls = CoreControls;

    // await instance.setHeaderItems((header) => {
    //   header.get('selectToolButton')
    //     .insertAfter({
    //       type: 'toolButton',
    //       dataElement: 'deleteTool',
    //       toolName: 'deleteTool',
    //     });
    // });

    // await instance.loadDocument(this.props.pdf);
    this.docViewer.on('annotationsLoaded', async () => {
      // all annotations are available
      this.setState({ loaded: true });
    });
  }


  createSigAnnot = (type, dataUrl) => {
    const sigFh = new this.instance.Annotations.StampAnnotation();

    sigFh.ImageData = dataUrl;
    sigFh.Subject = 'Signature';
    sigFh.Width = 200;
    sigFh.Height = 79.18999999999994;
    sigFh.MaintainAspectRatio = true;
    sigFh.setCustomData('type', type);

    return sigFh;
  }

  setNotarySignatures = async () => {
    // const createSignatureTool = this.instance.docViewer.getTool('AnnotationCreateSignature');

    // const sigFh = this.createSigAnnot('signature', this.props.images.notarySignatureImg);
    // const initialsFh = this.createSigAnnot('initials', this.props.images.notaryInitialsImg);


    // this.instance.docViewer.on('init', async () => {
    //   setTimeout(() => {
    //     createSignatureTool.saveSignatures([sigFh, initialsFh]);

    //     if (this.props.onInit) {
    //       return this.props.onInit(this.instance);
    //     }
    //   }, 1000);
    // });
  }

  render() {
    return (
      <>
        <Modal.Body>
          <div
            className='webviewer cert'
            ref={this.viewer}

          />
        </Modal.Body>
        <Modal.Footer
          style={{
            borderTop: '1px solid',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            disabled={!this.state.loaded}
            onClick={this.props.onClose}
          >
            Close
          </Button>
          <Button
            disabled={!this.state.loaded}
            onClick={async () => {
              /* converts pdf to png dataurl */

              // export annotations as xml
              const xfdfString = await this.annotManager.exportAnnotations({ widgets: true, links: false, fields: true });
              const doc = this.docViewer.getDocument();
              const options = { xfdfString };

              // get the file data w/ annotations baked in
              const data = await doc.getFileData(options);
              const arr = new Uint8Array(data);


              // convert to png dataUrl
              const PDFNet = this.instance.PDFNet;

              await PDFNet.initialize();
              const pdoc = await PDFNet.PDFDoc.createFromBuffer(arr);

              const pdfDraw = await PDFNet.PDFDraw.create(184);

              const itr = await pdoc.getPageIterator(1);
              const currPage = await itr.current();
              const pngBuffer = await pdfDraw.exportStream(currPage, 'PNG');
              const pngblob = new Blob([pngBuffer], { type: 'image/png' });
              const dataurl = await blobToDataURL(pngblob);


              this.props.onSubmit({ dataurl });
            }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </>
    );
  }
}


export default function CertPdfModal(props) {
  return (
    <Modal
      size='xl'
      show={props.show}
      onHide={props.onHide}
    >
      <Modal.Header>
        {props.type} Certificate
      </Modal.Header>
      
      <CertViewer
        images={props.images}
        pdf={props.pdf || `https://storage.googleapis.com/enl-static-files/certs/acknowledgement.pdf`}
        onSubmit={async ({ dataurl }) => {
          const img = await loadImg(dataurl);
          return props.onSubmit({ img, dataUrl: dataurl });
        }}
        onClose={props.onHide}
      />
    </Modal>
  );
}
