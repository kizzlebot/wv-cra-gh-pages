import * as R from 'ramda';

import { injectTool } from "../initializers/injectors";

const addBlankPage = {
  type: 'actionButton',
  img: '<svg aria-hidden=\'true\' focusable=\'false\' data-prefix=\'fas\' data-icon=\'plus\' role=\'img\' xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 448 512\' className=\'svg-inline--fa fa-plus fa-w-14 fa-5x\'><path fill=\'currentColor\' d=\'M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z\' className=\'\' /></svg>',
  title: 'Add Blank Page',
  dataElement: 'addPage',
  // TODO: add a handler for docViewer.on('addBlankPage', () =>{})
  onClick: ({ instance }) => async () => {
    const currPageCount = instance.docViewer.getPageCount()
    const originalPageCount = instance.getOriginalPageCount();
    const currDocId = instance.getDocId();
    const currBlankPages = currPageCount - originalPageCount
    return instance.docViewer.trigger('blankPagesAdded', [currDocId, currBlankPages]);
  },
};



const removeBlankPage = {
  type: 'actionButton',
  img: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-minus fa-w-14 fa-3x"><path fill="currentColor" d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>',
  title: 'Remove Page',
  dataElement: 'removePage',
  // TODO: add a handler for docViewer.on('removeBlankPage', () =>{})
  onClick: ({ instance }) => async () => {
    const currPageCount = instance.docViewer.getPageCount()
    const originalPageCount = instance.getOriginalPageCount();
    const currDocId = instance.getDocId();
    const currBlankPages = currPageCount - originalPageCount
    return instance.docViewer.trigger('blankPagesRemoved', [currDocId, currBlankPages]);
  },
};


const createStampAnnotTool = R.pipeP(
  injectTool('AddBlankPage', addBlankPage),
  injectTool('RemoveBlankPage', removeBlankPage),
);

export default createStampAnnotTool;