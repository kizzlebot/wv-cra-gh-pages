/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
// @ts-nocheck
((exports) => {

  const extendAnnotations = exports.extendAnnotations = (instance) => {
    const { PDFNet, docViewer, Annotations, Tools } = instance;
    const annotManager = docViewer.getAnnotationManager();
    const { createSignHereElement, draw } = Annotations.SignatureWidgetAnnotation.prototype;

    const { deserialize, serialize } = Annotations.Annotation.prototype;
    const rubberStampTool = instance.docViewer.getTool('AnnotationCreateRubberStamp');
    docViewer
      .getTool('AnnotationCreateFreeText')
      .setStyles({
        Font: 'Times New Roman',
        StrokeThickness: 0,
        StrokeColor: new Annotations.Color(0, 0, 0),
        TextColor: new Annotations.Color(0, 0, 0),
        FontSize: '20pt'
      });

    const sigTool = docViewer.getTool('AnnotationCreateSignature');

    //#region - from enl-fe, ignore

    Annotations.WidgetAnnotation.prototype.getMetadata = function getMetadata() {
      if (!this.getField) {
        return;
      }
      const [type, timestamp, id, author, signerId, name] = this.getField().name.split('.');
      return {
        id,
        type,
        timestamp,
        author,
        signerId,
        name
      };
    };

    Annotations.WidgetAnnotation.prototype.updateCustomData = async function (currentUser) {
      if (!this.getField) {
        return;
      }

      const [type, timestamp, id, author, signerId, name] = this.getField().name.split('.');
      this.CustomData = this.getMetadata();
      await Promise.all([
        this.setCustomData('type', type),
        this.setCustomData('timestamp', timestamp),
        this.setCustomData('id', id),
        this.setCustomData('author', author),
        this.setCustomData('signerId', signerId),
        this.setCustomData('name', name)
      ]);

      this.Author = signerId;

      return this.CustomData;
    };

    Annotations.WidgetAnnotation.prototype.updateReadOnly = function (userType, currentUser, locked) {
      if (!this.getField) {
        return;
      }

      const { type, timestamp, signerId, author, name, id } = this.getMetadata();


      // update readOnly flag based for this widget annotation on the currentUser
      // console.debug('updateReadOnly', currentUser, this.fieldFlags.get('ReadOnly'));
      if (userType === 'consumer' && locked) {
        return this.fieldFlags.set('ReadOnly', true);
      }

      if (userType === 'notary') {
        this.fieldFlags.set('ReadOnly', false);
      } else if (signerId === currentUser) {
        this.fieldFlags.set('ReadOnly', false);
      } else {
        this.fieldFlags.set('ReadOnly', true);
      }

      return {
        id,
        type,
        timestamp,
        author,
        signerId,
        name
      };
    };


    const { addSignature, saveSignatures, importSignatures, exportSignatures } = Tools.SignatureCreateTool.prototype;
    Tools.SignatureCreateTool.prototype.importSignatures = function (args) {
      return importSignatures.apply(this, arguments);
    };

    Tools.SignatureCreateTool.prototype.addSignature = function (args) {
      return addSignature.apply(this, arguments);
    };
    Tools.SignatureCreateTool.prototype.saveSignatures = function (args) {
      return saveSignatures.apply(this, arguments);
    };
    Tools.SignatureCreateTool.prototype.exportSignatures = function (args) {
      return exportSignatures.apply(this, arguments);
    };



    Annotations.SignatureWidgetAnnotation.prototype.createSignHereElement = function () {
      // signHereElement is the default one with dark blue background
      const signHereElement = createSignHereElement.apply(this, arguments);

      const { type, timestamp, id, author, signerId, name } = this.getMetadata();
      this.Author = signerId;

      // console.console.debug('this', { signerId, custom: this.custom, customdata: this.CustomData });
      this.setCustomData('id', id);
      this.setCustomData('type', type);
      this.setCustomData('timestamp', timestamp);
      this.setCustomData('name', name);
      this.setCustomData('author', annotManager.getCurrentUser());
      this.setCustomData('signerId', signerId);


      // dont show sign here dupes
      const signatures = _.filter(instance.annotManager.getAnnotationsList(), (annot) => annot instanceof Annotations.FreeHandAnnotation && annot.Subject === 'Signature');
      if (_.findIndex(signatures, (sig) => sig.CustomData.id === id) > -1) {
        signHereElement.style.backgroundColor = 'none';
        signHereElement.style.display = 'none';
        signHereElement.innerText = '';
        return signHereElement;
      }

      signHereElement.style.backgroundColor = 'red';
      signHereElement.innerText = `${_.capitalize(type)}: ${name}`;
      signHereElement.style.fontSize = '12px';
      return signHereElement;
    };

    const { createInnerElement } = Annotations.SignatureWidgetAnnotation.prototype;
    Annotations.SignatureWidgetAnnotation.prototype.createInnerElement = function () {
      const el = createInnerElement.apply(this, arguments);
      console.debug('create inner element', el);

      const signatureWidget = this;

      el.addEventListener('click', (e) => {
        console.debug('create inner element clicked', { signatureWidget, target: e.target });
        e.preventDefault();
        e.stopPropagation();


        const isReadOnly = signatureWidget.fieldFlags.get('ReadOnly');
        if (isReadOnly) {
          return;
        }


        instance.setToolMode('AnnotationCreateSignature');
        const signatureTool = docViewer.getTool('AnnotationCreateSignature');

        // trigger a click from the signature tool
        signatureTool.mouseLeftDown(e);
        signatureTool.mouseLeftUp(e);

        signatureTool.one('annotationAdded', async (signatureAnnot) => {
          signatureWidget.Custom = 'filled';
          // $(el).off('click');

          // positioning and scaling signature annotation to go inside widget
          const height = signatureWidget.Height;
          const width = signatureWidget.Width;
          const x = signatureWidget.getRect().x1;
          const y = signatureWidget.getRect().y1;

          let hScale = 1;
          let wScale = 1;
          hScale = height / signatureAnnot.Height;
          wScale = width / signatureAnnot.Width;
          const scale = Math.min(hScale, wScale);

          signatureAnnot.Width = width;
          signatureAnnot.Height = height;

          let h;
          let i;
          if (signatureAnnot.getPaths) {
            for (h = 0; h < signatureAnnot.getPaths().length; h++) {
              for (i = 0; i < signatureAnnot.getPaths()[h].length; i++) {
                signatureAnnot.getPaths()[h][i].x = (signatureAnnot.getPaths()[h][i].x - signatureAnnot.X) * scale + x;
                signatureAnnot.getPaths()[h][i].y = (signatureAnnot.getPaths()[h][i].y - signatureAnnot.Y) * scale + y;
              }
            }
          }

          signatureAnnot.X = x;
          signatureAnnot.Y = y;

          const annotManager = docViewer.getAnnotationManager();

          // delete any signatures that were added previously
          annotManager.getAnnotationsList().forEach((annot) => {
            if (annot !== signatureAnnot && annot instanceof Annotations.FreeHandAnnotation && annot.X === signatureAnnot.X && annot.Y === signatureAnnot.Y) {
              annotManager.deleteAnnotation(annot);
            }
          });

          annotManager.drawAnnotations(signatureAnnot.PageNumber);

          const [type, timestamp, id, author, signerId, name] = signatureWidget.getField().name.split('.');
          signatureAnnot.CustomData = signatureWidget.getMetadata();
          await Promise.all([
            signatureAnnot.setCustomData('id', id),
            signatureAnnot.setCustomData('type', type),
            signatureAnnot.setCustomData('timestamp', timestamp),
            signatureAnnot.setCustomData('author', author),
            signatureAnnot.setCustomData('signerId', signerId),
            signatureAnnot.setCustomData('name', name)
          ]);


          instance.setToolMode('AnnotationEdit');
        });
      });

      return el;
    };

  };


  /*
  * Creates tool for creating temporary boxes for widget annotations
  * for form fields, signature fields, and checkbox fields
  */
  const initCreator = (name, instance, getSigner = () => { }) => {
    const { Annotations, Tools, docViewer } = instance;
    const annotManager = instance.docViewer.getAnnotationManager();

    const createAnnotClass = (className, ClassDef) => {
      const C = ({
        [className]: class extends ClassDef {
          constructor(...args) {
            super(...args);

            this.Subject = className;
            if (this.setCustomData) {
              this.setCustomData('type', className);
            }
          }
        }
      })[className];

      Object.defineProperty(C, 'name', { value: className });
      return C;
    };

    const createToolClass = (className, RectAnnotClass) => {
      const C = class extends Tools.GenericAnnotationCreateTool {
        constructor(docViewer) {
          super(docViewer, RectAnnotClass);
          this.defaults.FillColor = new Annotations.Color(255, 141, 0, 0.5);
        }
      };

      Object.defineProperty(C, 'name', { value: className });

      C.prototype.mouseLeftDown = Tools.RectangleCreateTool.prototype.mouseLeftDown;
      C.prototype.mouseLeftUp = Tools.RectangleCreateTool.prototype.mouseLeftUp;
      return C;
    };

    const CustomFreeTextAnnot = createAnnotClass(`${name}FreeTextAnnot`, Annotations.FreeTextAnnotation);
    const CustomRectAnnot = createAnnotClass(`${name}RectAnnot`, Annotations.RectangleAnnotation);
    const CreateTool = createToolClass(`${name}CreateTool`, CustomRectAnnot);

    const createFreeText = async (rectAnnot, custom) => {
      const {
        type = _.toUpper(name),
        value = '',
        flag = false
      } = (custom || {});

      console.debug('type', type);
      const pageIndex = (rectAnnot.PageNumber) ? rectAnnot.PageNumber - 1 : docViewer.getCurrentPage() - 1;


      const zoom = docViewer.getZoom();
      const textAnnot = new CustomFreeTextAnnot();

      const rotation = docViewer.getCompleteRotation(pageIndex + 1) * 90;
      textAnnot.Rotation = rotation;
      textAnnot.X = rectAnnot.X;
      textAnnot.Y = rectAnnot.Y;
      textAnnot.Width = rectAnnot.Width;
      textAnnot.Height = rectAnnot.Height;
      textAnnot.setPadding(new Annotations.Rect(0, 0, 0, 0));

      // get currently selected signer.
      const signer = getSigner();


      textAnnot.custom = {
        type,
        value,
        flag,
        fieldType: type,
        signerId: signer.id,
        id: rectAnnot.Id,
        author: annotManager.getCurrentUser(),
        name: `${signer?.firstName ? signer.firstName : signer?.user?.firstName} ${signer?.lastName ? signer.lastName : signer?.user?.lastName}`
      };

      _.mapKeys(textAnnot.custom, (val, key) => textAnnot.setCustomData(key, (val || '').toString()));
      textAnnot.CustomData = textAnnot.custom;
      textAnnot.setContents(`${name}: ${textAnnot.custom.name}`);
      textAnnot.FontSize = `${15.0 / zoom}px`;
      textAnnot.FillColor = rectAnnot.FillColor;
      textAnnot.TextColor = new Annotations.Color(0, 0, 0);
      textAnnot.StrokeThickness = 1;
      textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
      textAnnot.TextAlign = 'center';
      textAnnot.PageNumber = rectAnnot.PageNumber || (pageIndex + 1);


      // TODO: Set the author here
      // textAnnot.Author = annotManager.getCurrentUser();
      await annotManager.deleteAnnotation(rectAnnot, true);
      await annotManager.addAnnotation(textAnnot, true);
      await annotManager.deselectAllAnnotations();
      await annotManager.redrawAnnotation(textAnnot);
      await annotManager.selectAnnotation(textAnnot);
    };


    const customSignatureTool = new CreateTool(docViewer);
    customSignatureTool.on('annotationAdded', (annot) => createFreeText(annot));

    return {
      tool: customSignatureTool,
      annot: CustomRectAnnot
    };
  };



  const configureFeatures = (instance, config = {}) => {
    const { features = [], fitMode } = config;

    const { FitMode } = instance;
    instance.setFitMode(FitMode[fitMode] || FitMode.FitWidth);

    instance.disableFeatures([
      ..._.pick(instance, features),
      // instance.Feature.TextSelection,
      // instance.Feature.NotesPanel,
      // instance.Feature.FilePicker,
      // instance.Feature.Redaction,
      // instance.Feature.Copy,
      // instance.Feature.Download,
      // instance.Feature.Print,
    ]);

    // instance.disableTools([
    //   'AnnotationCreatePolygon',
    //   'AnnotationCreateTextHighlight',
    //   'AnnotationCreateTextUnderline',
    // ]);

    // instance.disableElements([
    //   'stickyToolButton',
    //   'leftPanel',
    //   'freeHandToolGroupButton',
    //   'menuButton',
    //   'miscToolGroupButton',
    //   'leftPanelButton',
    //   'searchButton',
    //   'textToolGroupButton',
    //   'viewControlsButton',
    //   'linkButton',
    //   'shapeToolGroupButton',
    //   'eraserToolButton'
    // ]);

    return { instance }
  };

  //const configureHeader = /* eslint-disable max-len */
  /* eslint-disable react/display-name */

  const configureHeader = async (instance, opts) => {




    const {
      tool: customSignatureTool,
      annot: SignatureRectAnnot
    } = initCreator('Signature', instance, () => { });


    instance.registerTool({
      toolName: 'SignatureFieldTool',
      toolObject: customSignatureTool,
      buttonImage: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-signature fa-w-20 fa-xs"><path fill="currentColor" d="M623.2 192c-51.8 3.5-125.7 54.7-163.1 71.5-29.1 13.1-54.2 24.4-76.1 24.4-22.6 0-26-16.2-21.3-51.9 1.1-8 11.7-79.2-42.7-76.1-25.1 1.5-64.3 24.8-169.5 126L192 182.2c30.4-75.9-53.2-151.5-129.7-102.8L7.4 116.3C0 121-2.2 130.9 2.5 138.4l17.2 27c4.7 7.5 14.6 9.7 22.1 4.9l58-38.9c18.4-11.7 40.7 7.2 32.7 27.1L34.3 404.1C27.5 421 37 448 64 448c8.3 0 16.5-3.2 22.6-9.4 42.2-42.2 154.7-150.7 211.2-195.8-2.2 28.5-2.1 58.9 20.6 83.8 15.3 16.8 37.3 25.3 65.5 25.3 35.6 0 68-14.6 102.3-30 33-14.8 99-62.6 138.4-65.8 8.5-.7 15.2-7.3 15.2-15.8v-32.1c.2-9.1-7.5-16.8-16.6-16.2z" class=""></path></svg>',
      buttonName: 'signatureFieldTool',
      tooltip: 'Signature Field Tool',
    }, SignatureRectAnnot);


    // const selectedSignerTextEl = opts.getSelectedSignerHeader();



    const notaryBtns = [
      {
        type: 'toolGroupButton',
        toolName: 'SignatureFieldTool',
        toolGroup: 'formBuilderTools',
        // img: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.67 403.43"><defs><style>.cls-1{font-size:354.6px;fill:#231f20;font-family:TimesNewRomanPSMT, Times New Roman;}.cls-2{letter-spacing:-0.15em;}</style></defs><title>va-icon</title><text class="cls-1" transform="translate(0 294.69)"><tspan class="cls-2">V</tspan><tspan x="204.59" y="0">A</tspan></text></svg>',
        img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
        title: 'Form Field Tools',
        dataElement: 'formFieldTools',
        onClick: () => instance.setActiveHeaderGroup('formFieldGroup')
      },
    ];

    instance.updateTool('SignatureFieldTool', { buttonGroup: 'formBuilderTools' });

    instance.setHeaderItems((header) => {
      _.map(notaryBtns, (item) => {
        header.get('eraserToolButton').insertBefore(item);
      });

    });
    //#endregion

    return instance;
  };







  // window.addEventListener('viewerLoaded', async () => {
  window.addEventListener('viewerLoaded', async () => {
    const { docViewer } = readerControl;
    const { Annotations, Tools, PDFNet } = exports;
    const annotManager = docViewer.getAnnotationManager();

    console.log('custom file loaded', { PDFNet, Tools, annotManager, readerControl, Annotations, version: exports })



    await extendAnnotations({
      ...readerControl,
      Annotations,
      Tools,
      PDFNet,
      annotManager
    });

    await configureHeader({
      ...readerControl,
      Annotations,
      Tools,
      PDFNet,
      annotManager
    }, {});

    const custom = JSON.parse(readerControl.getCustomData()) || {};
    console.log('finished config', custom)
    await configureFeatures(instance, custom)

    return docViewer.trigger('ready');
    // const { features = [], tools = [], elements = [] } = _.get(custom, 'disable', {});

    // const { Feature } = readerControl;
    // const feats = _.pick(Feature, features);
    // instance.disableFeatures([
    //   ...features
    // ]);

    // await readerControl.disableTools(tools);
    // await readerControl.disableElements(elements);
  });
})(window);
