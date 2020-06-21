// eslint-disable-next-line no-unused-vars
function tracePropAccess(obj, propKeys) {
  return new Proxy(obj, {
    construct(...args){
      console.log('constructed');
      return Reflect.construct(...args);
    },
    get(target, propKey, receiver) {
      console.log('GET ' + propKey);
      return Reflect.get(target, propKey, receiver);
    },
    set(target, propKey, value, receiver) {
      console.log(`SET: ${propKey}=`, value);
      return Reflect.set(target, propKey, value, receiver);
    },
  });
}









((exports) => {

  const { Promise, R, _ } = window.getExternalLibs()
  // eslint-disable-next-line no-unused-vars
  const tapP = (fn) => (args) => Promise.resolve(fn(args)).then(R.always(args));

  const parseName = (user) => {
    const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
    const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));
    return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
  }

  const runId = !!window.sessionStorage.getItem('runId') ? window.sessionStorage.getItem('runId') : `${Math.floor(Math.random() * 10000)}`;
  window.sessionStorage.setItem('runId', runId);

  
  

  // #region get/set signers
  let docId = null;
  let certPdfUrl = null;
  let notary = null;
  let signers = [];
  let selectedSigner = null;
  let pageCount = {};
  const signerSigInits = {};
  let locked = false;
  const { Annotations } = exports;

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


  // store origin page count
  exports.setPageCount = (docId, num) => {
    pageCount = { ...pageCount, [docId]: num }
    return pageCount;
  };
  exports.getPageCount = () => pageCount[docId]
  exports.setCertPdf = (url) => certPdfUrl = url;
  exports.getCertPdf = () => certPdfUrl;

  exports.getOriginalPageCount = () => pageCount[docId]

  exports.getRunId = () => runId;
  exports.setDocId = (id) => {
    docId = id;
    return docId;
  };
  exports.getDocId = () => docId;

  exports.setSigners = (s) => {
    signers = _.map(s, (signer, i) => {
      return {
        ...signer,
        color: colors[i % colors.length],
      };
    });

    return signers;
  };

  exports.setSelectedSigner = (s) => {
    selectedSigner = s;
    return selectedSigner;
  };

  exports.getSigner = () => selectedSigner;
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
    const { docViewer, Annotations, Tools } = instance;
    const annotManager = docViewer.getAnnotationManager();
    const { createSignHereElement, serialize, deserialize } = Annotations.SignatureWidgetAnnotation.prototype;

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

    // Annotations.Forms.Field.prototype = tracePropAccess(Annotations.Forms.Field.prototype);
    

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


    // eslint-disable-next-line no-unused-vars
    const { addSignature, saveSignatures, importSignatures, exportSignatures } = Tools.SignatureCreateTool.prototype;
    Tools.SignatureCreateTool.prototype.importSignatures = function (args) {
      return importSignatures.apply(this, arguments);
    };

    const setCustomData = Annotations.Annotation.prototype.setCustomData;
    Annotations.Annotation.prototype.setCustomData = function(){
      setCustomData.apply(this, arguments);
    }




    class BetterSigWidgetAnnotation extends Annotations.SignatureWidgetAnnotation {
      createInnerElement(...args){
        const rtn = super.createInnerElement(...args)
        return rtn;
      }

      createSignHereElement(...args){

        const signHereElement = super.createSignHereElement(...args);

        // eslint-disable-next-line no-unused-vars
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

      serialize(el, pageMatrix) {
        return serialize.call(this, el, pageMatrix);
      }
      deserialize(...args){
        return deserialize.apply(this, ...args);
      }
    }
    BetterSigWidgetAnnotation.prototype.elementName = 'BetterSignatureWidget';

    instance.annotManager.registerAnnotationType(BetterSigWidgetAnnotation.prototype.elementName, BetterSigWidgetAnnotation);

    Annotations.BetterSigWidgetAnnotation = BetterSigWidgetAnnotation;

    Annotations.SignatureWidgetAnnotation.prototype.createSignHereElement = function () {
      // signHereElement is the default one with dark blue background
      const signHereElement = createSignHereElement.apply(this, arguments);

      // eslint-disable-next-line no-unused-vars
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
      layoutMode,
      disableElements = [] 
    } = config;
    

    const { FitMode, LayoutMode } = instance;
    if (fitMode) {
      instance.setFitMode(FitMode[fitMode] || FitMode.FitWidth);
    }

    if (layoutMode){
      instance.setLayoutMode(LayoutMode[layoutMode] || LayoutMode.Continuous)
    }


    const toDisable = _.pick(instance.Feature, disableFeatures);

    instance.disableFeatures([..._.values(toDisable)]);



    instance.disableTools([...disableTools]);
    instance.disableElements([...disableElements]);
    instance.setActiveLeftPanel('thumbnailsPanel');

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
        'CheckFreeTextAnnot',
        'CheckRectAnnot',
        'TextFreeTextAnnot',
        'TextRectAnnot'
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
          let xfdf = await annotManager.exportAnnotCommand();
          

          if (type === 'add') {
            // In case of replies, add extra field for server-side permission to be granted to the
            // parent annotation's author
            if (annotation.InReplyTo) {
              parentAuthorId = annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
            }
            annotManager.trigger('annotationAdded', [{
              id: annotation.Id,
              authorId,
              parentAuthorId,
              pageNumber: annotation.getPageNumber(),
              docId: exports.getDocId(),
              type: 'annotation',
              createdBy: authorId,
              xfdf
            }, exports.getDocId()]);
          } else if (type === 'modify') {
            // In case of replies, add extra field for server-side permission to be granted to the
            // parent annotation's author
            if (annotation.InReplyTo) {
              parentAuthorId = annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
            }

            annotManager.trigger('annotationUpdated', [{
              id: annotation.Id,
              authorId,
              docId: exports.getDocId(),
              parentAuthorId,
              type: 'annotation',
              xfdf
            }, exports.getDocId()]);

          } else if (type === 'delete') {
            // server.deleteAnnotation(annotation.Id);
            annotManager.trigger('annotationDeleted', [{
              id: annotation.Id,
              authorId,
              docId: exports.getDocId(),
              parentAuthorId,
              type: 'annotation',
              xfdf
            }, exports.getDocId()]);
          }
        } 

        // type is a widget 
        else {

          if (!annotation.getField) {
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

            const parentAuthorId = author || 'default';
            const field = annotation.getField();
            const payload = {
              id: annotation.CustomData.id,
              authorId,
              runId: exports.getRunId(),
              docId: exports.getDocId(),
              pageNumber: annotation.getPageNumber(),
              parentAuthorId,
              signerId,
              subtype: annotation.CustomData.type,
              fieldName: field.name,
              fieldValue: field.value,
              type: 'widget',
              xfdf: `<?xml version="1.0" encoding="UTF-8" ?>${finalXfdf}`
            };

            // annotation.updateVisibility();
            annotManager.trigger('updateAnnotationPermission');
            annotManager.trigger('widgetAdded', [payload, exports.getDocId()]);
            // annotManager.trigger('annotationAdded', payload);
          } else if (type === 'delete') {
            console.debug('deleting widget annotation', id);
            annotManager.trigger('widgetDeleted', [{
              id: annotation.CustomData.id,
              authorId,
              runId: exports.getRunId(),
              docId: exports.getDocId(),
              pageNumber: annotation.getPageNumber(),
              signerId,
              type: 'widget'
            }, exports.getDocId()]);
          }
        }
      });
    }
  }

  const onFieldChanged = (instance) => (field, value) => {
    instance.annotManager.trigger('fieldUpdated', {
      type: 'field',
      name: field.name,
      value: value
    })
  }



  /**
   * Handle adding annotation/widget
   * @param {WebViewerInstance} instance 
   */
  const handleAddAnnotation = (instance) => async (annots, cb) => {
    const { Annotations, annotManager } = instance;
    const docId = instance.getDocId();


    const annotations = await Promise.mapSeries(_.uniqBy(_.castArray(annots), 'id'), async (val) => {
      if (!val || val.docId !== docId) {
        return;
      }
  
      const { id: annotId, xfdf, type, action } = val;
      let annotations;
  
      await instance.docViewer.getAnnotationsLoadedPromise();
      
      if (action === 'delete'){
        const annot = (type === 'widget') ? instance.annotManager.getWidgetById(annotId) : instance.annotManager.getAnnotationById(annotId);
        if (annot){
          await instance.annotManager.deleteAnnotation(annot, true);
        }
      }

      else if (type === 'annotation') {
        annotations = await annotManager.importAnnotCommand(xfdf);
        const [annotation] = annotations;
        if (annotation) {
          try {
            await annotation.resourcesLoaded();
            await annotManager.redrawAnnotation(annotation);
          } catch (err) {
            console.log('caught error?', err)
          }
        }
      } else {

        const existing = _.filter(annotManager.getAnnotationsList(), (a) => a.CustomData && a.CustomData.id == annotId);
        if (!_.isEmpty(existing)){
          return;
        }

        annotations = await annotManager.importAnnotations(xfdf);
        const [annot] = annotations;
        if (!annot){
          console.log('no annot rendered', annot);
          return;
        }

        annot.CustomData = annot.custom = _.omit(annot, ['xfdf']);
        annot.getField().setValue(val.fieldValue || '');
        await annotManager.handleDeleteDuplicateWidgets();
        if (annot){
          annot.CustomData.id = annotId;
          if (annot) {
            try {
              await annot.resourcesLoaded();
              await annotManager.redrawAnnotation(annot);
            } catch (err) {
              console.log('caught error?', err);
            }
          }
        }
      }
      return annotations;
    })

    const locked = exports.getLock();
    if (locked) {
      annotManager.hideAnnotations(annotations);
    }

    annotManager.trigger('updateAnnotationPermission');
    return cb();
  }



  /**
   * 
   * @param {WebViewerInstance} instance 
   */
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


  const handleAddRemoveBlankPages = (instance) => {
    const { PDFNet } = instance;

    const addBlankPage = async (numPages, cb) => {
      await PDFNet.initialize();
      const doc = instance.docViewer.getDocument();
      if (!doc) {
        console.log('no doc, returning');
        if (_.isFunction(cb)){
          return cb();
        }
        return;
      }

      const pdfDoc = await doc.getPDFDoc();
      await PDFNet.startDeallocateStack();
      const pageCount = await pdfDoc.getPageCount();
      const originalPageCount = await instance.getOriginalPageCount();
      const pagesToAdded = numPages - (pageCount - originalPageCount);

      if (pagesToAdded === 0){
        if (_.isFunction(cb)){
          return cb();
        }
        return;
      }
      if (pagesToAdded > 0){
        await doc.insertBlankPages(_.range(pageCount + 1, pageCount + pagesToAdded + 1));
      }
      if (pagesToAdded < 0){
        await doc.removePages(_.range(pageCount + pagesToAdded + 1, pageCount + 1));
      }

      await PDFNet.endDeallocateStack();
      if (_.isFunction(cb)){
        return cb();
      }
    }

    return _.debounce(addBlankPage, 1000, { trailing: true });
  }

  // window.addEventListener('viewerLoaded', async () => {
  window.addEventListener('viewerLoaded', async () => {
    const { readerControl } = exports;
    const { docViewer } = exports.readerControl;

    const { Actions, Annotations, CoreControls, PartRetrievers, PDFNet, Tools, utils } = exports;
    const annotManager = docViewer.getAnnotationManager();

    
    // extend webviewer instance w/ more functions and pass to react via `docViewer.on('ready', instance);`
    const instance = { 
      ...exports.readerControl, 
      Actions,
      Annotations, 
      CoreControls,
      Tools, 
      PartRetrievers,
      PDFNet, 
      utils,
      annotManager,
      getDocId: () => exports.getDocId(),
      getRunId: () => exports.getRunId(),
      setSelectedSigner: (arg) => exports.setSelectedSigner(arg),
      getOriginalPageCount: () => exports.getOriginalPageCount(),
      getPageCount: () => exports.getPageCount(),
      setPageCount: (arg) => exports.setPageCount(arg),
      setCertPdf: exports.setCertPdf,
      getCertPdf: exports.getCertPdf,
      setNotary: exports.setNotary,
      getNotary: exports.getNotary,
      getSigners: exports.getSigners,
      getSigner: exports.getSigner,
      getSignerById: exports.getSignerById,
      setSigners: (signers) => {
        exports.setSigners(signers);
        annotManager.trigger('signersChanged', signers);
      },
    }


    instance.annotManager.handleDeleteDuplicateWidgets = _.debounce(async () => {
      const toDelete = _.chain(annotManager.getAnnotationsList())
        .filter((a) => a instanceof Annotations.WidgetAnnotation)
        .groupBy('CustomData.id')
        .omit(['undefined'])
        .mapValues((vals) => vals.length > 1 ? _.tail(_.reverse(vals)) : null)
        .values()
        .flatten()
        .filter(R.complement(R.isNil))
        .value()

      console.log('handleDelete dupes called', toDelete);
      await instance.annotManager.deleteAnnotations(toDelete, true);
    }, 2000, { leading: false, trailing: true })


    annotManager.getWidgetById = (widgetId) => {
      console.log('Annotations', Annotations);
      const widgetAnnots = _.filter(annotManager.getAnnotationsList(), (annot) => annot instanceof Annotations.WidgetAnnotation);
      const widget = _.find(widgetAnnots, (annot) => annot.CustomData.id === widgetId);
      return widget;
    };

    await extendAnnotations({ ...instance });
    const custom = JSON.parse(exports.readerControl.getCustomData()) || {};
    await configureFeatures(instance, custom)


  




    annotManager.setAnnotationDisplayAuthorMap((annot) => {
      const signers = exports.getSigners();;
      const signer = exports.getSigner();;
      const userId = annotManager.getCurrentUser();

      if (annot instanceof Annotations.WidgetAnnotation) {
        const signerId = _.get(annot, 'CustomData.signerId', annot.Author);
        const signer = exports.getSignerById(userId);
        const rtn = parseName(signer);
        return rtn;
      }

      if (_.get(annot, 'Author')) {
        const user = _.find(signers, { id: annot.Author });

        if (user) {
          return parseName(user);
        }
      }

      const s = _.find(signers, { id: userId });
      if (s) {
        return parseName(s);
      }

      return _.get(annot, 'Author');
    });


    // annotManager.setRedrawThrottle(1000);

    /* 
     * When addBlankPage is triggered. then add a page
     */
    docViewer.on('setBlankPages', handleAddRemoveBlankPages(instance));






    docViewer.getTool('AnnotationCreateSignature')
      .on('annotationAdded', () => {
        console.log('signature/initial annotation added');
        return annotManager.handleDeleteDuplicateWidgets();
      });


    // register events to trigger on annotManager. subscribed by parent component
    // built-in event 
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



    // built-in event 
    annotManager.on('updateAnnotationPermission', _.debounce(async (annotation) => {
      if (annotation){  
        return;
      }
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
            annot.fieldFlags.set('ReadOnly', true);
          } else {
            annot.fieldFlags.set('ReadOnly', false);
          }
        }
      });
    }, 2000, { trailing: true }));


    annotManager.on('setSelectedSigner', (signerId) => {
      exports.setSelectedSigner(signerId);
      annotManager.trigger('selectedSignerChanged', signerId);
    });

    annotManager.on('setCurrentUser', (currentUser) => {
      annotManager.setCurrentUser(currentUser);
      annotManager.trigger('currentUserChanged', currentUser);
    });



    annotManager.on('addSigner', async (args) => exports.addSigner(args));
    annotManager.on('setSigners', async (...args) => {
      exports.setSigners(args)
      annotManager.trigger('signersChanged', args);
    });


    docViewer.on('updateFeatures', configureFeatures(instance));
    docViewer.on('setDocId', (docId) => exports.setDocId(docId));


    // TODO: use this when at v6.3
    readerControl.setColorPalette(['#4B92DB', '#000000']);


    // built-in event 
    readerControl.docViewer.on('documentLoaded', () => {
      return configureFeatures(instance, custom)
    });
   

    // disables hotkeys when document loads
    // built-in event 
    readerControl.docViewer.on('annotationsLoaded', () => {
      readerControl.hotkeys.off();
      readerControl.hotkeys.on('AnnotationEdit');
    });

    // disables hotkeys when annotManager.setCurrentUser() is called
    // built-in event 
    annotManager.on('updateAnnotationPermission', () => {
      readerControl.hotkeys.off();
      readerControl.hotkeys.on('AnnotationEdit');
    });


    exports.CoreControls.disableLogs(true);

    const { loadDocument } = instance;
    const triggerReady = () => docViewer.trigger('ready', { 
      ...instance, 
      loadDocument: (pdfUrl, config) => {
        instance.docViewer.one('documentLoaded', async () => {
          instance.docViewer.trigger('setDocId', config.docId);
          const pageCount = instance.docViewer.getPageCount()
          exports.setPageCount(config.docId, pageCount);
        });

        instance.showMessage('Loading...');
        return loadDocument(pdfUrl, config);
      },
      Annotations, 
    });

    docViewer.on('initReady', triggerReady)
    return triggerReady();

  });
  
})(window);
