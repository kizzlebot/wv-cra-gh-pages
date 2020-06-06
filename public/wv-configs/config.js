// @ts-nocheck



const sigTemplateToolIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-signature fa-w-20 fa-xs"><path fill="currentColor" d="M623.2 192c-51.8 3.5-125.7 54.7-163.1 71.5-29.1 13.1-54.2 24.4-76.1 24.4-22.6 0-26-16.2-21.3-51.9 1.1-8 11.7-79.2-42.7-76.1-25.1 1.5-64.3 24.8-169.5 126L192 182.2c30.4-75.9-53.2-151.5-129.7-102.8L7.4 116.3C0 121-2.2 130.9 2.5 138.4l17.2 27c4.7 7.5 14.6 9.7 22.1 4.9l58-38.9c18.4-11.7 40.7 7.2 32.7 27.1L34.3 404.1C27.5 421 37 448 64 448c8.3 0 16.5-3.2 22.6-9.4 42.2-42.2 154.7-150.7 211.2-195.8-2.2 28.5-2.1 58.9 20.6 83.8 15.3 16.8 37.3 25.3 65.5 25.3 35.6 0 68-14.6 102.3-30 33-14.8 99-62.6 138.4-65.8 8.5-.7 15.2-7.3 15.2-15.8v-32.1c.2-9.1-7.5-16.8-16.6-16.2z" class=""></path></svg>';
const initialsTemplateToolIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-signature fa-w-20 fa-xs"><path fill="currentColor" d="M623.2 192c-51.8 3.5-125.7 54.7-163.1 71.5-29.1 13.1-54.2 24.4-76.1 24.4-22.6 0-26-16.2-21.3-51.9 1.1-8 11.7-79.2-42.7-76.1-25.1 1.5-64.3 24.8-169.5 126L192 182.2c30.4-75.9-53.2-151.5-129.7-102.8L7.4 116.3C0 121-2.2 130.9 2.5 138.4l17.2 27c4.7 7.5 14.6 9.7 22.1 4.9l58-38.9c18.4-11.7 40.7 7.2 32.7 27.1L34.3 404.1C27.5 421 37 448 64 448c8.3 0 16.5-3.2 22.6-9.4 42.2-42.2 154.7-150.7 211.2-195.8-2.2 28.5-2.1 58.9 20.6 83.8 15.3 16.8 37.3 25.3 65.5 25.3 35.6 0 68-14.6 102.3-30 33-14.8 99-62.6 138.4-65.8 8.5-.7 15.2-7.3 15.2-15.8v-32.1c.2-9.1-7.5-16.8-16.6-16.2z" class=""></path></svg>';
const addressTemplateToolIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="address-card" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-address-card fa-w-18 fa-3x"><path fill="currentColor" d="M528 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-352 96c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm112 236.8c0 10.6-10 19.2-22.4 19.2H86.4C74 384 64 375.4 64 364.8v-19.2c0-31.8 30.1-57.6 67.2-57.6h5c12.3 5.1 25.7 8 39.8 8s27.6-2.9 39.8-8h5c37.1 0 67.2 25.8 67.2 57.6v19.2zM512 312c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-64c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16z" class=""></path></svg>`;

const { Promise, R, _ } = window.parent;
const tapP = (fn) => (args) => Promise.resolve(fn(args)).then(R.always(args));
const debugTap = tapP((resp) => console.log('debugtap', resp));

const parseName = (user) => {
  const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
  const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));
  return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
}

const runId = `${Math.floor(Math.random() * 10000)}`;


const toFullName = R.pipe(
  R.split(' '),
  R.map(R.pipe(_.upperFirst)),
  R.join(' ')
);


const toInitials = R.pipe(
  R.split(' '),
  R.map(R.pipe(R.head, R.toUpper)),
  R.join('')
);



((exports) => {

  // const { Promise, R, _ } = exports.getExternalLibs()
  
  

  // #region get/set signers
  let signer = null;
  let notary = null;
  let signers = [];
  const signerSigInits = {};
  let locked = false;
  const { Annotations, Tools, PDFNet } = exports;

  const colors = [
    new Annotations.Color(153, 215, 114, 0.5),
    new Annotations.Color(255, 10, 102, 0.5),
    new Annotations.Color(38, 79, 120, 0.5),
    new Annotations.Color(239, 106, 70, 0.5),
    new Annotations.Color(227, 73, 67, 0.5),
    new Annotations.Color(255, 87, 126, 0.5),
    new Annotations.Color(91, 215, 227, 0.5),
    new Annotations.Color(91, 215, 227, 0.5),
    new Annotations.Color(160, 146, 236, 0.5),
  ];


  exports.setSigners = (s) => {
    // console.log('setSigners called', s);
    signers = _.map(s, (signer, i) => {
      return {
        ...signer,
        color: colors[i % colors.length],
      };
    });

    return signers;
  };

  exports.setSigner = (s) => {
    signer = s;

    return signer;
  };

  exports.getSigner = () => signer;
  exports.getSignerById = (id) => _.find(signers, { id });
  exports.setNotary = (n) => {
    notary = n;
    return notary;
  };
  exports.getNotary = (n) => notary;;
  exports.addSigner = (s) => {
    signers = _.uniqBy([...signers, s], 'id');
    return signers;
  };


  exports.getSigInits = () => signerSigInits;

  exports.updateSignerSigInits = (id, val) => {
    signerSigInits[id] = val;

    return signerSigInits;
  };

  exports.saveSignature = ({ id, type, raw }) => {
    signerSigInits[id] = signerSigInits[id] || {};
    signerSigInits[id][type] = { id, type, raw };

    return signerSigInits;
  };


  exports.getSigners = () => signers;
  exports.setLock = (s) => locked = s;
  exports.getLock = (s) => locked;
  exports.setSignerSigInits = (id, type, raw) => ({
    ...signerSigInits,
    [id]: {
      ...signerSigInits[id],
      [type]: raw || signerSigInits[id]?.[type],
    },
  });
  exports.getSigInits = () => signerSigInits;
  exports.delSignerSigInits = (id, sigType) => ({
    ...signerSigInits,
    [id]: {
      ...(signerSigInits[id] || {}),
      [sigType]: null,
    },
  });
  //#endregion








  const extendAnnotations = (instance) => {
    const { PDFNet, docViewer, Annotations, Tools } = instance;
    const annotManager = docViewer.getAnnotationManager();
    const { createSignHereElement, serialize, deserialize, draw } = Annotations.SignatureWidgetAnnotation.prototype;

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


    Annotations.WidgetAnnotation.prototype.getMetadata = function getMetadata() {
      if (!this.getField) {
        return;
      }
      const [type, runId, id, author, signerId, name] = this.getField().name.split('.');
      return {
        id,
        runId,
        type,
        author,
        signerId,
        name
      };
    };

    Annotations.WidgetAnnotation.prototype.updateCustomData = async function (currentUser) {
      if (!this.getField) {
        return;
      }

      const [type, runId, id, author, signerId, name] = this.getField().name.split('.');
      const CustomData = this.getMetadata();
      console.table(CustomData)
      await Promise.all([
        this.setCustomData('type', type),
        this.setCustomData('runId', runId),
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

      const { type, signerId, author, name, id } = this.getMetadata();


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
        author,
        signerId,
        name
      };
    };


    const { addSignature, saveSignatures, importSignatures, exportSignatures } = Tools.SignatureCreateTool.prototype;
    Tools.SignatureCreateTool.prototype.importSignatures = function (args) {
      return importSignatures.apply(this, arguments);
    };

    const setCustomData = Annotations.Annotation.prototype.setCustomData;
    Annotations.Annotation.prototype.setCustomData = function(){
      setCustomData.apply(this, arguments);
      // annotManager.trigger('annotationChanged', [[this], 'modify', { imported: false, isUndoRedo: false }]);
    }



    class BetterSigWidgetAnnotation extends Annotations.SignatureWidgetAnnotation {
      createInnerElement(...args){
        const rtn = super.createInnerElement(...args)
        this.setCustomData(this.getMetadata());
        return rtn;
      }

      createSignHereElement(...args){

        const signHereElement = super.createSignHereElement(...args);

        const { type, runId, id, author, signerId, name } = this.getMetadata();
        this.Author = signerId;

        // console.debug('this', { signerId, custom: this.custom, customdata: this.CustomData });
        this.setCustomData('id', id);
        this.setCustomData('runId', runId);
        this.setCustomData('type', type);
        // this.setCustomData('timestamp', timestamp);
        this.setCustomData('name', name);
        this.setCustomData('author', annotManager.getCurrentUser());
        this.setCustomData('signerId', signerId);

        signHereElement.style.backgroundColor = 'blue';
        signHereElement.innerText = `${_.capitalize(type)}: ${this.CustomData.fullName}`;
        signHereElement.style.fontSize = '12px';
        return signHereElement;
      }

      serialize(...args) {
        return serialize.apply(this, ...args);
      }
      deserialize(...args){
        return deserialize.apply(this, ...args);
      }
    }
    BetterSigWidgetAnnotation.prototype.elementName = 'AnnotationBetterSignatureWidget';

    instance.annotManager.registerAnnotationType(BetterSigWidgetAnnotation.prototype.elementName, BetterSigWidgetAnnotation);

    Annotations.BetterSigWidgetAnnotation = BetterSigWidgetAnnotation;

    Annotations.SignatureWidgetAnnotation.prototype.createSignHereElement = function () {
      // signHereElement is the default one with dark blue background
      const signHereElement = createSignHereElement.apply(this, arguments);

      const { type, runId, id, author, signerId, name } = this.getMetadata();
      this.Author = signerId;

      // console.debug('this', { signerId, custom: this.custom, customdata: this.CustomData });
      this.setCustomData('id', id);
      this.setCustomData('runId', runId);
      this.setCustomData('type', type);
      // this.setCustomData('timestamp', timestamp);
      this.setCustomData('name', name);
      this.setCustomData('author', annotManager.getCurrentUser());
      this.setCustomData('signerId', signerId);


      // signHereElement.style.backgroundColor = 'red';
      signHereElement.innerText = `${_.capitalize(type)}: ${name}`;
      signHereElement.style.fontSize = '12px';
      return signHereElement;
    };
  };


  const configureFeatures = (instance, config = {}) => {
    const { 
      disableFeatures = [], 
      disableTools = [], 
      fitMode, 
      disableElements = [] 
    } = config;

    const { FitMode } = instance;
    if (fitMode) {
      instance.setFitMode(FitMode[fitMode] || FitMode.FitWidth);
    }



    const toDisable = _.pick(instance.Feature, disableFeatures);

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
        'TemplateRectAnnot',
        'CheckboxFreeTextAnnot',
        'CheckboxRectAnnot',
        'FormFreeTextAnnot',
        'FormRectAnnot'
      ];
      return _.findIndex(customClasses, (cc) => annot.Subject.includes(cc)) > -1
    };

    const shouldSendToFbase = (annotation, type, info) => {

      if (info.imported) {
        return { shouldContinue: false }
      }

      // if its an intermediary annotation
      if (isIntermediateField(annotation)) {
        return { shouldContinue: false };
      }

      // if all are widgets annots
      if (annotation instanceof instance.Annotations.WidgetAnnotation) {
        return { 
          shouldContinue: true, 
          type: 'widget' 
        };
      }

      return {
        shouldContinue: true,
        type: 'annotation'
      };
    };


    return async (annotations, type, info) => {

      const { Annotations, annotManager } = instance;
      const authorId = annotManager.getCurrentUser();




      annotations.forEach(async (annotation) => {

        const { shouldContinue } = shouldSendToFbase(annotation, type, info);

        if (!shouldContinue) {
          return;
        }

        const annotType = annotation instanceof Annotations.WidgetAnnotation ? 'widget' : 'annotation';

        // if type is annotation then export using exportAnnotCommand
        if (annotType === 'annotation') {
          let parentAuthorId = null;
          let xfdf = await annotManager.exportAnnotCommand({
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
        } 

        // type is a widget 
        else {

          if (!annotation.getField) {
            // console.log('!annotation.getField. was page deleted?');
            return;
          }
          const fieldName = annotation.getField().name;
          const [, , id, author, signerId] = fieldName.split('.');


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
              id: annotation.CustomData.id,
              authorId,
              parentAuthorId,
              signerId,
              type: 'widget',
              xfdf: `<?xml version="1.0" encoding="UTF-8" ?>${finalXfdf}`
            };

            // annotation.updateVisibility();
            annotManager.trigger('widgetAdded', payload);
            // annotManager.trigger('annotationAdded', payload);
          } else if (type === 'delete') {
            console.debug('deleting widget annotation', id);
            annotManager.trigger('annotationDeleted', id);
            // annotManager.trigger('widgetDeleted', id);
          }
        }
      });
    }
  }
  const onFieldChanged = (instance) => {
    return (field, value) => {
      instance.annotManager.trigger('fieldUpdated', {
        type: 'field',
        name: field.name,
        value: value
      })
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
          const id = el.CustomData.id;
          return id === annotId;
        })
        .value();

      if (existingAnnot) {
        console.log('%cSkipping reimport of widget', 'color: red;font-size:20px')
        return;
      }

      annotations = await annotManager.importAnnotations(val.xfdf);
      const toDelete = _.chain(annotManager.getAnnotationsList())
        .groupBy('CustomData.id')
        .omit(['undefined'])
        .mapValues((val) => val.length > 1 ? _.tail(val) : [])
        .values()
        .flatten()
        .value()
      console.log('groupoing', toDelete);
      annotManager.deleteAnnotations(toDelete, true);
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
    const instance = { 
      ...exports.readerControl, 
      Annotations, 
      Tools, 
      PDFNet, 
      annotManager,
      getRunId: () => runId,
      setNotary: exports.setNotary,
      getNotary: exports.getNotary,
      getSigners: exports.getSigners,
      getSigner: exports.getSigner,
      getSignerById: exports.getSignerById,
      setSigners: exports.setSigners,
    }


    await extendAnnotations({ ...instance });
    const custom = JSON.parse(exports.readerControl.getCustomData()) || {};
    // console.log('finished config', custom)
    await configureFeatures(instance, custom)


  




    annotManager.setAnnotationDisplayAuthorMap((annot) => {
      // console.log('setAnnotationDisplayAuthorMap called');
      const signers = exports.getSigners();;
      const signer = exports.getSigner();;

      console.log('setAnnotationDisplayAuthormap called', annot);
      if (annot instanceof Annotations.WidgetAnnotation) {
        const signerId = _.get(annot, 'CustomData.signerId', annot.Author);
        const signer = exports.getSignerById(signerId);
        const rtn = parseName(signer);
        console.log('returning', rtn);
        return rtn;
        // const type = _.get(annot, 'CustomData.type', annot.Author);
        // if (signerId && type) {
        //   const user = _.find(signers, { id: signerId });

        //   if (user) {
        //     const fullName = parseName(user);
        //     return fullName;
        //   }
        // }
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
    annotManager.on('fieldChanged', onFieldChanged(instance))


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
    readerControl.setColorPalette(['#4B92DB', '#000000']);



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



    return docViewer.trigger('ready', { ...instance, Annotations, });

  });
})(window);
