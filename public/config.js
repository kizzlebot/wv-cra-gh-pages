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
      console.debug('updateReadOnly', currentUser, this.fieldFlags.get('ReadOnly'));
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
  
    Tools.Tool.prototype.contextMenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.console.debug('context menu', e);
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
  
  
    Annotations.Annotation.prototype.serialize = function () {
      const el = serialize.apply(this, arguments);
      console.debug('serializing annotation', this, el);
      if (this.myCustomAttribute) {
        el.setAttribute('attribute-name', this.myCustomAttribute);
      }
      return el;
    };
  
    Annotations.Annotation.prototype.deserialize = function (el) {
      console.debug('deserializing annotation', this, el);
      deserialize.apply(this, arguments);
      this.myCustomAttribute = el.getAttribute('attribute-name');
      return el;
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

    console.log('finished extending')
  };


  /*
  * Creates tool for creating temporary boxes for widget annotations
  * for form fields, signature fields, and checkbox fields
  */
  const initCreator = (name, instance, getSigner = () => {}) => {
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



  //const configureHeader = /* eslint-disable max-len */
  /* eslint-disable react/display-name */

  const configureHeader = async (instance, opts) => {
    const { FitMode } = instance;
    instance.setFitMode(FitMode.FitWidth);

    instance.disableFeatures([
      instance.Feature.TextSelection,
      instance.Feature.NotesPanel,
      instance.Feature.FilePicker,
      instance.Feature.Redaction,
      instance.Feature.Copy,
      instance.Feature.Download,
      instance.Feature.Print,
    ]);

    instance.disableTools([
      'AnnotationCreatePolygon',
      'AnnotationCreateTextHighlight',
      'AnnotationCreateTextUnderline',
    ]);

    instance.disableElements([
      'stickyToolButton',
      'leftPanel',
      'freeHandToolGroupButton',
      'menuButton',
      'miscToolGroupButton',
      'leftPanelButton',
      'searchButton',
      'textToolGroupButton',
      'viewControlsButton',
      'linkButton',
      'shapeToolGroupButton',
      'eraserToolButton'
    ]);

    await registerCustomTools(instance, opts);

    const selectedSignerTextEl = opts.getSelectedSignerHeader();
    const consumerBtns = [{
      type: 'customElement',
      render: () => selectedSignerTextEl,
      dataElement: 'selectSignerText',
      element: 'selectSignerText'
    }];


    const customInputs = [{
      type: 'customElement',
      dataElement: 'lockUi',
      render: () => {
        const div = document.createElement('div');
        div.setAttribute('style', 'padding-right: 5px');
        const input = document.createElement('input');
        const label = document.createElement('label');
        label.innerText = 'Lock';
        input.id = 'lock';
        input.addEventListener('change', (evt) => docViewer.trigger('onLockChange', evt.target.value));
        div.appendChild(input);
        div.appendChild(label);
        return div;
      }
    }, 
    // {
    //     type: 'customElement',
    //     render: () => opts.getSelSignerHeader(),
    //     dataElement: 'selectSigner',
    //     element: 'selectSigner'
    // }
  ];

    const certButton = {
      type: 'statefulButton',
      initialState: 'NotActive',
      states: {
        NotActive: {
          title: 'Certs',
          img: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11.25 9.541l-2.25-2.182.929-.929 1.321 1.253 2.821-2.892.929.93-3.75 3.82zm7.676-3.819c-.482 1.41-.484 1.139 0 2.555.05.147.074.297.074.445 0 .449-.222.883-.615 1.156-1.256.87-1.09.651-1.562 2.067-.198.591-.77.99-1.415.99h-.003c-1.549-.005-1.28-.088-2.528.789-.262.184-.569.276-.877.276s-.615-.092-.876-.275c-1.249-.878-.98-.794-2.528-.789h-.004c-.645 0-1.216-.399-1.413-.99-.473-1.417-.311-1.198-1.562-2.067-.395-.274-.617-.708-.617-1.157 0-.148.024-.298.074-.444.483-1.411.484-1.139 0-2.555-.05-.147-.074-.297-.074-.445 0-.45.222-.883.616-1.157 1.251-.868 1.089-.648 1.562-2.067.197-.591.769-.99 1.413-.99h.004c1.545.005 1.271.095 2.528-.79.262-.183.569-.274.877-.274s.615.091.876.274c1.248.878.98.795 2.528.79h.003c.646 0 1.217.399 1.415.99.473 1.416.307 1.197 1.562 2.067.394.273.616.707.616 1.156 0 .148-.024.299-.074.445zm-2.176 1.278c0-2.623-2.127-4.75-4.75-4.75s-4.75 2.127-4.75 4.75 2.127 4.75 4.75 4.75 4.75-2.128 4.75-4.75zm-7.385 7.931c-.766 0-1.371-.074-1.873-.213-.308 3.068-1.359 5.37-3.492 7.592.854.107 1.95-.094 2.833-.56.317.636.65 1.43.767 2.25 2.009-2.299 3.266-5.054 3.734-8.071-.943-.181-1.234-.496-1.969-.998zm5.27 0c-.737.507-1.043.82-1.968.998.47 3.017 1.726 5.772 3.733 8.071.116-.82.449-1.614.767-2.25.883.465 1.979.667 2.833.56-2.13-2.219-3.168-4.531-3.479-7.595-.503.141-1.112.216-1.886.216z"/></svg>',
          onClick: async (update, activeState) => {
            update('Active');
            await instance.setActiveHeaderGroup('certGroup');
          }
        },
        Active: {
          title: 'Go back',
          img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="undo" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-undo fa-w-16 fa-3x"><path fill="currentColor" d="M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z" class=""></path></svg>',
          onClick: async (update, activeState) => {
            update('NotActive');
            await instance.setActiveHeaderGroup('default');
          }
        }
      },
      mount: (update) => {
        // Checkout https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html to see more APIs and events with docViewer
        // We want to update this button when page number changes so it can have the correct content;
        instance.annotManager.on('certModalDismissed', () => {
          update('NotActive');
        });
      },
      title: 'Certs',
      dataElement: 'countButton'
    };


    const vaButton = {
      type: 'statefulButton',
      initialState: 'NotActive',
      states: {
        NotActive: {
          title: 'VA Disclaimer',
          img: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.67 403.43"><defs><style>.cls-1{font-size:354.6px;fill:#231f20;font-family:TimesNewRomanPSMT, Times New Roman;}.cls-2{letter-spacing:-0.15em;}</style></defs><title>va-icon</title><text class="cls-1" transform="translate(0 294.69)"><tspan class="cls-2">V</tspan><tspan x="204.59" y="0">A</tspan></text></svg>',
          onClick: async (update, activeState) => {
            docViewer.trigger('onShowVaDisclaimerClick')
          }
        },
        Active: {
          title: 'VA Disclaimer (Open)',
          getContent: () => 'VA Open'
        }
      },
      mount: (update) => {
        // Checkout https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html to see more APIs and events with docViewer
        // We want to update this button when page number changes so it can have the correct content;
        instance.annotManager.on('vaModalDismissed', () => {
          update('NotActive');
        });
        instance.annotManager.on('vaModalOpen', () => {
          update('Active');
        });
      },
      title: 'VA Disclaimer',
      dataElement: 'vaDisclaimer'
    };


    const deleteBtn = {
      type: 'toolButton',
      dataElement: 'deleteTool',
      toolName: 'deleteTool',
    };

    const notaryBtns = [
      ...customInputs,
      { type: 'divider' },
      {
        type: 'actionButton',
        img: '<svg aria-hidden=\'true\' focusable=\'false\' data-prefix=\'fas\' data-icon=\'plus\' role=\'img\' xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 448 512\' className=\'svg-inline--fa fa-plus fa-w-14 fa-5x\'><path fill=\'currentColor\' d=\'M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z\' className=\'\' /></svg>',
        title: 'Add Blank Page',
        dataElement: 'addPage',
        onClick: async () => docViewer.trigger('onBlankPageAdded')
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-minus fa-w-14 fa-3x"><path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>',
        title: 'Remove Page',
        dataElement: 'removePage',
        onClick: async () => docViewer.trigger('onBlankPageRemoved')
      },

      { type: 'divider' },
      certButton,
      {
        type: 'actionButton',
        // img: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.67 403.43"><defs><style>.cls-1{font-size:354.6px;fill:#231f20;font-family:TimesNewRomanPSMT, Times New Roman;}.cls-2{letter-spacing:-0.15em;}</style></defs><title>va-icon</title><text class="cls-1" transform="translate(0 294.69)"><tspan class="cls-2">V</tspan><tspan x="204.59" y="0">A</tspan></text></svg>',
        img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
        title: 'Form Field Tools',
        dataElement: 'formFieldTools',
        onClick: () => instance.setActiveHeaderGroup('formFieldGroup')
      },

      { type: 'divider' },
      {
        type: 'toolGroupButton',
        toolGroup: 'certTools',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-5x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        dataElement: 'certToolGroupButton',
        title: 'Certs/Stamps',
        hidden: ['tablet', 'mobile']
      },
      { type: 'divider' },
      vaButton,
    ];

    instance.registerHeaderGroup('formFieldGroup', [
      { type: 'spacer' },
      ...customInputs,
      { type: 'divider' },
      {
        type: 'toolButton',
        toolName: 'SignatureFieldTool',
        dataElement: 'signatureFieldTool',
        hidden: ['tablet', 'mobile'],
      },
      {
        type: 'toolButton',
        toolName: 'InitialsFieldTool',
        dataElement: 'initialsFieldTool',
        hidden: ['tablet', 'mobile'],
      },
      // {
      //   type: 'toolButton',
      //   toolName: 'CheckboxFieldTool',
      //   dataElement: 'checkboxFieldTool',
      //   hidden: ['tablet', 'mobile'],
      // },
      // {
      //   type: 'toolButton',
      //   toolName: 'FormFieldTool',
      //   dataElement: 'formFieldTool',
      //   hidden: ['tablet', 'mobile'],
      // },
      {
        type: 'toolButton',
        toolName: 'ApplySigFieldTool',
        dataElement: 'applySigFieldTool',
        hidden: ['tablet', 'mobile'],
      },
    ]);



    const onShowCertModal = (name, file) => () => docViewer.trigger('onShowCertModal', {
      name,
      file
    });





    instance.registerHeaderGroup('certGroup', [
      { type: 'spacer' },
      ...customInputs,
      { type: 'divider' },
      certButton,
      { type: 'divider' },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Acknowledgement', 'acknowledgement.pdf'),
        dataElement: 'ackcertButton',
        title: 'Acknowledgement',
        hidden: ['mobile']
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Acknowledgement With Mark', 'acknowledgement_with_mark.pdf'),
        dataElement: 'ackwithmarkcertButton',
        title: 'Acknowledgement With Mark',
        hidden: ['mobile']
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Acknowledgment Signature Affixed By Notary', 'acknowledgement_sig_affixed.pdf'),
        dataElement: 'acksigaffixedcertButton',
        title: 'Acknowledgment Signature Affixed By Notary',
        hidden: ['mobile']
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Affidavit of Translator', 'affidavit_of_translator.pdf'),
        dataElement: 'affidavitcertButton',
        title: 'Affidavit of Translator',
        hidden: ['mobile']
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Certification of Copy By US passport holder', 'certification_of_copy_by_us_passport_holder.pdf'),
        dataElement: 'passportholdercertButton',
        title: 'Certification of Copy by US Passport holder',
        hidden: ['mobile']
      },

      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Jurat', 'jurat.pdf'),
        dataElement: 'juratcertButton',
        title: 'Jurat',
        hidden: ['mobile']
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Jurat Signature Affixed By Notary', 'jurat_physically_unable_to_sign.pdf'),
        dataElement: 'juratphysicallycertButton',
        title: 'Jurat Signature Affixed By Notary',
        hidden: ['mobile']
      },
      {
        type: 'actionButton',
        img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-certificate" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-file-certificate fa-w-16 fa-3x"><path fill="currentColor" d="M504.99 105.01l-97.9-98c-7.71-7.71-16-7-23.1-7v128h128c0-7.53.64-15.35-7-23zm-153 31V.01H152c-13.3 0-24 10.7-24 24V133c18.3-5 19.58-5 26.45-5 16.23 0 32.1 6.67 43.53 18.3 8.72 9.59 4.41 6.98 18.28 10.76 21.07 5.75 37.64 22.53 43.23 43.8 3.11 13.2.6 8.66 10.75 18.99 15.25 15.51 21.26 38.26 15.7 59.36-3.75 13.23-3.71 8.01 0 22.12 5.57 21.11-.45 43.85-15.69 59.37-9.64 9.36-7.04 4.88-10.75 18.99-4.89 18.59-18.16 33.75-35.5 41.12V512h263.99c13.3 0 24-10.7 24-24V160.01h-136c-13.2 0-24-10.8-24-24zM247.42 338.28c7.4-7.53 10.29-18.5 7.58-28.79-5.43-20.65-5.44-17.74 0-38.42 2.71-10.28-.18-21.26-7.58-28.79-14.86-15.12-13.43-12.61-18.87-33.27-2.71-10.28-10.6-18.32-20.71-21.07-20.28-5.53-17.84-4.1-32.69-19.21-7.4-7.53-18.18-10.47-28.28-7.71-20.32 5.54-17.46 5.53-37.75 0-10.1-2.76-20.88.19-28.28 7.71-14.91 15.18-12.5 13.7-32.69 19.21-10.11 2.76-18 10.79-20.71 21.07-5.46 20.74-4 18.13-18.87 33.27-7.4 7.53-10.29 18.5-7.58 28.79 5.45 20.71 5.42 17.79 0 38.41-2.71 10.28.18 21.26 7.58 28.79 14.85 15.11 13.43 12.61 18.87 33.27 2.71 10.28 10.6 18.32 20.71 21.07 14.31 3.9 11.52 2.97 15.84 5V512l64-32 64 32V397.62c4.31-2.02 1.52-1.1 15.84-5 10.11-2.76 18-10.79 20.71-21.07 5.47-20.74 4.01-18.13 18.88-33.27zM128 352.01c-35.34 0-64-28.65-64-64s28.66-64 64-64 64 28.65 64 64-28.66 64-64 64z" class=""></path></svg>',
        onClick: onShowCertModal('Jurat With Mark', 'jurat_with_mark.pdf'),
        dataElement: 'juratwithmarkcertButton',
        title: 'Jurat With Mark',
        hidden: ['mobile']
      },
    ]);


    instance.updateTool('NotarySealTool', { buttonGroup: 'certTools' });
    instance.updateTool('NotaryStampTool', { buttonGroup: 'certTools' });

    // instance.updateTool('ApplySigFieldTool', { buttonGroup: 'formBuilderTools' });
    instance.updateTool('InitialsFieldTool', { buttonGroup: 'formBuilderTools' });
    instance.updateTool('SignatureFieldTool', { buttonGroup: 'formBuilderTools' });
    instance.updateTool('CheckboxFieldTool', { buttonGroup: 'formBuilderTools' });
    instance.updateTool('FormFieldTool', { buttonGroup: 'formBuilderTools' });

    instance.setHeaderItems((header) => {
      _.map(opts.userType === 'consumer' ? consumerBtns : notaryBtns, (item) => {
        header.get('eraserToolButton').insertBefore(item);
      });

      header.get('selectToolButton').insertAfter(deleteBtn);
    });
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

    // const custom = JSON.parse(readerControl.getCustomData()) || {};
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
