import React from 'react'
import * as R from 'ramda';
import { injectTool } from "../../initializers/injectors";
import SelectSigner from './component';





const registerAssignSigner = R.pipeP(
  injectTool('AssignSigner', ({ instance }) => ({
    type: 'customElement',
    title: 'Select Signer',
    render: () => (
      <SelectSigner
        annotManager={instance.annotManager}
        instance={instance}
        signers={instance.getSigners()}
      />
    ),
  })),
);


export default registerAssignSigner;