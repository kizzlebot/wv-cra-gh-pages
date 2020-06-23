import React from 'react'
import * as R from 'ramda';
import { injectTool } from "../../initializers/injectors";
import RequiredCheckbox from './component';



const registerRequiredCheckbox = R.pipeP(
  injectTool('SetRequired', ({ instance }) => ({
    type: 'customElement',
    title: 'Required',
    render: () => (
      <RequiredCheckbox
        annotManager={instance.annotManager}
        signers={instance.getSigners()}
      />
    ),
  })),
);


export default registerRequiredCheckbox;