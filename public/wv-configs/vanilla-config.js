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

  const { Promise, R, _ } = window.parent;
  // eslint-disable-next-line no-unused-vars
  const tapP = (fn) => (args) => Promise.resolve(fn(args)).then(R.always(args));

  const parseName = (user) => {
    const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
    const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));
    return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
  }
  const callIfDefined = R.when(
    R.isNil,
    R.pipe(
      R.tap((val) => console.log('callback not defined', val)),
      R.identity
    )
  )
  
  
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
  exports.getSelectedSigner = () => selectedSigner;
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
    const { serialize: aSerialize, deserialize: aDeserialize } = Annotations.Annotation.prototype;


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

      serialize(...args) {
        const el = serialize.apply(this, args);

        if (this.CustomData.id && el){
          el.setAttribute('orig-id', this.CustomData.id);
        }

        return el;
      }
      deserialize(...args){
        deserialize.apply(this, args);
        const [el] = args;
        this.origId = el.getAttribute('orig-id');
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
      disableElements = [],
      enableElements = [],
      colorPalette = []
    } = config;
    
    // TODO: use this when at v6.3
    if (!_.isEmpty(colorPalette)){
      _.map(colorPalette, instance.setColorPalette);
    }

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
    instance.enableElements([...enableElements]);
    instance.setActiveLeftPanel('thumbnailsPanel');

    return { instance }
  };

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

  // when annotation changed, call annotManger.trigger('annotationupdated'),
  // annotManger.trigger('annotationAdded'), annotManger.trigger('widgetAdded')
  const onAnnotationChanged = (instance) => {


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


    const getAnnotPayload = (annotation, xfdf) => {
      // In case of replies, add extra field for server-side permission to be granted to the
      // parent annotation's author
      let parentAuthorId = 'default';
      if (annotation.InReplyTo) {
        parentAuthorId = instance.annotManager.getAnnotationById(annotation.InReplyTo).authorId || 'default';
      }
      const authorId = instance.annotManager.getCurrentUser()
      return {
        id: annotation.Id,
        authorId,
        parentAuthorId,
        pageNumber: annotation.getPageNumber(),
        docId: exports.getDocId(),
        type: 'annotation',
        createdBy: authorId,
        xfdf
      };
    }



    const extractWidget = (fieldName, xfdf) => {
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
      return `<?xml version="1.0" encoding="UTF-8" ?>${xmlDoc.documentElement.outerHTML}`;
    }



    const getWidgetPayload = (annotation, widgetXfdf) => {
      const field = annotation.getField();
      const fieldName = field.name;

      const [, , id, author, signerId] = fieldName.split('.');
      
      const xfdf = extractWidget(fieldName, widgetXfdf);
      const parentAuthorId = author || 'default';
      const authorId = instance.annotManager.getCurrentUser();
      return {
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
        xfdf: xfdf
      };

    }

    return async (annotations, type, info) => {
      const annotManager = instance.annotManager;

      // info.imported is true by default for annotations from pdf and annotations added by importAnnotCommand
      if (info.imported) {
        return;
      }

      const xfdf = await annotManager.exportAnnotCommand();

      const widgetXfdf = await annotManager.exportAnnotations({
        annotList: annotations,
        widgets: true,
        fields: true,
        links: true
      });
      

      // Iterate through all annotations and call appropriate server methods
      annotations.forEach(annotation => {
        const { shouldContinue } = shouldSendToFbase(annotation, type, info);
        const annotType = annotation instanceof Annotations.WidgetAnnotation ? 'widget' : 'annotation';
        

        if (!shouldContinue) {
          return;
        }

        if (annotType === 'annotation'){
          if (type === 'add') {
            annotManager.trigger('annotationAdded', getAnnotPayload(annotation, xfdf));
          } else if (type === 'modify') {
            annotManager.trigger('annotationUpdated', getAnnotPayload(annotation, xfdf));
          } else if (type === 'delete') {
            annotManager.trigger('annotationDeleted', getAnnotPayload(annotation, xfdf));
          }
        } 
        
        
        else {
          if (!annotation.getField) {
            return;
          }

          if (type === 'add' || type === 'modify') {
            const actionName = (type === 'add') ? 'widgetAdded' : 'widgetUpdated';
            annotManager.trigger(actionName, getWidgetPayload(annotation, widgetXfdf));
          } else if (type === 'delete'){
            annotManager.trigger('widgetDeleted', getWidgetPayload(annotation, widgetXfdf));
          }
        }
      });

      annotManager.trigger('updateAnnotationPermission', annotations);
    }
    
  }



  /**
   * when widget annotations field changed
   */
  const onFieldChanged = (instance) => (field, value) => {
    const { widgets } = field;
    const widget = _.head(_.uniqBy(widgets, 'CustomData.id'));
    instance.annotManager.trigger('fieldUpdated', {
      type: 'field',
      docId: exports.getDocId(),
      name: field.name,
      value: value,
      widget
    })
  }


  const handleSetAnnotationDisplayAuthorMap = (instance) => (annot) => {
    const signers = exports.getSigners();;
    const signer = exports.getSigner();;
    const userId = instance.annotManager.getCurrentUser();

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
  }



  const onSetBlankPages = (instance) => {
    const { PDFNet } = instance;
    // const onSetBlankPages = _.throttle(handleAddRemoveBlankPages(instance), 1200, { trailing: true });
    const setBlankPages = async (numPages, cb) => {
      console.log('set blank pages called');
      await PDFNet.initialize();
      const doc = instance.docViewer.getDocument();
      if (!doc) {
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
        doc.insertBlankPages(_.range(pageCount + 1, pageCount + pagesToAdded + 1));
      }
      if (pagesToAdded < 0){
        // get annotations which are on the blank page
        const pageNumsToRemove = _.range(pageCount + pagesToAdded + 1, pageCount + 1)

        const annotsToDel = _.filter(instance.annotManager.getAnnotationsList(), (annot) => pageNumsToRemove.indexOf(annot.PageNumber) > -1);

        if (annotsToDel.length > 0){
          instance.annotManager.deleteAnnotations(annotsToDel, false, true, false);
        }
        doc.removePages(pageNumsToRemove);
      }

      await PDFNet.endDeallocateStack();
      if (_.isFunction(cb)){
        return cb();
      }
    };
    return _.throttle(setBlankPages, 1200, { trailing: true })
  }


  const onUpdateAnnotationPermission = (instance) => {
    const updateAnnotPerm = (isAdminUser, currUserId, locked) => (annot) => {

      if (annot instanceof instance.Annotations.WidgetAnnotation) {
        const signerId = _.get(annot.getMetadata(), 'signerId');

        // if (isAdminUser) {
        //   annot.fieldFlags.set('ReadOnly', true);
        //   return;
        // }

        if (signerId !== currUserId || locked) {
          annot.fieldFlags.set('ReadOnly', true);
        } else {
          annot.fieldFlags.set('ReadOnly', false);
        }
      }
    }

    return (annotation) => {
      const locked = exports.getLock();
      const currUserId = instance.annotManager.getCurrentUser();
      const isAdminUser = instance.annotManager.getIsAdminUser();
      const updatePerm = updateAnnotPerm(isAdminUser, currUserId, locked);
      const annots = _.filter(_.castArray(annotation), (el) => !_.isNil(el));


      if (annots && !_.isEmpty(annots)) {
        console.debug('updateAnnotationPermission: annotations defined', annots);
        return _.map(annots, updatePerm);
      }

      const allAnnots = instance.annotManager.getAnnotationsList();
      return _.map(allAnnots, updatePerm);
    }
  };

  const onSetCurrentUser = (instance) => (currentUser) => {
    instance.annotManager.setCurrentUser(currentUser);
    instance.annotManager.trigger('currentUserChanged', currentUser);
  };
  const onSetSigners = (instance) => async (...args) => {
    exports.setSigners(args)
    return instance.annotManager.trigger('signersChanged', args);
  };
  
  const onSetLockStatus = (instance) => async (val) => {
    exports.setLock(val);
    instance.docViewer.trigger('lockChanged', [val]);
  }

  const onSetSelectedSigner = (instance) => (signerId) => {
    exports.setSelectedSigner(signerId);
    instance.annotManager.trigger('selectedSignerChanged', signerId);
  };

  // prevent intermediate annotations from being selected in a group so it doesnt synced to firebase
  const onAnnotationSelected = (instance) => (annots, action) => {
    // if group is selected, dont mix intermediate annots which shouldnt be synced between signers
    if (action === 'selected' && annots.length > 1){
      const intermediates = _.filter(annots, isIntermediateField);
      if (intermediates.length > 0){
        // all arent intermediate fields. continue
        if (intermediates.length !== annots.length) {
          instance.annotManager.deselectAllAnnotations()
        }
      }
    }
  };


  const buildGetAnnotationCopy = (instance) => {
    const { getAnnotationCopy } = instance.annotManager;
    return (annotation) => {
      const annot = getAnnotationCopy.call(instance.annotManager, annotation);
      annot.CustomData = { ...annotation.CustomData };
      if (annotation.Subject === 'Signature'){
        annot.CustomData.sigType = annotation.CustomData.type;
      }

      console.log('get annotation copy called', { annotation: annotation.CustomData, annot: annot.CustomData });
      annot.CustomData.authorId = instance.annotManager.getCurrentUser();
      return annot;
    };
  }

  const buildHandleDeleteDuplicateWidgets = (instance) => _.debounce(async () => {
    const toDelete = _.chain(instance.annotManager.getAnnotationsList())
      .filter((a) => a instanceof Annotations.WidgetAnnotation)
      .groupBy('CustomData.id')
      .omit(['undefined'])
      .mapValues((vals) => vals.length > 1 ? _.tail(_.reverse(vals)) : null)
      .values()
      .flatten()
      .filter(R.complement(R.isNil))
      .value()

    await instance.annotManager.deleteAnnotations(toDelete, true);
  }, 2000, { leading: false, trailing: true });

  const buildGetWidgetById = (instance) => (widgetId) => {
    const widgetAnnots = _.filter(instance.annotManager.getAnnotationsList(), (annot) => annot instanceof instance.Annotations.WidgetAnnotation);
    const widget = _.find(widgetAnnots, (annot) => annot.CustomData.id === widgetId);
    return widget;
  };

  const buildDisableHotKeys = (instance) => () => {
    instance.hotkeys.off();
    instance.hotkeys.on('AnnotationEdit');
  }


  const createEnableDisableTools = (instance) => (disable) => instance.setHeaderItems((header) => {
    _.chain(header.headers.default)
      .map('dataElement')
      .filter(R.complement(_.isNil))
      .forEach((dataEl) => {
        instance.updateElement(dataEl, { disable: disable });
      })
      .value()
  
    instance.annotManager.setReadOnly(disable)
  })
  


  /**
   * When viewerLoaded fires, configures features and adds additional functions to WebViewerInstance before calling
   * `docViewer.trigger('ready', [instance]);` to pass up customized WebViewerInstance to the react component
   */
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
      getSelectedSigner: () => exports.getSelectedSigner(),
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
      getLock: exports.getLock,
      setLock: exports.setLock,
      setSigners: (signers) => {
        exports.setSigners(signers);
        annotManager.trigger('signersChanged', signers);
      },
      showMessage: callIfDefined(readerControl.showMessage),
      hideMessage: callIfDefined(readerControl.hideMessage),
      toggleTools: createEnableDisableTools({ ...readerControl, annotManager }),
    }

    

    docViewer.lockWebviewer = (disable) => {
      instance.toggleTools(disable);
      if (disable) {
        instance.showMessage('Notary Editing..');
      } else {
        instance.hideMessage();
      }
    }

    
    instance.annotManager.handleDeleteDuplicateWidgets = buildHandleDeleteDuplicateWidgets(instance);
    instance.annotManager.getWidgetById = buildGetWidgetById(instance)



    await extendAnnotations({ ...instance });
    const custom = JSON.parse(exports.readerControl.getCustomData()) || {};
    await configureFeatures(instance, custom)


  
    // preserve custom data from signature
    const sigTool = instance.docViewer.getTool('AnnotationCreateSignature');


    // when an signature annotation is copied in webviewer-ui code, it doesn't copy over the CustomData. So extend this
    // instance.annotManager.getAnnotationCopy = buildGetAnnotationCopy(instance);


    // this handles gettings the name of the author based on authorId
    annotManager.setAnnotationDisplayAuthorMap(handleSetAnnotationDisplayAuthorMap(instance));



    // when a signature/initial is added remove duplicate widgets
    sigTool.on('annotationAdded', annotManager.handleDeleteDuplicateWidgets);












    /* 
     * register listeners
     */

    instance.docViewer.on('setBlankPages', onSetBlankPages(instance));
    instance.docViewer.on('setLockStatus', onSetLockStatus(instance));
    // disables hotkeys when document loads
    instance.docViewer.on('annotationsLoaded', buildDisableHotKeys(instance));
    instance.annotManager.on('updateAnnotationPermission', () => {
      instance.hotkeys.off();
      instance.hotkeys.on('AnnotationEdit');
    });

    instance.docViewer.on('removeFormFields', () => instance.docViewer.trigger('formFieldsRemoved'));
    instance.docViewer.on('removeAllAnnots', () => instance.docViewer.trigger('allAnnotsRemoved'));

    // register events to trigger on annotManager. subscribed by parent component
    instance.annotManager.on('annotationChanged', onAnnotationChanged(instance));
    instance.annotManager.on('annotationSelected', onAnnotationSelected(instance));


    instance.annotManager.on('updateAnnotationPermission', onUpdateAnnotationPermission(instance));
    instance.annotManager.on('fieldChanged', onFieldChanged(instance))

    instance.annotManager.on('setSelectedSigner', onSetSelectedSigner(instance));
    instance.annotManager.on('setCurrentUser', onSetCurrentUser(instance));

    instance.annotManager.on('addSigner', async (args) => exports.addSigner(args));
    instance.annotManager.on('setSigners', onSetSigners(instance));
    instance.docViewer.on('setDocId', (docId) => exports.setDocId(docId));
   












    
    // exports.CoreControls.disableLogs(true);
    const { loadDocument } = instance;
    const triggerReady = () => docViewer.trigger('ready', { 
      ...instance, 
      loadDocument: (pdfUrl, config) => {
        instance.docViewer.one('documentLoaded', async () => {
          const pageCount = instance.docViewer.getPageCount()
          exports.setPageCount(config.docId, pageCount);
          instance.hideMessage('Loading...');
          const isAdmin = instance.annotManager.getIsAdminUser();
          if (!isAdmin){
            const isLocked = exports.getLock();
            docViewer.lockWebviewer(isLocked);
          }
          
          return configureFeatures(instance, custom)
        });

        instance.showMessage('Loading...');
        instance.docViewer.trigger('setDocId', config.docId);
        return loadDocument(pdfUrl, config);
      },
      Annotations, 
    });

    docViewer.on('initReady', triggerReady)
    return triggerReady();

  });
  
})(window);
