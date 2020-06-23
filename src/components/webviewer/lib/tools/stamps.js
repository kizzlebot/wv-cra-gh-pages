import * as R from 'ramda';
import registerAnnotationType from "../initializers/registerAnnotationType";
import registerTool from "../initializers/registerTool";
import { injectTool, registerHeaderGroup } from "../initializers/injectors";
import defineToolClass from '../initializers/defineToolClass';
import defineAnnotClass from '../initializers/defineAnnotClass';

const loadImg = async (url) => new Promise((res, rej) => {
  const img = new window.Image();

  img.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');

    context.drawImage(img, 0, 0);
    return res({ 
      dataUrl: canvas.toDataURL("image/png"),
      img
    });
  });
  img.src = url;
});


const onMouseLeftUp = ({ imageUrl }) => async ({ context, instance, ...rest }) => {
  let annotation;
  const inst = context.tool;
  instance.Tools.GenericAnnotationCreateTool.prototype.mouseLeftDown.call(inst, context.args[0]);

  if (inst.annotation) {
    const { dataUrl, img } = await loadImg(imageUrl);
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






export const createStampAnnotation = ({ name, imageUrl, buttonImage, tooltip }) => R.pipeP(
  // define annot class
  defineAnnotClass({
    className: `${name}Annotation`,
    baseClassName: 'StampAnnotation',
  }),

  // define tool class that uses annot class
  defineToolClass({
    className: `${name}Tool`,
    annotClassName: `${name}Annotation`,
    baseClassName: 'GenericAnnotationCreateTool',
    switchIn: async ({ instance }) => instance.setActiveHeaderGroup('default'),
    onMouseLeftDown: onMouseLeftDown(),
    onMouseLeftUp: onMouseLeftUp({ imageUrl })
  }),

  // register the custom annot class to webviewer
  registerAnnotationType({ 
    elementName: name, 
    annotClassName: `${name}Annotation` 
  }),
  
  registerTool({
    type: 'toolButton',
    toolName: `${name}Tool`,
    buttonImage,
    dataElement: name,
    tooltip,
    hidden: ['tablet', 'mobile'],
  }),
)



export const createNotaryStampAnnotation = createStampAnnotation({
  name: 'NotaryStamp',
  imageUrl: '/imgs/stamp.png',
  buttonImage: `/imgs/stamp.png`,
  tooltip: 'Notary Stamp'
})

export const defineAnnotTools = R.pipeP(createNotaryStampAnnotation);


const createStampAnnotTool = R.pipeP(
  createStampAnnotation({
    name: 'NotaryStamp',
    imageUrl: '/imgs/stamp.png',
    buttonImage: `/imgs/stamp.png`,
    tooltip: 'Notary Stamp'
  }),
  createStampAnnotation({
    name: 'NotarySeal',
    imageUrl: '/imgs/seal.png',
    buttonImage: `/imgs/seal.png`,
    tooltip: 'Notary Seal'
  }),
  injectTool('StampTools', {
    type: 'actionButton',
    img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-5x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
    title: 'Stamps',
    dataElement: 'stampToolGroupButton',
    onClick: ({ instance }) => () => instance.setActiveHeaderGroup('stampToolsGroup') ,
    hidden: ['tablet', 'mobile']
  }),
  registerHeaderGroup({ 
    groupName: 'stampToolsGroup',
    toolNames: [
      'NotaryStampTool',
      'NotarySealTool'
    ]
  })
)

export default createStampAnnotTool;