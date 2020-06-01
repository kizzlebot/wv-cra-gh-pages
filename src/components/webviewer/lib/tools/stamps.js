import * as R from 'ramda';
import registerAnnotationType from "../initializers/registerAnnotationType";
import registerTool from "../initializers/registerTool";

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




const createStampTool = (options) => async ({ instance, tools, header, ...rest }) => {
  const { Annotations, Tools, docViewer } = instance;

  class NotaryCertAnnotation extends Annotations.StampAnnotation {
    constructor(...args) {
      super(...args);
      console.debug('args', args);
    }

    draw(ctx, pageMatrix) {
      super.draw(ctx, pageMatrix);
    }
  }

  class StampCreateTool extends Tools.GenericAnnotationCreateTool {
    constructor(docViewer) {
      super(docViewer, NotaryCertAnnotation);
      delete this.defaults.StrokeColor;
      delete this.defaults.FillColor;
      delete this.defaults.StrokeThickness;
    }

    mouseLeftDown(e) {
      const am = instance.docViewer.getAnnotationManager();
      const annot = am.getAnnotationByMouseEvent(e);
      if (annot) {
        return;
      }
      Tools.AnnotationSelectTool.prototype.mouseLeftDown.apply(this, [e]);
    }

    mouseMove(...args) {
      Tools.AnnotationSelectTool.prototype.mouseMove.apply(this, args);
    }

    async mouseLeftUp(e) {
      let annotation;

      Tools.GenericAnnotationCreateTool.prototype.mouseLeftDown.call(this, e);

      if (this.annotation) {
        const { dataUrl, img } = await loadImg(options.imageUrl);
        console.log('img.dataurl', { img, dataUrl })
        if (!dataUrl) {
          return;
        }
        this.aspectRatio = img.width / img.height;
        let width = 300;

        let height = width / this.aspectRatio;

        const rotation = this.docViewer.getCompleteRotation(this.annotation.PageNumber) * 90;
        this.annotation.Rotation = rotation;

        if (rotation === 270 || rotation === 90) {
          const t = height;
          height = width;
          width = t;
        }

        this.annotation.ImageData = dataUrl;
        this.annotation.Width = width;
        this.annotation.Height = height;
        this.annotation.X -= width / 2;
        this.annotation.Y -= height / 2;

        annotation = this.annotation;
      }

      Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(this, e);

      if (annotation) {
        const annotManager = instance.docViewer.getAnnotationManager();
        annotManager.deselectAllAnnotations();
        annotManager.redrawAnnotation(annotation);
        annotManager.selectAnnotation(annotation);
        instance.setToolMode('AnnotationEdit');
      }
    }
  }


  const customStampTool = new StampCreateTool(docViewer);

  return {
    ...rest,
    instance,
    tools: [...tools, customStampTool],
    header,
    toolObject: customStampTool,
    annotClass: NotaryCertAnnotation,
  };
}

const createStampAnnotTool = R.pipeP(
  createStampTool({
    imageUrl: '/imgs/stamp.png'
  }),
  registerAnnotationType({ elementName: 'stamp' }),
  registerTool({
    type: 'toolButton',
    toolName: 'NotaryStampTool',
    buttonImage: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-file-signature fa-w-18 fa-3x"><path fill="currentColor" d="M218.17 424.14c-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34c-6.37 12.78-25.03 11.37-29.48-2.09L144 386.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.75-16.19 54.06-9.7 66 14.16 1.89 3.78 5.49 5.95 9.36 6.26v-82.12l128-127.09V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-40l-128-.11c-16.12-.31-30.58-9.28-37.83-23.75zM384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zm-96 225.06V416h68.99l161.68-162.78-67.88-67.88L288 346.96zm280.54-179.63l-31.87-31.87c-9.94-9.94-26.07-9.94-36.01 0l-27.25 27.25 67.88 67.88 27.25-27.25c9.95-9.94 9.95-26.07 0-36.01z" class=""></path></svg>',
    dataElement: 'stampTool',
    hidden: ['tablet', 'mobile'],
  })
)

export default createStampAnnotTool;