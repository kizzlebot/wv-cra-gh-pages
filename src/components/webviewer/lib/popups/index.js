import * as R from 'ramda';

import registerAssignSigner from './assignSigner';
import registerSetRequired from './setRequired';


const registerPopups = R.pipeP(
  registerAssignSigner,
  registerSetRequired
);

export default registerPopups;