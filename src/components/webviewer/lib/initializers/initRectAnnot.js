import * as R from 'ramda';
import defineAnnotClass from './defineAnnotClass';






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
 * 
 * Tool (mouseDown) -> CustomRect Annot -> Tool.on('annotationAdded') -> createFreeText() -> FreeText
 */
export const initRectAnnot = (name, customData) => R.pipeP(
  defineAnnotClass({
    className: `${name}FreeTextAnnot`,
    baseClassName: 'FreeTextAnnotation' ,
    customData
  }),
  defineAnnotClass({
    className: `${name}RectAnnot`,
    baseClassName: 'RectangleAnnotation' ,
    customData
  }),
)


export default initRectAnnot;