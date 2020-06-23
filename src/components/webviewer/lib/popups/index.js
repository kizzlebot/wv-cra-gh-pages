import * as R from 'ramda';

import registerAssignSigner from './assignSigner';
import registerSetRequired from './setRequired';


const registerPopovers = R.pipeP(
  registerAssignSigner,
  registerSetRequired
);

export default registerPopovers;