import * as R from 'ramda';
import enableToolButtons from './initializers/enableToolButtons';
import enablePopups from './initializers/enablePopups';
import registerTools from './tools';
import registerPopups from './popups';
import { injectToolArr } from './initializers/injectors';
import registerPanels from './panels';
import enablePanels from './initializers/enablePanels';



export default R.pipeP(
  injectToolArr,

  registerTools,
  registerPopups,
  registerPanels,

  enablePopups,
  enableToolButtons,
  enablePanels
)