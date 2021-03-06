import _ from 'lodash';
import * as R from 'ramda';
import { injectTool } from "../initializers/injectors";

import registerHeaderGroup from "../initializers/registerHeaderGroup";
import defineAnnotClass from '../initializers/defineAnnotClass';
import defineToolClass from '../initializers/defineToolClass';
import registerAnnotationType from '../initializers/registerAnnotationType';
import registerTool from '../initializers/registerTool';

const uploadIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="upload" class="svg-inline--fa fa-upload fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg>';

const onMouseLeftUp = () => async ({ context, instance, ...rest }) => {
  let annotation;
  const inst = context.tool;
  instance.Tools.GenericAnnotationCreateTool.prototype.mouseLeftDown.call(inst, context.args[0]);

  if (inst.annotation) {
    const { dataUrl, img } = await instance.getCertPdf();
    if (!dataUrl) {
      return;
    }
    inst.aspectRatio = img.width / img.height;
    let width = 300;

    let height = width / inst.aspectRatio;

    const rotation = instance.docViewer.getCompleteRotation(1) * 90;
    inst.annotation.Rotation = rotation;

    if (rotation === 270 || rotation === 90) {
      const t = height;
      height = width;
      width = t;
    }

    inst.annotation.ImageData = dataUrl;
    inst.annotation.Width = width;
    inst.annotation.Height = height;
    inst.annotation.X -= width / 2;
    inst.annotation.Y -= height / 2;

    annotation = inst.annotation;
  }

  instance.Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(inst, context.args[0]);

  if (annotation) {
    const annotManager = instance.docViewer.getAnnotationManager();
    annotManager.deselectAllAnnotations();
    annotManager.redrawAnnotation(annotation);
    annotManager.selectAnnotation(annotation);
    instance.setToolMode('AnnotationEdit');
  }
}


const onMouseLeftDown = () => async ({ context, instance }) => {
  const { args } = context;
  const am = instance.docViewer.getAnnotationManager();
  const annot = am.getAnnotationByMouseEvent(context.args[0]);
  if (annot) {
    return;
  }
  instance.Tools.AnnotationSelectTool.prototype.mouseLeftDown.apply(context.tool, [args[0]]);
}





const createInjectCertTool = ({ pdfUrl, icon, type, toolName, tooltip }) => injectTool(toolName, {
  type: 'actionButton',
  img: icon || `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11.25 9.541l-2.25-2.182.929-.929 1.321 1.253 2.821-2.892.929.93-3.75 3.82zm7.676-3.819c-.482 1.41-.484 1.139 0 2.555.05.147.074.297.074.445 0 .449-.222.883-.615 1.156-1.256.87-1.09.651-1.562 2.067-.198.591-.77.99-1.415.99h-.003c-1.549-.005-1.28-.088-2.528.789-.262.184-.569.276-.877.276s-.615-.092-.876-.275c-1.249-.878-.98-.794-2.528-.789h-.004c-.645 0-1.216-.399-1.413-.99-.473-1.417-.311-1.198-1.562-2.067-.395-.274-.617-.708-.617-1.157 0-.148.024-.298.074-.444.483-1.411.484-1.139 0-2.555-.05-.147-.074-.297-.074-.445 0-.45.222-.883.616-1.157 1.251-.868 1.089-.648 1.562-2.067.197-.591.769-.99 1.413-.99h.004c1.545.005 1.271.095 2.528-.79.262-.183.569-.274.877-.274s.615.091.876.274c1.248.878.98.795 2.528.79h.003c.646 0 1.217.399 1.415.99.473 1.416.307 1.197 1.562 2.067.394.273.616.707.616 1.156 0 .148-.024.299-.074.445zm-2.176 1.278c0-2.623-2.127-4.75-4.75-4.75s-4.75 2.127-4.75 4.75 2.127 4.75 4.75 4.75 4.75-2.128 4.75-4.75zm-7.385 7.931c-.766 0-1.371-.074-1.873-.213-.308 3.068-1.359 5.37-3.492 7.592.854.107 1.95-.094 2.833-.56.317.636.65 1.43.767 2.25 2.009-2.299 3.266-5.054 3.734-8.071-.943-.181-1.234-.496-1.969-.998zm5.27 0c-.737.507-1.043.82-1.968.998.47 3.017 1.726 5.772 3.733 8.071.116-.82.449-1.614.767-2.25.883.465 1.979.667 2.833.56-2.13-2.219-3.168-4.531-3.479-7.595-.503.141-1.112.216-1.886.216z"></path></svg>`,
  dataElement: _.camelCase(toolName),
  onClick: ({ instance }) => async () => {
    await instance.docViewer.trigger('certModal', { type, pdf: pdfUrl });
    return instance.setActiveHeaderGroup('default')
  },
  title: tooltip,
  // hidden: ['tablet', 'mobile']
})


const createStampAnnotTool = R.pipeP(
  defineAnnotClass({
    className: 'NotaryCertAnnotation',
    baseClassName: 'StampAnnotation',
  }),

  // define tool class that uses annot class
  defineToolClass({
    className: 'NotaryCertTool',
    annotClassName: 'NotaryCertAnnotation',
    baseClassName: 'GenericAnnotationCreateTool',
    switchIn: async ({ instance }) => instance.setActiveHeaderGroup('default'),
    onMouseLeftDown: onMouseLeftDown(),
    onMouseLeftUp: onMouseLeftUp()
  }),

  registerTool({
    annotClassName: `NotaryCertAnnotation`,
    toolName: `NotaryCertTool`,
    // buttonImage,
    buttonName: `NotaryCertTool`,
  }),


  // register the custom annot class to webviewer
  registerAnnotationType({ 
    elementName: 'cert', 
    annotClassName: 'NotaryCertAnnotation' 
  }),
  
  createInjectCertTool({
    toolName: 'AcknowledgementCertTool',
    type: 'acknowledgement',
    tooltip: 'Acknowledgement Cert',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/acknowledgement.pdf`
  }),
  createInjectCertTool({
    toolName: 'AcknowledgementCertWithMarkTool',
    type: 'acknowledgementWithMark',
    tooltip: 'Acknowledgement Cert (w/ mark)',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/acknowledgement_with_mark.pdf`,
  }),
  createInjectCertTool({
    toolName: 'AcknowledgementCertWithSigAffixedTool',
    type: 'acknowledgementWithSigAffixed',
    tooltip: 'Acknowledgement Cert (w/ sig affixed)',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/acknowledgement_sig_affixed.pdf`
  }),

  createInjectCertTool({
    toolName: 'JuratCertTool',
    type: 'jurat',
    tooltip: 'Jurat Cert',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/jurat.pdf`
  }),
  createInjectCertTool({
    toolName: 'JuratCertWithMarkTool',
    type: 'jurat',
    tooltip: 'Jurat Cert (w/ mark)',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/jurat_with_mark.pdf`
  }),
  createInjectCertTool({
    toolName: 'JuratCertPhysicallyUnableToSignTool',
    type: 'jurat',
    tooltip: 'Jurat Cert (physically unable to sign)',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/jurat_physically_unable_to_sign.pdf`
  }),

  createInjectCertTool({
    toolName: 'CertificationOfCopyByUsPassportHolder',
    type: 'certificationOfCopyByUSPassportHolder',
    tooltip: 'Certification Of Copy by US Passport Holder',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/certification_of_copy_by_us_passport_holder.pdf`
  }),
  createInjectCertTool({
    toolName: 'AffidavitOfTranslator',
    type: 'affidavitOfTranslator',
    tooltip: 'Affidavit Of Translator',
    pdfUrl: `https://storage.googleapis.com/enl-static-files/certs/affidavit_of_translator.pdf`
  }),
  createInjectCertTool({
    toolName: 'CertFile',
    type: 'file',
    icon: uploadIcon,
    tooltip: 'Upload PDF',
  }),

  injectTool('CertTool', {
    type: 'actionButton',
    img: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11.25 9.541l-2.25-2.182.929-.929 1.321 1.253 2.821-2.892.929.93-3.75 3.82zm7.676-3.819c-.482 1.41-.484 1.139 0 2.555.05.147.074.297.074.445 0 .449-.222.883-.615 1.156-1.256.87-1.09.651-1.562 2.067-.198.591-.77.99-1.415.99h-.003c-1.549-.005-1.28-.088-2.528.789-.262.184-.569.276-.877.276s-.615-.092-.876-.275c-1.249-.878-.98-.794-2.528-.789h-.004c-.645 0-1.216-.399-1.413-.99-.473-1.417-.311-1.198-1.562-2.067-.395-.274-.617-.708-.617-1.157 0-.148.024-.298.074-.444.483-1.411.484-1.139 0-2.555-.05-.147-.074-.297-.074-.445 0-.45.222-.883.616-1.157 1.251-.868 1.089-.648 1.562-2.067.197-.591.769-.99 1.413-.99h.004c1.545.005 1.271.095 2.528-.79.262-.183.569-.274.877-.274s.615.091.876.274c1.248.878.98.795 2.528.79h.003c.646 0 1.217.399 1.415.99.473 1.416.307 1.197 1.562 2.067.394.273.616.707.616 1.156 0 .148-.024.299-.074.445zm-2.176 1.278c0-2.623-2.127-4.75-4.75-4.75s-4.75 2.127-4.75 4.75 2.127 4.75 4.75 4.75 4.75-2.128 4.75-4.75zm-7.385 7.931c-.766 0-1.371-.074-1.873-.213-.308 3.068-1.359 5.37-3.492 7.592.854.107 1.95-.094 2.833-.56.317.636.65 1.43.767 2.25 2.009-2.299 3.266-5.054 3.734-8.071-.943-.181-1.234-.496-1.969-.998zm5.27 0c-.737.507-1.043.82-1.968.998.47 3.017 1.726 5.772 3.733 8.071.116-.82.449-1.614.767-2.25.883.465 1.979.667 2.833.56-2.13-2.219-3.168-4.531-3.479-7.595-.503.141-1.112.216-1.886.216z"></path></svg>`,
    title: 'Cert Tools',
    dataElement: 'certTools',
    onClick: ({ instance }) => () => instance.setActiveHeaderGroup('certToolsGroup')
  }),

  registerHeaderGroup({ 
    groupName: 'certToolsGroup',
    toolNames: [
      'AcknowledgementCertTool',
      'AcknowledgementCertWithMarkTool',
      'AcknowledgementCertWithSigAffixedTool',
      'JuratCertTool',
      'JuratCertWithMarkTool',
      'JuratCertPhysicallyUnableToSignTool',
      'CertificationOfCopyByUsPassportHolder',
      'CertFile',
    ]
  })
)

export default createStampAnnotTool;