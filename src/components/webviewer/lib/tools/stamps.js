import * as R from 'ramda';
import registerAnnotationType from "../initializers/registerAnnotationType";
import registerTool from "../initializers/registerTool";
import { setHeaderItems, injectHeaderItem, updateTool } from "../initializers/injectors";
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







const createNotaryCertAnnotation = R.pipeP(
  defineAnnotClass({
    className: 'NotaryCertAnnotation',
    baseClassName: 'StampAnnotation',
  }),
  defineToolClass({
    className: 'NotaryCertTool',
    annotClassName: 'NotaryCertAnnotation',
    baseClassName: 'GenericAnnotationCreateTool',
    onMouseLeftDown: onMouseLeftDown(),
    onMouseLeftUp: onMouseLeftUp({ imageUrl: '/imgs/stamp.png' })
  }),
  registerAnnotationType({ 
    elementName: 'stamp', 
    annotClassName: 'NotaryCertAnnotation' 
  }),
  registerTool({
    type: 'toolButton',
    toolName: 'NotaryCertTool',
    buttonImage: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-file-signature fa-w-18 fa-3x"><path fill="currentColor" d="M218.17 424.14c-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34c-6.37 12.78-25.03 11.37-29.48-2.09L144 386.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.75-16.19 54.06-9.7 66 14.16 1.89 3.78 5.49 5.95 9.36 6.26v-82.12l128-127.09V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-40l-128-.11c-16.12-.31-30.58-9.28-37.83-23.75zM384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zm-96 225.06V416h68.99l161.68-162.78-67.88-67.88L288 346.96zm280.54-179.63l-31.87-31.87c-9.94-9.94-26.07-9.94-36.01 0l-27.25 27.25 67.88 67.88 27.25-27.25c9.95-9.94 9.95-26.07 0-36.01z" class=""></path></svg>',
    dataElement: 'stampTool',
    tooltip: 'Notary Stamp',
    hidden: ['tablet', 'mobile'],
  }),
)



const createStampAnnotTool = R.pipeP(
  createNotaryCertAnnotation,
  injectHeaderItem({
    type: 'toolGroupButton',
    toolGroup: 'stampTools',
    img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-5x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
    dataElement: 'stampToolGroupButton',
    title: 'Stamps',
    hidden: ['tablet', 'mobile']
  }),
  setHeaderItems({ insertBefore: 'eraserToolButton' }),
  updateTool({ toolName: 'NotaryCertTool', buttonGroup: 'stampTools' })
)

export default createStampAnnotTool;