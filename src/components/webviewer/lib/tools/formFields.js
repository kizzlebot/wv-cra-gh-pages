import * as R from 'ramda';
import _ from 'lodash';
import registerTool from "../initializers/registerTool";

import applyFormFieldCreate from '../actions/applyFormFieldCreate';
import initRectAnnot from '../initializers/initRectAnnot';
import registerAnnotationType from "../initializers/registerAnnotationType";
import { setHeaderItems, toHeaderGroup, injectHeaderItem, registerHeaderGroup } from "../initializers/injectors";
import defineToolClass from '../initializers/defineToolClass';
import createTextField from '../actions/createTextField';

const sigToolImg = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="svg-inline--fa fa-signature fa-w-20 fa-xs"><path fill="currentColor" d="M623.2 192c-51.8 3.5-125.7 54.7-163.1 71.5-29.1 13.1-54.2 24.4-76.1 24.4-22.6 0-26-16.2-21.3-51.9 1.1-8 11.7-79.2-42.7-76.1-25.1 1.5-64.3 24.8-169.5 126L192 182.2c30.4-75.9-53.2-151.5-129.7-102.8L7.4 116.3C0 121-2.2 130.9 2.5 138.4l17.2 27c4.7 7.5 14.6 9.7 22.1 4.9l58-38.9c18.4-11.7 40.7 7.2 32.7 27.1L34.3 404.1C27.5 421 37 448 64 448c8.3 0 16.5-3.2 22.6-9.4 42.2-42.2 154.7-150.7 211.2-195.8-2.2 28.5-2.1 58.9 20.6 83.8 15.3 16.8 37.3 25.3 65.5 25.3 35.6 0 68-14.6 102.3-30 33-14.8 99-62.6 138.4-65.8 8.5-.7 15.2-7.3 15.2-15.8v-32.1c.2-9.1-7.5-16.8-16.6-16.2z" class=""></path></svg>';
const initialsToolImg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path style="line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal" d="M 4 2 C 3.0833333 2 2.2747084 2.4949337 1.765625 3.2949219 C 1.2565416 4.0949101 1 5.1833333 1 6.5 C 1 7.3516904 1.210765 8.3886276 1.59375 9.2714844 C 1.7482447 9.6276255 1.9579249 9.9270688 2.1816406 10.208984 C 1.6931863 10.593705 1.0058594 11.189453 1.0058594 11.189453 L 1.4941406 12.060547 C 1.4941406 12.060547 2.3423125 11.365739 3.0390625 10.779297 C 3.2006181 10.844346 3.3158575 11 3.5 11 C 4.7086299 11 6.0232759 10.550267 7.1855469 9.9160156 C 7.2369615 10.127947 7.2777856 10.3428 7.4003906 10.527344 C 7.570451 10.783316 7.9006111 11 8.25 11 C 9.5 11 10.342474 10.086337 10.931641 9.3007812 C 11.226224 8.9080036 11.471651 8.5277989 11.667969 8.2753906 C 11.704689 8.2281766 11.723579 8.2147164 11.755859 8.1777344 C 11.780459 8.2967076 11.806435 8.4024323 11.828125 8.5664062 C 11.861035 8.8152289 11.888875 9.0788805 11.974609 9.3417969 C 12.017479 9.4732551 12.072499 9.6106485 12.193359 9.7460938 C 12.314216 9.8815388 12.535679 10 12.75 10 C 12.964321 10 13.151597 9.904834 13.277344 9.8027344 C 13.403091 9.7006344 13.488417 9.5886361 13.568359 9.4746094 C 13.728244 9.2465559 13.860189 8.9979782 14.005859 8.7675781 C 14.15153 8.5371781 14.307698 8.3311835 14.46875 8.1992188 C 14.629802 8.0672539 14.777462 8 15 8 L 15 7 C 14.535038 7 14.132542 7.1827461 13.835938 7.4257812 C 13.539333 7.6688165 13.330611 7.9628219 13.160156 8.2324219 C 13.038506 8.4248297 12.954436 8.5665504 12.867188 8.7089844 C 12.850917 8.6108604 12.833609 8.5489183 12.818359 8.4335938 C 12.785142 8.1824163 12.755994 7.9145806 12.664062 7.6484375 C 12.618098 7.5153659 12.557372 7.3756552 12.431641 7.2421875 C 12.305909 7.1087198 12.086458 7 11.875 7 C 11.614583 7 11.416351 7.1196691 11.267578 7.2421875 C 11.118806 7.3647059 10.999497 7.5070635 10.878906 7.6621094 C 10.637724 7.9722011 10.398776 8.3419964 10.130859 8.6992188 C 9.5950264 9.4136631 9 10 8.25 10 C 8.2243889 10 8.273299 10.034184 8.2324219 9.9726562 C 8.1915448 9.9111287 8.1264689 9.7438751 8.0859375 9.5097656 C 8.0790483 9.4699734 8.0839638 9.3927021 8.078125 9.3496094 C 9.1396715 8.5863028 10 7.6430458 10 6.5 C 10 6.1696392 9.9219943 5.8190142 9.6972656 5.5175781 C 9.4725369 5.2161421 9.0732333 5 8.625 5 C 8.1239667 5 7.6610568 5.3167577 7.3945312 5.78125 C 7.1280059 6.2457423 7 6.8572318 7 7.625 C 7 8.0576876 7.0398631 8.4613156 7.0625 8.8789062 C 6.0956133 9.4675494 4.9356443 9.8356719 3.9238281 9.9257812 C 4.9821271 8.6877439 6 6.9490011 6 4.625 C 6 4.0940782 5.9034184 3.4933348 5.6074219 2.96875 C 5.3114253 2.4441652 4.7399815 2 4 2 z M 4 3 C 4.3850185 3 4.5635747 3.1547723 4.7363281 3.4609375 C 4.9090816 3.7671027 5 4.2289218 5 4.625 C 5 6.8499703 3.971231 8.4754945 2.9433594 9.5761719 C 2.7938231 9.3856304 2.6404426 9.1697813 2.5117188 8.8730469 C 2.1927036 8.1376536 2 7.1753096 2 6.5 C 2 5.3166667 2.2434584 4.4050899 2.609375 3.8300781 C 2.9752916 3.2550663 3.4166667 3 4 3 z M 8.625 6 C 8.8017667 6 8.8399631 6.0394204 8.8964844 6.1152344 C 8.9530057 6.1910483 9 6.3393608 9 6.5 C 9 6.982014 8.5841956 7.5441947 8.0214844 8.0859375 C 8.0198143 7.9162638 8 7.7984007 8 7.625 C 8 6.9747682 8.1219941 6.5228046 8.2617188 6.2792969 C 8.4014432 6.0357892 8.5010333 6 8.625 6 z M 1 13 L 1 14 L 15 14 L 15 13 L 1 13 z" font-weight="400" font-family="sans-serif" white-space="normal" overflow="visible"/></svg>';
const textToolImg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path style="line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal" d="M 4 2 C 3.0833333 2 2.2747084 2.4949337 1.765625 3.2949219 C 1.2565416 4.0949101 1 5.1833333 1 6.5 C 1 7.3516904 1.210765 8.3886276 1.59375 9.2714844 C 1.7482447 9.6276255 1.9579249 9.9270688 2.1816406 10.208984 C 1.6931863 10.593705 1.0058594 11.189453 1.0058594 11.189453 L 1.4941406 12.060547 C 1.4941406 12.060547 2.3423125 11.365739 3.0390625 10.779297 C 3.2006181 10.844346 3.3158575 11 3.5 11 C 4.7086299 11 6.0232759 10.550267 7.1855469 9.9160156 C 7.2369615 10.127947 7.2777856 10.3428 7.4003906 10.527344 C 7.570451 10.783316 7.9006111 11 8.25 11 C 9.5 11 10.342474 10.086337 10.931641 9.3007812 C 11.226224 8.9080036 11.471651 8.5277989 11.667969 8.2753906 C 11.704689 8.2281766 11.723579 8.2147164 11.755859 8.1777344 C 11.780459 8.2967076 11.806435 8.4024323 11.828125 8.5664062 C 11.861035 8.8152289 11.888875 9.0788805 11.974609 9.3417969 C 12.017479 9.4732551 12.072499 9.6106485 12.193359 9.7460938 C 12.314216 9.8815388 12.535679 10 12.75 10 C 12.964321 10 13.151597 9.904834 13.277344 9.8027344 C 13.403091 9.7006344 13.488417 9.5886361 13.568359 9.4746094 C 13.728244 9.2465559 13.860189 8.9979782 14.005859 8.7675781 C 14.15153 8.5371781 14.307698 8.3311835 14.46875 8.1992188 C 14.629802 8.0672539 14.777462 8 15 8 L 15 7 C 14.535038 7 14.132542 7.1827461 13.835938 7.4257812 C 13.539333 7.6688165 13.330611 7.9628219 13.160156 8.2324219 C 13.038506 8.4248297 12.954436 8.5665504 12.867188 8.7089844 C 12.850917 8.6108604 12.833609 8.5489183 12.818359 8.4335938 C 12.785142 8.1824163 12.755994 7.9145806 12.664062 7.6484375 C 12.618098 7.5153659 12.557372 7.3756552 12.431641 7.2421875 C 12.305909 7.1087198 12.086458 7 11.875 7 C 11.614583 7 11.416351 7.1196691 11.267578 7.2421875 C 11.118806 7.3647059 10.999497 7.5070635 10.878906 7.6621094 C 10.637724 7.9722011 10.398776 8.3419964 10.130859 8.6992188 C 9.5950264 9.4136631 9 10 8.25 10 C 8.2243889 10 8.273299 10.034184 8.2324219 9.9726562 C 8.1915448 9.9111287 8.1264689 9.7438751 8.0859375 9.5097656 C 8.0790483 9.4699734 8.0839638 9.3927021 8.078125 9.3496094 C 9.1396715 8.5863028 10 7.6430458 10 6.5 C 10 6.1696392 9.9219943 5.8190142 9.6972656 5.5175781 C 9.4725369 5.2161421 9.0732333 5 8.625 5 C 8.1239667 5 7.6610568 5.3167577 7.3945312 5.78125 C 7.1280059 6.2457423 7 6.8572318 7 7.625 C 7 8.0576876 7.0398631 8.4613156 7.0625 8.8789062 C 6.0956133 9.4675494 4.9356443 9.8356719 3.9238281 9.9257812 C 4.9821271 8.6877439 6 6.9490011 6 4.625 C 6 4.0940782 5.9034184 3.4933348 5.6074219 2.96875 C 5.3114253 2.4441652 4.7399815 2 4 2 z M 4 3 C 4.3850185 3 4.5635747 3.1547723 4.7363281 3.4609375 C 4.9090816 3.7671027 5 4.2289218 5 4.625 C 5 6.8499703 3.971231 8.4754945 2.9433594 9.5761719 C 2.7938231 9.3856304 2.6404426 9.1697813 2.5117188 8.8730469 C 2.1927036 8.1376536 2 7.1753096 2 6.5 C 2 5.3166667 2.2434584 4.4050899 2.609375 3.8300781 C 2.9752916 3.2550663 3.4166667 3 4 3 z M 8.625 6 C 8.8017667 6 8.8399631 6.0394204 8.8964844 6.1152344 C 8.9530057 6.1910483 9 6.3393608 9 6.5 C 9 6.982014 8.5841956 7.5441947 8.0214844 8.0859375 C 8.0198143 7.9162638 8 7.7984007 8 7.625 C 8 6.9747682 8.1219941 6.5228046 8.2617188 6.2792969 C 8.4014432 6.0357892 8.5010333 6 8.625 6 z M 1 13 L 1 14 L 15 14 L 15 13 L 1 13 z" font-weight="400" font-family="sans-serif" white-space="normal" overflow="visible"/></svg>';
const applySigFieldToolImg = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-signature" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-file-signature fa-w-18 fa-3x"><path fill="currentColor" d="M218.17 424.14c-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34c-6.37 12.78-25.03 11.37-29.48-2.09L144 386.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.75-16.19 54.06-9.7 66 14.16 1.89 3.78 5.49 5.95 9.36 6.26v-82.12l128-127.09V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-40l-128-.11c-16.12-.31-30.58-9.28-37.83-23.75zM384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zm-96 225.06V416h68.99l161.68-162.78-67.88-67.88L288 346.96zm280.54-179.63l-31.87-31.87c-9.94-9.94-26.07-9.94-36.01 0l-27.25 27.25 67.88 67.88 27.25-27.25c9.95-9.94 9.95-26.07 0-36.01z" class=""></path></svg>';
const checkboxToolImg = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-check-square fa-w-14 fa-3x"><path fill="currentColor" d="M400 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48zm-204.686-98.059l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L184 302.745l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.25 16.379 6.25 22.628.001z" class=""></path></svg>';



const createFormFieldTool = (name, buttonImage) => R.pipeP(
  initRectAnnot(name, { 
    type: _.toUpper(name), 
    label: 'Signature' 
  }),
  defineToolClass({
    className: `${_.upperFirst(name)}FieldTool`,
    annotClassName: `${name}RectAnnot`,
    baseClassName: 'GenericAnnotationCreateTool',
    onAnnotationAdded: createTextField({ 
      name, 
      annotClassName: `${name}FreeTextAnnot`, 
    })
  }),
  registerAnnotationType({ 
    elementName: 'formField', 
    annotClassName: `${_.upperFirst(name)}FreeTextAnnot` 
  }),
  registerTool({
    annotClassName: `${_.upperFirst(name)}FreeTextAnnot`,
    toolName: `${_.upperFirst(name)}FieldTool`,
    buttonImage,
    buttonName: `${_.upperFirst(name)}FieldTool`,
    tooltip: `${_.upperFirst(name)} Field Tool`,
  }),
);


const createApplySigFieldTool = R.pipeP(
  defineToolClass({
    className: `ApplySigFieldTool`,
    baseClassName: 'Tool',
    switchIn: applyFormFieldCreate() 
  }),
  registerTool({
    toolName: `ApplySigFieldTool`,
    buttonImage: applySigFieldToolImg,
    buttonName: `applySigFieldFieldTool`,
    tooltip: `Apply Field Tool`,
  }),
)


const registerFormFieldTools = R.pipeP(
  createFormFieldTool('Signature', sigToolImg),
  createFormFieldTool('Initials', initialsToolImg),
  createFormFieldTool('Text', textToolImg),
  createFormFieldTool('Check', checkboxToolImg),
  createApplySigFieldTool,
  toHeaderGroup('formFieldGroup'),
  R.tap(({ ...args }) => console.log('tapped', args)),
  injectHeaderItem({
    type: 'actionButton',
    img: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 40 40" style="enable-background:new 0 0 40 40;" xml:space="preserve"><g><rect x="2.5" y="2.5" style="fill:#C8D1DB;" width="35" height="35"/><g><path style="fill:#66798F;" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"/></g></g><rect x="16" y="18" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="20" style="fill:#788B9C;" width="7" height="1"/><rect x="16" y="10" style="fill:#FFFFFF;" width="18" height="5"/><rect x="6" y="12" style="fill:#788B9C;" width="7" height="1"/><g><rect x="16.5" y="26.5" style="fill:#8BB7F0;" width="17" height="5"/><path style="fill:#4E7AB5;" d="M33,27v4H17v-4H33 M34,26H16v6h18V26L34,26z"/></g></svg>',
    title: 'Form Field Tools',
    dataElement: 'formFieldTools',
    onClick: ({ instance }) => () => instance.setActiveHeaderGroup('formFieldGroup')
  }),
  setHeaderItems({ insertBefore: 'eraserToolButton' }),
  registerHeaderGroup({ groupName: 'formFieldGroup' })
);

export default registerFormFieldTools;