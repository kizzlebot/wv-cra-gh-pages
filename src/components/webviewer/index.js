import React from 'react';
import _ from 'lodash';
import * as R from 'ramda';
import Collab from './collab';
import { withAppStateProvider, useAppState } from 'lib/hooks/AppState';
import { withServerProvider, useServer } from 'lib/hooks/useServerProvider';
import { useParams } from 'react-router-dom';
import * as toolConfigs from './lib/configs';


function WebviewerApp({ userType }) {
  return (
    <>
      <Collab 
        toolConfig={toolConfigs[userType]}
      />
    </>
  );
}


const composeComponent = R.compose(
  withServerProvider((props) => {
    const { organizationId, nsId } = useParams();

    return {
      nsId: nsId,
      rtdbNamespace: organizationId,
      signers: props.signers,
      signerLocation: props.signerLocation,  
      userId: props.userId,
      user: props.user,
      userType: props.userType
    }
  }),
  withAppStateProvider,
)


export default composeComponent(WebviewerApp);
