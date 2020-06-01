import * as R from 'ramda';
import Promise from 'bluebird';
import _ from 'lodash';
import { xmlFormatter } from '../helpers/xmlFormatter';

const toFullName = R.pipe(
  R.split(' '),
  R.map(R.pipe(_.upperFirst)),
  R.join(' ')
);



const parseName = (user) => {
  const fName = _.get(user, 'firstName', _.get(user, 'user.firstName'));
  const lName = _.get(user, 'lastName', _.get(user, 'user.lastName'));
  return `${_.upperFirst(fName)} ${_.upperFirst(lName)}`;
}





/*
 * Creates tool for creating temporary boxes for widget annotations
 * used in signature/initials sign-here fields, and checkbox form fields
 * returns:
 *   {
 *    instance,
 *    tools: [],
 *    header: [],
 *    toolObject: Tool instance
 *    annotClass: Annotation created by tool
 *   }
 * Creates a RectangleAnnotation and replaces with a FreeTextAnnotation
 */
export const initRectAnnot = (name, ogClassName) => async ({ instance, tools, header, ...rest }) => {
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
        setSigner(id) {
          const signer = instance.getSignerById(id);
          const fullName = parseName(signer);

          this.FillColor = signer.color;
          this.setContents(`${name}: ${fullName}`);
          this.Author = signer.id;
          const customdata = {
            ...this.CustomData,
            label: name,
            signerId: id,
            color: [signer.color.R, signer.color.G, signer.color.B, signer.color.A],
            name: fullName,
          };

          this.setCustomData(customdata);
          this.CustomData = customdata;

          annotManager.redrawAnnotation(this);
        }
      }
    })[className];

    Object.defineProperty(C, 'name', { value: className });
    return C;
  };

  const createFreeText = async (rectAnnot, custom) => {
    const {
      type = (!ogClassName) ? _.toUpper(name) : _.toUpper(`${name}${ogClassName}`),
      value = '',
      flag = false
    } = (custom || {});

    // console.debug('type', type);
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
    const signerId = instance.getSigner();
    const signer = instance.getSignerById(signerId);


    textAnnot.custom = {
      type,
      value,
      flag,
      fieldType: type,
      signerId: signer.id,
      id: rectAnnot.Id,
      color: [signer.color.R, signer.color.G, signer.color.B, signer.color.A],
      author: annotManager.getCurrentUser(),
      name: `${signer?.firstName ? signer.firstName : signer?.user?.firstName} ${signer?.lastName ? signer.lastName : signer?.user?.lastName}`
    };

    _.mapKeys(textAnnot.custom, (val, key) => textAnnot.setCustomData(key, (val || '').toString()));
    textAnnot.CustomData = textAnnot.custom;
    textAnnot.setContents(`${name}: ${toFullName(textAnnot.custom.name)}`);
    textAnnot.FontSize = `${15.0 / zoom}px`;
    textAnnot.FillColor = rectAnnot.FillColor;
    textAnnot.TextColor = new Annotations.Color(0, 0, 0);
    textAnnot.FillColor = new Annotations.Color(...[signer.color.R, signer.color.G, signer.color.B, signer.color.A]);
    textAnnot.StrokeThickness = 1;
    textAnnot.StrokeColor = new Annotations.Color(0, 165, 228);
    textAnnot.TextAlign = 'center';
    textAnnot.PageNumber = rectAnnot.PageNumber || (pageIndex + 1);
    textAnnot.LockedContents = true;


    // TODO: Set the author here
    // textAnnot.Author = annotManager.getCurrentUser();
    await annotManager.deleteAnnotation(rectAnnot, true);
    await annotManager.addAnnotation(textAnnot, true);
    await annotManager.deselectAllAnnotations();
    await annotManager.redrawAnnotation(textAnnot);
    await annotManager.selectAnnotation(textAnnot);
  };


  const createToolClass = (className, RectAnnotClass) => {
    const C = class extends Tools.GenericAnnotationCreateTool {
      constructor(docViewer) {
        super(docViewer, RectAnnotClass);
        this.defaults.FillColor = new Annotations.Color(255, 141, 0, 0.5);
        this.on('annotationAdded', (annot) => createFreeText(annot));
      }
    };

    Object.defineProperty(C, 'name', { value: className });

    C.prototype.mouseLeftDown = Tools.RectangleCreateTool.prototype.mouseLeftDown;
    C.prototype.mouseLeftUp = Tools.RectangleCreateTool.prototype.mouseLeftUp;
    return C;
  };

  const CustomFreeTextAnnot = createAnnotClass(!ogClassName ? `${name}FreeTextAnnot` : ogClassName, Annotations.FreeTextAnnotation);
  const CustomRectAnnot = createAnnotClass(`${name}RectAnnot`, Annotations.RectangleAnnotation);
  const CreateTool = createToolClass(`${name}CreateTool`, CustomRectAnnot);



  const customSignatureTool = new CreateTool(docViewer);

  return {
    ...rest,
    instance,
    tools: [...tools, customSignatureTool],
    header,
    toolObject: customSignatureTool,
    annotClass: CustomRectAnnot,
  };
};



export const initApplySigCreator = (name) => async ({ instance, tools, header, ...rest }) => {
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

  const importXfdf = async (instance, annots) => {

    const currentDocument = docViewer.getDocument();
    
    const pdfDoc = await currentDocument.getPDFDoc();

    // import newly created form fields
    const fdfDoc = await pdfDoc.fdfExtract(PDFNet.PDFDoc.ExtractFlag.e_both);
    const xfdf = await fdfDoc.saveAsXFDFAsString();

    const formatter = xmlFormatter(xfdf);
    const finalXfdf = formatter(_.map(annots, (annot) => annot.CustomData.id));



    
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
                `form.${annot.custom.id}.${
                annot.custom.author
                }.${annot.custom.signerId}.${annot.custom.name}`,
                PDFNet.Field.Type.e_text,
                annot.custom.value,
                ''
              );
            } else if (annot.custom.type === 'SIGNATURE') {
              field = await pdfDoc.fieldCreateFromStrings(
                `signature.${annot.custom.id}.${
                annot.custom.author
                }.${annot.custom.signerId}.${annot.custom.name}`,
                PDFNet.Field.Type.e_signature,
                annot.getContents(),
                ''
              );
            } else if (annot.custom.type === 'INITIALS') {
              field = await pdfDoc.fieldCreateFromStrings(
                `initials.${annot.custom.id}.${
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
                `checkbox.${annot.custom.id}.${
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
            // await annotManager.deleteAnnotation(annot, true, false, false);

            // draw the annotation the viewer
            const page = await pdfDoc.getPage(pageNumber);

            // customize styles of the form field
            Annotations.WidgetAnnotation.getCustomStyles(newAnnot);
            await page.annotPushBack(newAnnot);

            return annot;
          }
        }
      })
    );

    if (annotsToDelete.length > 0) {
      await importXfdf(instance, annotsToDelete);
      Promise.map(annotsToDelete, async (annot) => {
        await annotManager.deleteAnnotations([annot], true, false, false);
      })
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


  return {
    ...rest,
    instance,
    tools: [...tools, customTool],
    header,
    toolObject: customTool,
  };
};


