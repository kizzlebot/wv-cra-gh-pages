import * as R from 'ramda';

import registerTestPanel from './testPanel';


const registerPanels = R.pipeP(
  registerTestPanel,
);

export default registerPanels;