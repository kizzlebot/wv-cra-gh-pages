
/**
 * imports annotations pushed from firebase for non-widget annotations via importAnnotCommand
 */
export const importFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  console.log('annotation created/modified');
  if (selectedDoc !== val.docId){
    console.log('selectedDoc !== val.docId', { selectedDoc, docId: val.docId })
    return;
  }

  // Import the annotation based on xfdf command
  const [annotation] = await annotManager.importAnnotCommand(val.xfdf);
  if (annotation) {
    await annotation.resourcesLoaded();
    // Set a custom field authorId to be used in client-side permission check
    annotation.authorId = annotation.Author = val.authorId;
    annotation.CustomData = { ...annotation.CustomData, ...val };
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
  if (widget){
    annotManager.deleteAnnotation(widget, true, true, false);
  }
};



/**
 * Imports widget annot pushed from firebase into webviewer if it doesn't already exist
 */
export const importWidgetFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  if (selectedDoc !== val.docId){
    console.log('selectedDoc !== val.docId', { selectedDoc, docId: val.docId })
    return;
  }

  const widget = annotManager.getWidgetById(key);
  if (!widget){
    const [annotation] = await annotManager.importAnnotations(val.xfdf);
    if (annotation) {
      await annotation.resourcesLoaded();
      // Set a custom field authorId to be used in client-side permission check
      annotation.authorId = annotation.Author = val.authorId;
      annotation.CustomData = { ...annotation.CustomData, ...val };
      annotManager.redrawAnnotation(annotation);
    }
  }
}
