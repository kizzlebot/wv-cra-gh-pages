// @ts-nocheck
const sigToolIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-signature fa-w-20 fa-xs"><path fill="currentColor" d="M623.2 192c-51.8 3.5-125.7 54.7-163.1 71.5-29.1 13.1-54.2 24.4-76.1 24.4-22.6 0-26-16.2-21.3-51.9 1.1-8 11.7-79.2-42.7-76.1-25.1 1.5-64.3 24.8-169.5 126L192 182.2c30.4-75.9-53.2-151.5-129.7-102.8L7.4 116.3C0 121-2.2 130.9 2.5 138.4l17.2 27c4.7 7.5 14.6 9.7 22.1 4.9l58-38.9c18.4-11.7 40.7 7.2 32.7 27.1L34.3 404.1C27.5 421 37 448 64 448c8.3 0 16.5-3.2 22.6-9.4 42.2-42.2 154.7-150.7 211.2-195.8-2.2 28.5-2.1 58.9 20.6 83.8 15.3 16.8 37.3 25.3 65.5 25.3 35.6 0 68-14.6 102.3-30 33-14.8 99-62.6 138.4-65.8 8.5-.7 15.2-7.3 15.2-15.8v-32.1c.2-9.1-7.5-16.8-16.6-16.2z" class=""></path></svg>';
const initialsToolIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-signature fa-w-20 fa-xs"><path fill="currentColor" d="M623.2 192c-51.8 3.5-125.7 54.7-163.1 71.5-29.1 13.1-54.2 24.4-76.1 24.4-22.6 0-26-16.2-21.3-51.9 1.1-8 11.7-79.2-42.7-76.1-25.1 1.5-64.3 24.8-169.5 126L192 182.2c30.4-75.9-53.2-151.5-129.7-102.8L7.4 116.3C0 121-2.2 130.9 2.5 138.4l17.2 27c4.7 7.5 14.6 9.7 22.1 4.9l58-38.9c18.4-11.7 40.7 7.2 32.7 27.1L34.3 404.1C27.5 421 37 448 64 448c8.3 0 16.5-3.2 22.6-9.4 42.2-42.2 154.7-150.7 211.2-195.8-2.2 28.5-2.1 58.9 20.6 83.8 15.3 16.8 37.3 25.3 65.5 25.3 35.6 0 68-14.6 102.3-30 33-14.8 99-62.6 138.4-65.8 8.5-.7 15.2-7.3 15.2-15.8v-32.1c.2-9.1-7.5-16.8-16.6-16.2z" class=""></path></svg>';
const addressTemplateIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="address-card" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-address-card fa-w-18 fa-3x"><path fill="currentColor" d="M528 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-352 96c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm112 236.8c0 10.6-10 19.2-22.4 19.2H86.4C74 384 64 375.4 64 364.8v-19.2c0-31.8 30.1-57.6 67.2-57.6h5c12.3 5.1 25.7 8 39.8 8s27.6-2.9 39.8-8h5c37.1 0 67.2 25.8 67.2 57.6v19.2zM512 312c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16z" class=""></path></svg>`;

((exports) => {

  const { Promise, R, _ } = exports.getExternalLibs()


  const parseName = (user) => {
    const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
    const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));
    return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
  }
  const toInitials = R.pipe(
    R.split(' '),
    R.map(R.pipe(R.head, R.toUpper)),
    R.join('')
  );


  const extendAnnotations = (instance) => {
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
      const CustomData = this.getMetadata();
      console.table(CustomData)
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


    Annotations.SignatureWidgetAnnotation.prototype.updateVisibility = function () {
      const { type, timestamp, id, author, signerId, name } = this.getMetadata();
      const annots = annotManager.getAnnotationsList();
      this.updateCustomData();
      this.setCustomData(this.getMetadata());
      const dup = _.find(annots, (annot) => (annot.Id !== this.Id && annot.CustomData.id === id && annot.hidden === false));


      if (dup) {
        this.hidden = true;
        this.innerElement.children[0].children[0].style.display = 'none';
      } else {
        this.innerElement.children[0].children[0].style.display = '';
        this.hidden = false;
      }

    }

    Annotations.SignatureWidgetAnnotation.prototype.createSignHereElement = function () {
      // signHereElement is the default one with dark blue background
      const signHereElement = createSignHereElement.apply(this, arguments);

      const { type, timestamp, id, author, signerId, name } = this.getMetadata();


      // if double import, then don't show it.
      const annots = annotManager.getAnnotationsList();
      this.updateCustomData();
      this.setCustomData(this.getMetadata());
      const dup = _.find(annots, (annot) => (annot.Id !== this.Id && annot.CustomData.id === id && annot.hidden === false));

      if (dup) {
        this.hidden = true;
        // signHereElement.style.backgroundColor = 'none';
        // signHereElement.style.display = 'none';
        // signHereElement.innerText = '';
        return signHereElement;
      } else {
        this.hidden = false;
      }


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
        // signHereElement.style.backgroundColor = 'none';
        // signHereElement.style.display = 'none';
        // signHereElement.innerText = '';
        return signHereElement;
      }

      signHereElement.style.backgroundColor = 'red';
      signHereElement.innerText = `${_.capitalize(type)}: ${name}`;
      signHereElement.style.fontSize = '12px';
      return signHereElement;
    };

    const { createInnerElement } = Annotations.SignatureWidgetAnnotation.prototype;

    Annotations.SignatureWidgetAnnotation.prototype.createInnerElement = function () {
      console.debug('create inner element args', arguments);
      const el = createInnerElement.apply(this, arguments);

      const signatureWidget = this;
      this.setCustomData(this.getMetadata());

      const handleClick = (e) => {
        console.debug('create inner element clicked', { signatureWidget, target: e.target });
        e.preventDefault();
        e.stopPropagation();

        if (signatureWidget.Custom === 'filled') {
          return;
        }

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
          el.removeEventListener('click', handleClick);

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
            signatureAnnot.setCustomData('refId', id),
            signatureAnnot.setCustomData('type', type),
            signatureAnnot.setCustomData('timestamp', timestamp),
            signatureAnnot.setCustomData('author', author),
            signatureAnnot.setCustomData('signerId', signerId),
            signatureAnnot.setCustomData('name', name)
          ]);


          instance.setToolMode('AnnotationEdit');
        });
      }
      el.addEventListener('click', handleClick);

      return el;
    };
  };














  const configureCustomTool = (instance, {
    type, 
    name,
    label,
    icon
  }) => {
    const { Annotations, Tools, docViewer } = instance;

    // create a placeholder which will then be converted to template field 
    const initCreator = () => {
      const annotManager = instance.docViewer.getAnnotationManager();

      const createAnnotClass = (className, ClassDef) => {
        const C = ({
          [className]: class extends ClassDef {
            constructor(...args) {
              super(...args);

              this.Subject = className;
              this.MaintainAspectRatio = true;
              const currSigner = exports.getSigner();
              const signers = exports.getSigners();

              console.log('signers', signers);
              const signer = _.find(signers, { id: currSigner });

              this.FillColor = signer.color;

              console.log('signer.color', this.FillColor);

              if (this.setCustomData) {
                this.setCustomData('type', className);
              }
            }
          }
        })[className];

        Object.defineProperty(C, 'name', { value: className });
        return C;
      };

      // convert rectangle into free text annotation
      const createFreeText = async (rectAnnot, custom) => {
        const {
          type = _.toUpper(name),
          value = '',
          flag = false
        } = (custom || {});

        console.debug('this type type', type);
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
        const signers = exports.getSigners();
        const signer = _.find(signers, { id: exports.getSigner() });
        if (!signer) {
          return;
        }


        textAnnot.custom = {
          type,
          value,
          flag,
          fieldType: type,
          signerId: signer.id,
          id: rectAnnot.Id,
          author: annotManager.getCurrentUser(),
          name: parseName(signer),
        };

        _.mapKeys(textAnnot.custom, (val, key) => textAnnot.setCustomData(key, (val || '').toString()));
        textAnnot.CustomData = textAnnot.custom;
        textAnnot.setContents(`${label}: ${textAnnot.custom.name}`);
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



      const createToolClass = (className, RectAnnotClass) => {
        class TemplateRectangle extends Annotations.RectangleAnnotation {
          constructor(...args) {
            super(...args);

            this.Subject = className;
            this.MaintainAspectRatio = true;


            if (this.setCustomData) {
              this.setCustomData('type', className);
            }
          }
        }



        class TemplateAnnotationTool extends Tools.GenericAnnotationCreateTool {
          constructor(docViewer) {
            super(docViewer, TemplateRectangle);
            this.on('annotationAdded', (annot) => {
              createFreeText(annot);
            });
          }

          switchIn(...args){
            super.switchIn(...args);

            const currSigner = exports.getSigner();
            const signers = exports.getSigners();
            const signer = _.find(signers, { id: currSigner });
            this.defaults.FillColor = signer.color;
          }
        };

        Object.defineProperty(TemplateAnnotationTool, 'name', { value: className });

        // TemplateAnnotationTool.prototype.mouseLeftDown = Tools.RectangleCreateTool.prototype.mouseLeftDown;
        TemplateAnnotationTool.prototype.mouseLeftUp = Tools.RectangleCreateTool.prototype.mouseLeftUp;
        return TemplateAnnotationTool;
      };




      
      const CustomFreeTextAnnot = createAnnotClass(`${name}FreeTextAnnot`, Annotations.FreeTextAnnotation);
      const CustomRectAnnot = createAnnotClass(`${name}RectAnnot`, Annotations.RectangleAnnotation);
      const CreateTool = createToolClass(`${name}CreateTool`, CustomRectAnnot);





      const customSignatureTool = new CreateTool(docViewer);
      // customSignatureTool.on('annotationAdded', (annot) => createFreeText(annot));

      return {
        tool: customSignatureTool,
        annot: CustomRectAnnot,
        textAnnot: CustomFreeTextAnnot
      };
    }

    const createSignatureTool = async () => {
      const {
        tool,
        annot,
        textAnnot
      } = initCreator();

      const dataElement = `${_.lowerFirst(type)}FieldTool`;
      const toolName = `${type}FieldTool`;

      instance.registerTool({
        toolName: `${type}FieldTool`,
        toolObject: tool,
        buttonImage: icon,
        buttonName: dataElement,
        tooltip: `${type} Field Tool`,
      }, annot);

      return {
        annot,
        textAnnot,
        tool,
        button: {
          type: 'toolButton',
          toolName,
          dataElement,
          hidden: ['tablet', 'mobile'],
        }
      }
    }


    return createSignatureTool();
  }









  const configureHeader = async (instance, opts) => {


    // create signature placeholder which will then be converted to signature field when createApplySigConvert is called
    const initCreator = (name, instance) => {
      const { Annotations, Tools, docViewer } = instance;
      const annotManager = instance.docViewer.getAnnotationManager();

      const createAnnotClass = (className, ClassDef) => {
        const C = ({
          [className]: class extends ClassDef {
            constructor(...args) {
              super(...args);

              this.Subject = className;
              this.MaintainAspectRatio = true;

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
        const signers = exports.getSigners();
        const signer = _.find(signers, { id: exports.getSigner() });
        if (!signer) {
          return;
        }


        textAnnot.custom = {
          type,
          value,
          flag,
          fieldType: type,
          signerId: signer.id,
          id: rectAnnot.Id,
          author: annotManager.getCurrentUser(),
          name: parseName(signer),
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
        annot: CustomRectAnnot,
        textAnnot: CustomFreeTextAnnot
      };
    }

    const createApplySigConvert = async (instance, viewerWindow) => {
      const { PDFNet, docViewer, Annotations, Tools } = instance;
      const annotManager = instance.docViewer.getAnnotationManager();

      Annotations.WidgetAnnotation.getCustomStyles = function (widget) {
        if (widget instanceof Annotations.TextWidgetAnnotation) {
          return {
            'background-color': '#a5c7ff',
            color: 'white',
            'font-size': '20px'
          };
        }

        if (widget instanceof Annotations.SignatureWidgetAnnotation) {
          return {
            border: '0px solid #000'
          };
        }
      };

      const customTypes = [
        'SIGNATURE',
        'INITIALS',
        'CHECKBOX',
        'FORM',
        'CHECK',
        'TEXT'
      ];

      const importXfdf = async instance => {

        const currentDocument = docViewer.getDocument();
        const pdfDoc = await currentDocument.getPDFDoc();

        // import newly created form fields

        const fdfDoc = await pdfDoc.fdfExtract(PDFNet.PDFDoc.ExtractFlag.e_both);
        const xfdf = await fdfDoc.saveAsXFDFAsString();
        const currAnnots = _.filter(
          await annotManager.getAnnotationsList(),
          el => el instanceof Annotations.WidgetAnnotation
        );
        const parser = new window.DOMParser();
        const xmlDoc = parser.parseFromString(xfdf, 'text/xml');
        xmlDoc.querySelector('annots').remove();
        const finalXfdf = xmlDoc.documentElement.outerHTML;
        await annotManager.importAnnotations(finalXfdf, {
          batchSize: 10,
          batchDelay: 500,
          // NOTE: this make it such that dupes arent added for WidgetAnnotations when importAnnotations occurs
          replace: [
            Annotations.SignatureWidgetAnnotation,
            Annotations.CheckButtonWidgetAnnotation,
            Annotations.TextWidgetAnnotation
          ]
        });

        if (currAnnots.length > 0) {
          await annotManager.deleteAnnotations(currAnnots, false, true);
        }

        // refresh viewer
        docViewer.refreshAll();
        docViewer.updateView();
        docViewer.getDocument().refreshTextData();
        annotManager.trigger('updateAnnotationPermission');
      };

      const applySigConvert = async () => {
        const annotations = [...annotManager.getAnnotationsList()];

        const currentDocument = docViewer.getDocument();
        await PDFNet.initialize();
        const pdfDoc = await currentDocument.getPDFDoc();

        const annotationsList = _.filter(
          annotations,
          annot =>
            annot.Subject !== 'Widget' &&
            annot instanceof Annotations.FreeTextAnnotation &&
            (!_.isEmpty(annot.custom) || !_.isEmpty(annot.CustomData))
        );

        const annotsToDelete = await Promise.all(
          annotationsList.map(async (annot, index) => {
            let field;
            let newAnnot = annot;

            // if existing annotation has a `custom` property then use its value to convert to our custom annotation
            if (annot.custom) {
              if (
                annot instanceof Annotations.FreeTextAnnotation &&
                customTypes.indexOf(annot.custom.type) !== -1
              ) {
                // create a form field based on the type of annotation
                if (annot.custom.type === 'TEXT' || annot.custom.type === 'FORM') {
                  field = await pdfDoc.fieldCreateFromStrings(
                    `form.${+new Date()}.${annot.custom.id}.${
                    annot.custom.author
                    }.${annot.custom.signerId}.${annot.custom.name}`,
                    PDFNet.Field.Type.e_text,
                    annot.custom.value,
                    ''
                  );
                } else if (annot.custom.type === 'SIGNATURE') {
                  field = await pdfDoc.fieldCreateFromStrings(
                    `signature.${+new Date()}.${annot.custom.id}.${
                    annot.custom.author
                    }.${annot.custom.signerId}.${annot.custom.name}`,
                    PDFNet.Field.Type.e_signature,
                    annot.getContents(),
                    ''
                  );
                } else if (annot.custom.type === 'INITIALS') {
                  field = await pdfDoc.fieldCreateFromStrings(
                    `initials.${+new Date()}.${annot.custom.id}.${
                    annot.custom.author
                    }.${annot.custom.signerId}.${annot.custom.name}`,
                    PDFNet.Field.Type.e_signature,
                    annot.getContents(),
                    ''
                  );
                } else if (
                  annot.custom.type === 'CHECKBOX' ||
                  annot.custom.type === 'CHECK'
                ) {
                  field = await pdfDoc.fieldCreateFromStrings(
                    `checkbox.${+new Date()}.${annot.custom.id}.${
                    annot.custom.author
                    }.${annot.custom.signerId}.${annot.custom.name}`,
                    PDFNet.Field.Type.e_check,
                    '',
                    ''
                  );
                } else {
                  // exit early for other annotations
                  return annotManager.deleteAnnotation(annot, false, true); // prevent duplicates when importing xfdf
                }

                // check if there is a flag
                if (annot.custom.flag === true) {
                  field.setFlag(PDFNet.Field.Flag.e_read_only, true);
                }

                // translate coordinates
                const pageNumber = annot.getPageNumber();
                const annotRect = await annot.getRect();
                const setTopLeft = currentDocument.getPDFCoordinates(
                  pageNumber - 1,
                  annotRect.x1,
                  annotRect.y1
                );
                const setBottomRight = currentDocument.getPDFCoordinates(
                  pageNumber - 1,
                  annotRect.x2,
                  annotRect.y2
                );

                // create an annotation with a form field created
                newAnnot = await PDFNet.WidgetAnnot.create(
                  pdfDoc,
                  await PDFNet.Rect.init(
                    setTopLeft.x,
                    setTopLeft.y,
                    setBottomRight.x,
                    setBottomRight.y
                  ),
                  field
                );

                newAnnot.custom = newAnnot.CustomData = annot.custom;
                // NOTE: this is where the .Author is set.
                newAnnot.Author = annot.custom.name;

                // Make sure annot.CustomData sticks
                await _.chain(annot.custom)
                  .map(async (val, key) =>
                    newAnnot.setCustomData(key, (val || '').toString())
                  )
                  .thru(proms => Promise.all(proms))
                  .value();

                // delete original annotation
                await annotManager.deleteAnnotation(annot, true, false, false);

                // draw the annotation the viewer
                const page = await pdfDoc.getPage(pageNumber);

                // customize styles of the form field
                Annotations.WidgetAnnotation.getCustomStyles(newAnnot);
                await page.annotPushBack(newAnnot);

                await importXfdf(instance);
                return annot;
              }
            }
          })
        );

        if (annotsToDelete.length > 0) {
          await annotManager.deleteAnnotations(annotsToDelete, false, false);
        }
        await pdfDoc.refreshFieldAppearances();

        return instance.setActiveHeaderGroup('default');

      };

      class ApplySigFieldTool extends Tools.Tool {
        mouseLeftDown(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        mouseLeftUp(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        mouseMove(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        mouseDoubleClick(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        async switchIn(oldTool) {
          await applySigConvert();
          setTimeout(() => {
            instance.setToolMode('AnnotationEdit');
          }, 500);
        }

        switchOut(newTool) { }

        applySigConvert() {
          return applySigConvert();
        }
      }

      const customTool = new ApplySigFieldTool();
      await instance.registerTool({
        toolName: 'ApplySigFieldTool',
        toolObject: customTool,
        buttonImage:
          '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-file-signature fa-w-18 fa-3x"><path fill="currentColor" d="M218.17 424.14c-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34c-6.37 12.78-25.03 11.37-29.48-2.09L144 386.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.75-16.19 54.06-9.7 66 14.16 1.89 3.78 5.49 5.95 9.36 6.26v-82.12l128-127.09V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-40l-128-.11c-16.12-.31-30.58-9.28-37.83-23.75zM384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zm-96 225.06V416h68.99l161.68-162.78-67.88-67.88L288 346.96zm280.54-179.63l-31.87-31.87c-9.94-9.94-26.07-9.94-36.01 0l-27.25 27.25 67.88 67.88 27.25-27.25c9.95-9.94 9.95-26.07 0-36.01z" class=""></path></svg>',
        buttonName: 'applySigFieldTool',
        tooltip: 'Apply Form/Signature Fields'
      });

      return customTool;
    };

    const createSignatureTool = async (type = 'Signature', icon) => {
      const {
        tool,
        annot,
        textAnnot
      } = initCreator(type, instance);

      const dataElement = `${_.lowerFirst(type)}FieldTool`;
      const toolName = `${type}FieldTool`;

      instance.registerTool({
        toolName: `${type}FieldTool`,
        toolObject: tool,
        buttonImage: icon,
        buttonName: dataElement,
        tooltip: `${type} Field Tool`,
      }, annot);

      return {
        annot,
        textAnnot,
        tool,
        button: {
          type: 'toolButton',
          toolName,
          dataElement,
          hidden: ['tablet', 'mobile'],
        }
      }
    }

    const { button: sigTool } = await createSignatureTool('Signature', sigToolIcon);
    const { button: initialsTool } = await createSignatureTool('Initials', initialsToolIcon);

    const { button: sigTemplateTool, textAnnot: SigTemplateAnnot } = await configureCustomTool(instance, {
      type: 'SignatureTemplate', 
      name: 'SignatureTemplate', 
      label: 'Signature',
      icon: sigToolIcon
    });
    const { button: initialsTemplateTool, textAnnot: InitialsTemplateAnnot } = await configureCustomTool(instance, {
      type: 'InitialsTemplate', 
      label: 'Initials', 
      name: 'InitialsTemplate', 
      icon: initialsToolIcon
    });
    const { button: addressTemplateTool, textAnnot: AddressTemplateAnnot } = await configureCustomTool(instance, {
      type: 'AddressTemplate', 
      label: 'Address', 
      name: 'AddressTemplate', 
      icon: addressTemplateIcon
    });

    exports.SigTemplateAnnot = SigTemplateAnnot;
    exports.InitialsTemplateAnnot = InitialsTemplateAnnot;
    exports.AddressTEmplateAnnot = AddressTemplateAnnot;



    // const selectedSignerTextEl = opts.getSelectedSignerHeader();
    createApplySigConvert(instance);



    const notaryBtns = [
      {
        type: 'actionButton',
        // img: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.67 403.43"><defs><style>.cls-1{font-size:354.6px;fill:#231f20;font-family:TimesNewRomanPSMT, Times New Roman;}.cls-2{letter-spacing:-0.15em;}</style></defs><title>va-icon</title><text class="cls-1" transform="translate(0 294.69)"><tspan class="cls-2">V</tspan><tspan x="204.59" y="0">A</tspan></text></svg>',
        img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
        title: 'Form Field Tools',
        dataElement: 'formFieldTools',
        onClick: () => instance.setActiveHeaderGroup('formFieldGroup')
      },
      {
        type: 'actionButton',
        // img: '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460.67 403.43"><defs><style>.cls-1{font-size:354.6px;fill:#231f20;font-family:TimesNewRomanPSMT, Times New Roman;}.cls-2{letter-spacing:-0.15em;}</style></defs><title>va-icon</title><text class="cls-1" transform="translate(0 294.69)"><tspan class="cls-2">V</tspan><tspan x="204.59" y="0">A</tspan></text></svg>',
        img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
        title: 'Template Tools',
        dataElement: 'templateTools',
        onClick: () => instance.setActiveHeaderGroup('templateToolsGroup')
      },
    ];

    // instance.updateTool('SignatureFieldTool', { buttonGroup: 'formBuilderTools' });
    // instance.updateTool('ApplySigFieldTool', { buttonGroup: 'formBuilderTools' });

    instance.registerHeaderGroup('formFieldGroup', [
      { type: 'spacer' },
      { type: 'divider' },
      sigTool,
      initialsTool,
      {
        type: 'toolButton',
        toolName: 'ApplySigFieldTool',
        dataElement: 'applySigFieldTool',
        hidden: ['tablet', 'mobile'],
      },
    ]);

    instance.registerHeaderGroup('templateToolsGroup', [
      { type: 'spacer' },
      { type: 'divider' },
      sigTemplateTool,
      initialsTemplateTool,
      addressTemplateTool,
      {
        type: 'toolButton',
        toolName: 'ApplySigFieldTool',
        dataElement: 'applySigFieldTool',
        hidden: ['tablet', 'mobile'],
      },
    ]);


    instance.setHeaderItems((header) => {
      _.map(notaryBtns, (item) => {
        header.get('eraserToolButton').insertBefore(item);
      });
    });

    return instance;
  };













  const configureFeatures = (instance, config = {}) => {
    // console.log('configureFeaturs', config)
    const { disableFeatures = [], disableTools = [], fitMode, disableElements = [] } = config;

    const { FitMode } = instance;
    if (fitMode) {
      instance.setFitMode(FitMode[fitMode] || FitMode.FitWidth);
    }



    const toDisable = _.pick(instance.Feature, disableFeatures);
    const toEnable = _.omit(instance.Feature, disableFeatures);

    instance.disableFeatures([..._.values(toDisable)]);



    instance.disableTools([...disableTools]);
    instance.disableElements([...disableElements]);

    return { instance }
  };



  // when annotation changed, call annotManger.trigger('annotationupdated'),
  // annotManger.trigger('annotationAdded'), annotManger.trigger('widgetAdded')
  const onAnnotationChanged = (instance) => {

    const isIntermediateField = annot => {
      const customClasses = [
        'InitialsFreeTextAnnot',
        'InitialsRectAnnot',
        'SignatureFreeTextAnnot',
        'SignatureRectAnnot',
        'CheckboxFreeTextAnnot',
        'CheckboxRectAnnot',
        'FormFreeTextAnnot',
        'FormRectAnnot'
      ];
      return customClasses.indexOf(annot.Subject) > -1;
    };

    const shouldSendToFbase = (annotations, type, info) => {

      // intermediary annotations which are placeholder before applySigConvert

      if (info.imported) {

        if (annotations.length === 1) {
          if (annotations[0].Subject === 'SignatureRectAnnot' || annotations[0].Subject === 'SignatureFreeTextAnnot') {
            // console.log('returning false');
            return { shouldContinue: false }
          }
        }
        // if all are widgets annots
        if ((annotations = []).filter(annot => annot instanceof this.instance.Annotations.WidgetAnnotation).length === annotations.length) {
          // if operation is delete
          if (type === 'delete') {
            // then ignore
            return { shouldContinue: false };
          }
          return { shouldContinue: true, type: 'widget' };
        }

        // not all are widgets, ignore import of annotations
        return { shouldContinue: false };
      }

      // if its an intermediary annotation
      if (isIntermediateField(annotations[0])) {
        return { shouldContinue: false };
      }

      return {
        shouldContinue: true,
        type: 'annotation'
      };
    };


    return async (annotations, type, info) => {

      const { Annotations, annotManager } = instance;
      const authorId = annotManager.getCurrentUser();


      const { shouldContinue } = shouldSendToFbase(annotations, type, info);

      if (!shouldContinue) {
        return;
      }

      const annotType = annotations[0] instanceof Annotations.WidgetAnnotation ? 'widget' : 'annotation';

      // if type is annotation then export using exportAnnotCommand
      if (annotType === 'annotation') {
        try {
          let xfdf;
          try {
            xfdf = await annotManager.exportAnnotCommand();
          } catch (err) {
          }

          annotations.forEach(async (annotation) => {

            let parentAuthorId = null;
            xfdf = await annotManager.exportAnnotations({
              annots: [annotation],
              widgets: false,
              links: false,
              fields: false,
            });

            if (type === 'add') {
              // In case of replies, add extra field for server-side permission to be granted to the
              // parent annotation's author
              if (annotation.InReplyTo) {
                parentAuthorId = annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
              }
              annotManager.trigger('annotationAdded', {
                id: annotation.Id,
                authorId,
                parentAuthorId,
                type: 'annotation',
                createdBy: authorId,
                xfdf
              });
            } else if (type === 'modify') {
              // In case of replies, add extra field for server-side permission to be granted to the
              // parent annotation's author
              if (annotation.InReplyTo) {
                parentAuthorId = annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
              }

              annotManager.trigger('annotationUpdated', {
                id: annotation.Id,
                authorId,
                parentAuthorId,
                type: 'annotation',
                xfdf
              });

            } else if (type === 'delete') {
              // server.deleteAnnotation(annotation.Id);
              annotManager.trigger('annotationDeleted', {
                id: annotation.Id,
                authorId,
                parentAuthorId,
                type: 'annotation',
                xfdf
              });
            }
          });
        } catch (err) {
          console.error('caught error', err);
        }
      } else {
        // if type is a widget, then export using exportAnnotation
        annotations.forEach(async annotation => {
          if (!annotation.getField) {
            // console.log('!annotation.getField. was page deleted?');
            return;
          }
          const fieldName = annotation.getField().name;
          const [, , id, author, signerId] = fieldName.split('.');

          if (author !== authorId) {
            // console.log('not exporting b/c we didnt created this annotation');
            await annotation.updateCustomData();
            const signer = exports.getSigner();
            const locked = exports.getLock();
            await annotation.updateReadOnly('consumer', signer, locked);
            return;
          }

          if (type === 'add' || type === 'modify') {
            const xfdf = await annotManager.exportAnnotations({
              annotList: [annotation],
              widgets: true,
              fields: true,
              links: true
            });

            // extract out xml nodes pertaining to this widget only
            const parser = new window.DOMParser();
            const xmlDoc = parser.parseFromString(xfdf, 'text/xml');
            const allFields = xmlDoc
              .querySelector('pdf-info')
              .querySelectorAll('ffield');
            const allWidgets = xmlDoc
              .querySelector('pdf-info')
              .querySelectorAll('widget');
            const ffields = xmlDoc
              .querySelector('pdf-info')
              .querySelectorAll(`ffield[name*="${fieldName}"]`);
            const widgets = xmlDoc
              .querySelector('pdf-info')
              .querySelectorAll(`widget[field*="${fieldName}"]`);
            const diffFields = _.difference(allFields, ffields);
            const diffWidgets = _.difference(allWidgets, widgets);

            for (const diffField of [...diffFields, ...diffWidgets]) {
              xmlDoc.querySelector('pdf-info').removeChild(diffField);
            }
            const finalXfdf = xmlDoc.documentElement.outerHTML;

            // console.log('server.createAnnotation called with', xfdf);
            const parentAuthorId = author || 'default';

            const payload = {
              id: annotation.Id,
              authorId,
              parentAuthorId,
              signerId,
              type: 'widget',
              xfdf: `<?xml version="1.0" encoding="UTF-8" ?>${finalXfdf}`
            };

            annotation.updateVisibility();
            annotManager.trigger('widgetAdded', payload);
            annotManager.trigger('annotationAdded', payload);
          } else if (type === 'delete') {
            console.debug('deleting widget annotation', id);
            annotManager.trigger('annotationDeleted', id);
            annotManager.trigger('widgetDeleted', id);
          }
        });
      }
    }
  }


  const handleAddAnnotation = (instance) => async (val) => {
    const { Annotations, annotManager } = instance;

    if (!val) {
      return;
    }

    const { id: annotId, xfdf, type } = val;
    let annotations;
    if (type === 'annotation') {
      annotations = await annotManager.importAnnotations(xfdf);
      const [annotation] = annotations;
      if (annotation) {
        await annotation.resourcesLoaded();
        await annotManager.redrawAnnotation(annotation);
      }

    } else {
      const annots = await annotManager.getAnnotationsList();
      const existingAnnot = _.chain(annots)
        .filter(el => el instanceof Annotations.WidgetAnnotation)
        .find(el => {
          const meta = el.getMetadata();
          return meta.id === annotId;
        })
        .value();

      if (existingAnnot) {
        // console.log('%cSkipping reimport of widget', 'color: red;font-size:20px')
        return;
      }

      annotations = await annotManager.importAnnotations(val.xfdf);
    }

    const locked = exports.getLock();
    if (locked) {
      return annotManager.hideAnnotations(annotations);
    }

  }
  const handleUpdateAnnotation = (instance) => async (val) => {
    const { annotManager } = instance;
    const { xfdf, type, authorId } = val;
    if (authorId === annotManager.getCurrentUser()) {
      return;
    }

    // Import the annotation based on xfdf command
    if (type === 'annotation') {
      try {
        const annotations = await annotManager.importAnnotCommand(xfdf);
        const annotation = annotations[0];

        const locked = exports.getLock();
        if (locked === true) {
          await annotManager.hideAnnotations(annotations);
        }
        if (annotation) {
          await annotation.resourcesLoaded();
          // NOTE: Set a custom field authorId to be used in client-side permission check
          annotation.authorId = authorId;
          annotManager.redrawAnnotation(annotation);
        }
      } catch (error) {
        console.error('error updating annotation', error);
      }
    }
  }


  // window.addEventListener('viewerLoaded', async () => {
  window.addEventListener('viewerLoaded', async () => {
    const { readerControl } = exports;
    const { docViewer } = exports.readerControl;

    const { Annotations, Tools, PDFNet } = exports;
    const annotManager = docViewer.getAnnotationManager();

    // console.log('custom file loaded', { PDFNet, Tools, annotManager, readerControl: exports.readerControl, Annotations, version: exports })
    const instance = { ...exports.readerControl, Annotations, Tools, PDFNet, annotManager }


    await extendAnnotations({ ...instance });
    await configureHeader(instance, {})
    const custom = JSON.parse(exports.readerControl.getCustomData()) || {};
    // console.log('finished config', custom)
    await configureFeatures(instance, custom)

    console.log('custom', custom);

    annotManager.setAnnotationDisplayAuthorMap((annot) => {
      // console.log('setAnnotationDisplayAuthorMap called');
      const signers = exports.getSigners();;
      const signer = exports.getSigner();;

      if (annot instanceof Annotations.WidgetAnnotation) {
        const signerId = _.get(annot, 'CustomData.signerId', annot.Author);
        const type = _.get(annot, 'CustomData.type', annot.Author);
        if (signerId && type) {
          const user = _.find(signers, { id: signerId });

          if (user) {
            const fullName = parseName(user);
            return fullName;
          }
        }
      }

      if (_.get(annot, 'Author')) {
        // console.log('annot.Author', annot.Author);
        const user = _.find(signers, { id: annot.Author });

        if (user) {
          return parseName(user);
        }
      }

      const s = _.find(signers, { id: signer });
      if (s) {
        return parseName(s);
      }

      return _.get(annot, 'Author');
    });



    // register events to trigger on annotManager. subscribed by parent component
    annotManager.on('annotationChanged', onAnnotationChanged(instance))


    // register listeners. triggered from parent component
    annotManager.on('addAnnotation', handleAddAnnotation(instance))

    annotManager.on('updateAnnotation', handleUpdateAnnotation(instance));

    annotManager.on('deleteAnnotation', async (val) => {
      const command = `<delete><id>${val.id}</id></delete>`;
      return annotManager.importAnnotCommand(command);
    });

    annotManager.on('setLockStatus', async (val) => {
      exports.setLock(val);
      return exports.readerControl.setReadOnly(val);
    });



    annotManager.on('updateAnnotationPermission', async annotation => {
      if (!annotation) {
        const allAnnots = annotManager.getAnnotationsList();


        const locked = exports.getLock();
        const currUserId = annotManager.getCurrentUser();
        const isAdminUser = annotManager.getIsAdminUser();

        await Promise.map(allAnnots, (annot) => {
          if (annot instanceof Annotations.WidgetAnnotation) {
            const signerId = _.get(annot.getMetadata(), 'signerId');

            if (isAdminUser) {
              annot.fieldFlags.set('ReadOnly', false);
              return;
            }

            if (signerId !== currUserId || locked) {
              // console.log('isReadOnly', signerId, currUserId);
              annot.fieldFlags.set('ReadOnly', true);
            } else {
              annot.fieldFlags.set('ReadOnly', false);
            }
          }
        });
      }
    });


    annotManager.on('setSelectedSigner', async (val) => {
      const newSigner = exports.setSigner(val);
      const signers = exports.getSigners();
      const selSigner = _.find(signers, { id: newSigner });
      return annotManager.setCurrentUser(_.get(selSigner, 'id', 'guest'))
    });


    annotManager.on('addSigner', async (args) => exports.addSigner(args));
    annotManager.on('setSigners', async (...args) => exports.setSigners(args));





    docViewer.on('updateFeatures', configureFeatures(instance));


    // TODO: use this when at v6.3
    readerControl.setColorPalette(['#000000', '#4B92DB']);



    // disables hotkeys when document loads
    readerControl.docViewer.on('annotationsLoaded', () => {
      readerControl.hotkeys.off();
      readerControl.hotkeys.on('AnnotationEdit');
    });

    // disables hotkeys when annotManager.setCurrentUser() is called
    annotManager.on('updateAnnotationPermission', () => {
      readerControl.hotkeys.off();
      readerControl.hotkeys.on('AnnotationEdit');
    });


    ;

    return docViewer.trigger('ready');

  });
})(window);
