import * as R from 'ramda';
import Promise from 'bluebird';
import _ from 'lodash';



export const applyFormFieldCreate = (name) => async ({ instance, tools, header, ...rest }) => {
  const { PDFNet, docViewer, Annotations, Tools } = instance;
  const annotManager = instance.docViewer.getAnnotationManager();

  Annotations.WidgetAnnotation.getCustomStyles = function (widget) {
    if (widget instanceof Annotations.TextWidgetAnnotation) {
      return {
        'background-color': '#a5c7ff',
        color: 'white',
        border: 'none',
        'font-size': '20px'
      };
    }

    if (widget instanceof Annotations.SignatureWidgetAnnotation) {
      return {
        border: 'none',
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

  const annotations = [...annotManager.getAnnotationsList()];

  const currentDocument = docViewer.getDocument();
  await PDFNet.initialize();
  const pdfDoc = await currentDocument.getPDFDoc();
  const fieldManager = instance.annotManager.getFieldManager();

  const annotationsList = _.filter(annotations, annot => annot.Subject !== 'Widget' && annot instanceof Annotations.FreeTextAnnotation && (!_.isEmpty(annot.custom) || !_.isEmpty(annot.CustomData)));

  const { toDelete: annotsToDelete, toDraw } = await Promise.reduce(annotationsList, async (acc, annot, index) => {
    let field;
    let inputAnnot;

    // if existing annotation has a `custom` property then use its value to convert to our custom annotation
    if (annot.custom) {
      if (annot instanceof Annotations.FreeTextAnnotation && customTypes.indexOf(annot.custom.type) !== -1) { 

        // create flag
        const flags = new Annotations.WidgetFlags();
        if (annot.custom.flags.readOnly) {
          flags.set('ReadOnly', true);
        }
        if (annot.custom.flags.multiline) {
          flags.set('Multiline', true);
        }
        if (annot.custom.flags.required){
          flags.set('Required', annot.custom.flags.required);
        }
        if (annot.custom.flags.edit) {
          flags.set('Edit', annot.custom.flags.edit);
        }


        const runId = instance.getRunId();
        // create a form field based on the type of annotation
        if (annot.custom.type === 'TEXT' || annot.custom.type === 'FORM') {
          const identifier = `form.${runId}.${annot.custom.id}.${annot.custom.author}.${annot.custom.signerId}.${annot.custom.name}`;

          field = new Annotations.Forms.Field(identifier, { type: 'Tx', value: annot.custom.value, flags });
          inputAnnot = new Annotations.TextWidgetAnnotation(field);
        } 

        // ref: https://www.pdftron.com/webviewer/demo/pdf-form-build
        else if (annot.custom.type === 'SIGNATURE' || annot.custom.type === 'INITIALS') {

          const type = (annot.custom.type === 'INITIALS') ? 'initials' : 'signature';
          const identifier = `${type}.${runId}.${annot.custom.id}.${annot.custom.author}.${annot.custom.signerId}.${annot.custom.name}`;
          field = new Annotations.Forms.Field(identifier, { type: 'Sig', value: annot.custom.value, flags });

          
          inputAnnot = new Annotations.BetterSigWidgetAnnotation(field, {
            appearance: '_DEFAULT',
            appearances: {
              _DEFAULT: {
                Normal: { data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC', offset: { x: 100, y: 100, }, },
              },
            },
          }); 

        } 
        
        // ref: https://www.pdftron.com/documentation/web/guides/forms/create-checkbox-field/
        else if (annot.custom.type === 'CHECKBOX' || annot.custom.type === 'CHECK') {
          const identifier = `checkbox.${runId}.${annot.custom.id}.${annot.custom.author}.${annot.custom.signerId}.${annot.custom.name}`;
      
          const font = new Annotations.Font({ name: 'Helvetica' });

          field = new Annotations.Forms.Field(identifier, {
            type: 'Btn',
            value: 'Off',
            flags: flags,
            font: font,
          });
      
          inputAnnot = new Annotations.CheckButtonWidgetAnnotation(field, {
            appearance: 'Off',
            appearances: { Off: {}, Yes: {}, },
          });
        } 
        
        // exit early for other annotations
        else {
          return {
            ...acc,
          };
        }


        inputAnnot.PageNumber = annot.getPageNumber();
        inputAnnot.X = annot.getX();
        inputAnnot.Y = annot.getY();
        inputAnnot.rotation = annot.Rotation;
        if (annot.Rotation === 0 || annot.Rotation === 180) {
          inputAnnot.Width = annot.getWidth();
          inputAnnot.Height = annot.getHeight();
        } else {
          inputAnnot.Width = annot.getHeight();
          inputAnnot.Height = annot.getWidth();
        }
        inputAnnot.custom = inputAnnot.CustomData = { ...annot.custom, ...annot.CustomData, id: annot.Id };
        inputAnnot.Author = annot.custom.name;
        Annotations.WidgetAnnotation.getCustomStyles(inputAnnot);

        annotManager.addAnnotation(inputAnnot, false);
        fieldManager.addField(field);
        return {
          toDraw: [...acc.toDraw, inputAnnot],
          toDelete: [...acc.toDelete, annot],
        }
      }
    }
    return acc;
  }, {
    toDelete: [],
    toDraw: [],
  });

  // await annotManager.addAnnotations(toAdd, false);
  await annotManager.deleteAnnotations(annotsToDelete, true, false, false);
  await annotManager.drawAnnotationsFromList(toDraw);
  await pdfDoc.refreshFieldAppearances();

  
  return instance.setActiveHeaderGroup('default');
};

export default applyFormFieldCreate;