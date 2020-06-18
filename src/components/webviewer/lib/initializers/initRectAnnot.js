import * as R from 'ramda';
import defineAnnotClass from './defineAnnotClass';






/*
 * A template field or form field annotation (pre applied) is created as such:
 *  1. On mouseDown/mouseMove we are drawing a `RectangleAnnotation`
 *  2. On mouseUp, we replace the `RectangleAnnotation` with a `FreeTextAnnotation`
 *     containing text determined by properties found in `annot.CustomData`
 * 
 * This function creates extends `RectangleAnnotation` AND `FreeTextAnnotation`, then adds
 * it to toolClasses in pipe
 */
export const initRectAnnot = (name, customData) => R.pipeP(
  defineAnnotClass({
    className: `${name}RectAnnot`,
    baseClassName: 'RectangleAnnotation' ,
    customData
  }),
  defineAnnotClass({
    className: `${name}FreeTextAnnot`,
    baseClassName: 'FreeTextAnnotation' ,
    customData
  }),
)


export default initRectAnnot;