
export const importFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  console.log('annotation created/modified');
  if (selectedDoc !== val.docId){
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

export const delFbaseVal = ({ annotManager }) => async ({ key }) => annotManager.importAnnotCommand(`<delete><id>${key}</id></delete>`);


export const importWidgetFbaseVal = ({ selectedDoc, annotManager }) => async ({ val, key }) => {
  if (selectedDoc !== val.docId){
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
