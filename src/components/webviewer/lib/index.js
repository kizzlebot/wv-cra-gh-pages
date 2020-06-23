import * as R from 'ramda';
import enableToolButtons from './initializers/enableToolButtons';
import enablePopups from './initializers/enablePopups';
import registerTools from './tools';
import registerPopups from './popups';
import { injectToolArr } from './initializers/injectors';



export default R.pipeP(
  injectToolArr,
  registerTools,
  registerPopups,
  enableToolButtons,
  enablePopups,
)