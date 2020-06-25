import debug from 'debug';
import _ from 'lodash'

const log = debug('vanilla:lib:helpers:import')

/**
 * imports annotations pushed from firebase for non-widget annotations via importAnnotCommand
 */
export const importFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  log('annotation created/modified');
  if (selectedDoc !== val.docId) {
    log('selectedDoc !== val.docId', {
      selectedDoc,
      annotDocId: val.docId,
      annotId: val.id,
    })
    return;
  }

  log(`importing: ${val.id}`);

  // Import the annotation based on xfdf command
  const [annotation] = await annotManager.importAnnotCommand(val.xfdf);
  if (annotation) {
    await annotation.resourcesLoaded();
    // Set a custom field authorId to be used in client-side permission check
    annotation.authorId = annotation.Author = val.authorId;
    annotation.CustomData = { ...annotation.CustomData, ..._.omit(val, ['xfdf']) };
    annotManager.redrawAnnotation(annotation);
  }
}

/**
 * deletes annot based on value pushed from firebase 
 */
export const delFbaseVal = ({ annotManager }) => async ({ key }) => annotManager.importAnnotCommand(`<delete><id>${key}</id></delete>`);


/**
 * deletes widget annot based on value pushed from firebase if widget exists
 */
export const delWidgetFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  const widget = annotManager.getWidgetById(key);
  if (widget) {
    annotManager.deleteAnnotation(widget, true, true, false);
  }
};

/**
 * Imports widget annot pushed from firebase into webviewer if it doesn't already exist
 */
export const importWidgetFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  if (selectedDoc !== val.docId) {
    log('selectedDoc !== widgetVal.docId', { selectedDoc, docId: val.docId })
    return;
  }

  const widget = annotManager.getWidgetById(key);
  if (!widget) {
    log(`importing widget: ${val.id}`);
    const [annotation] = await annotManager.importAnnotations(val.xfdf);

    if (annotation) {
      await annotation.resourcesLoaded();
      // Set a custom field authorId to be used in client-side permission check
      annotation.authorId = annotation.Author = val.authorId;
      annotation.CustomData = { ...annotation.CustomData, ..._.omit(val, ['xfdf']) };


      if (val.fieldName && val.fieldValue && annotation.getField) {
        const field = annotation.getField();
        if (field && field.value !== val) {
          field.setValue(val.fieldValue);
        }
      }


      annotManager.redrawAnnotation(annotation);
      annotManager.trigger('updateAnnotationPermission', [annotation]);
    }
  } else {
    log(`widget found skipping: ${val.id}`);
  }
};


/**
 * Checks if field exists and if it does will set its value
 */
export const importField = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  const mgr = annotManager.getFieldManager();
  const field = mgr.getField(val.name);
  if (field) {
    field.setValue(val.value);
  }
}


/**
 * Set the number of blank pages
 */
export const setBlankPages = ({ selectedDoc, docViewer }) => async ({ val, key }) => {
  if (selectedDoc !== key) {
    log('setBlankPages: selectedDoc !== val.docId', {});
    return;
  }
  return docViewer.trigger('setBlankPages', [val]);
};


export const lockWebviewer = (instance) => async ({ val }) => {
  instance.docViewer.trigger('setLockStatus', [val]);
  if (!instance.annotManager.getIsAdminUser()){
    return instance.docViewer.lockWebviewer(val);
  }
}



export const setCurrentUser = (instance) => async ({ val }) => {
  console.log('setCurrentUser called', val)
  instance.annotManager.setCurrentUser(val);
};