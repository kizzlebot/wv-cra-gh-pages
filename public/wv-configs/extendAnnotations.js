const _ = require('lodash');
const extendAnnotations = module.exports = (instance) => {
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

    // const { type, timestamp, signerId, author, name, id } = this.getMetadata();


    // // update readOnly flag based for this widget annotation on the currentUser
    // // console.debug('updateReadOnly', currentUser, this.fieldFlags.get('ReadOnly'));
    // if (userType === 'consumer' && locked) {
    //   return this.fieldFlags.set('ReadOnly', true);
    // }

    // if (userType === 'notary') {
    //   this.fieldFlags.set('ReadOnly', false);
    // } else if (signerId === currentUser) {
    //   this.fieldFlags.set('ReadOnly', false);
    // } else {
    //   this.fieldFlags.set('ReadOnly', true);
    // }

    // return {
    //   id,
    //   type,
    //   timestamp,
    //   author,
    //   signerId,
    //   name
    // };
  };


  const { addSignature, saveSignatures, importSignatures, exportSignatures } = Tools.SignatureCreateTool.prototype;
  Tools.SignatureCreateTool.prototype.importSignatures = function (args) {
    return importSignatures.apply(this, arguments);
  };





  Annotations.SignatureWidgetAnnotation.prototype.createSignHereElement = function () {
    // signHereElement is the default one with dark blue background
    const signHereElement = createSignHereElement.apply(this, arguments);

    const { type, timestamp, id, author, signerId, name } = this.getMetadata();


    // if double import, then don't show it.
    const annots = annotManager.getAnnotationsList();
    this.setCustomData(this.getMetadata());
    const dup = _.find(annots, (annot) => (annot.Id !== this.Id && annot.CustomData.id === id));

    if (dup) {
      signHereElement.style.backgroundColor = 'none';
      signHereElement.style.display = 'none';
      signHereElement.innerText = '';
      return signHereElement;
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

        // positioning and scaling signature annotation to go inside widget
        // const height = signatureWidget.Height;
        // const width = signatureWidget.Width;
        // const x = signatureWidget.getRect().x1;
        // const y = signatureWidget.getRect().y1;

        // let hScale = 1;
        // let wScale = 1;
        // hScale = height / signatureAnnot.Height;
        // wScale = width / signatureAnnot.Width;
        // const scale = Math.min(hScale, wScale);

        // signatureAnnot.Width = width;
        // signatureAnnot.Height = height;

        let h;
        let i;
        // if (signatureAnnot.getPaths) {
        //   for (h = 0; h < signatureAnnot.getPaths().length; h++) {
        //     for (i = 0; i < signatureAnnot.getPaths()[h].length; i++) {
        //       signatureAnnot.getPaths()[h][i].x = (signatureAnnot.getPaths()[h][i].x - signatureAnnot.X);
        //       signatureAnnot.getPaths()[h][i].y = (signatureAnnot.getPaths()[h][i].y - signatureAnnot.Y);
        //     }
        //   }
        // }

        // signatureAnnot.X = x;
        // signatureAnnot.Y = y;

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
    }
    el.addEventListener('click', handleClick);

    return el;
  };

};

// @ts-nocheck
((exports) => {

  const { Promise, R, _ } = exports.getExternalLibs()

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

      // const { type, timestamp, signerId, author, name, id } = this.getMetadata();


      // // update readOnly flag based for this widget annotation on the currentUser
      // // console.debug('updateReadOnly', currentUser, this.fieldFlags.get('ReadOnly'));
      // if (userType === 'consumer' && locked) {
      //   return this.fieldFlags.set('ReadOnly', true);
      // }

      // if (userType === 'notary') {
      //   this.fieldFlags.set('ReadOnly', false);
      // } else if (signerId === currentUser) {
      //   this.fieldFlags.set('ReadOnly', false);
      // } else {
      //   this.fieldFlags.set('ReadOnly', true);
      // }

      // return {
      //   id,
      //   type,
      //   timestamp,
      //   author,
      //   signerId,
      //   name
      // };
    };


    const { addSignature, saveSignatures, importSignatures, exportSignatures } = Tools.SignatureCreateTool.prototype;
    Tools.SignatureCreateTool.prototype.importSignatures = function (args) {
      return importSignatures.apply(this, arguments);
    };





    Annotations.SignatureWidgetAnnotation.prototype.createSignHereElement = function () {
      // signHereElement is the default one with dark blue background
      const signHereElement = createSignHereElement.apply(this, arguments);

      const { type, timestamp, id, author, signerId, name } = this.getMetadata();


      // if double import, then don't show it.
      const annots = annotManager.getAnnotationsList();
      this.setCustomData(this.getMetadata());
      const dup = _.find(annots, (annot) => (annot.Id !== this.Id && annot.CustomData.id === id));

      if (dup) {
        signHereElement.style.backgroundColor = 'none';
        signHereElement.style.display = 'none';
        signHereElement.innerText = '';
        return signHereElement;
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

          // positioning and scaling signature annotation to go inside widget
          // const height = signatureWidget.Height;
          // const width = signatureWidget.Width;
          // const x = signatureWidget.getRect().x1;
          // const y = signatureWidget.getRect().y1;

          // let hScale = 1;
          // let wScale = 1;
          // hScale = height / signatureAnnot.Height;
          // wScale = width / signatureAnnot.Width;
          // const scale = Math.min(hScale, wScale);

          // signatureAnnot.Width = width;
          // signatureAnnot.Height = height;

          let h;
          let i;
          // if (signatureAnnot.getPaths) {
          //   for (h = 0; h < signatureAnnot.getPaths().length; h++) {
          //     for (i = 0; i < signatureAnnot.getPaths()[h].length; i++) {
          //       signatureAnnot.getPaths()[h][i].x = (signatureAnnot.getPaths()[h][i].x - signatureAnnot.X);
          //       signatureAnnot.getPaths()[h][i].y = (signatureAnnot.getPaths()[h][i].y - signatureAnnot.Y);
          //     }
          //   }
          // }

          // signatureAnnot.X = x;
          // signatureAnnot.Y = y;

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
      }
      el.addEventListener('click', handleClick);

      return el;
    };

  };


})(window);
