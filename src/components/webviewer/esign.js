import React, { useEffect } from 'react';
import * as R from 'ramda';
import _ from 'lodash';
import Viewer from './viewer';
import { useEffectOnce } from 'react-use';
import useAppState, { withAppStateProvider } from 'lib/hooks/AppState';
import debug from 'debug';
const log = debug('esign');


function Esign(props){

  const appState = useAppState();

  useEffect(() => {
    if (appState.selectedDoc){
      // doc changed
    }
  }, [appState.selectedDoc]);

  
  return (
    <Viewer
      config={appState.config}
      toolConfig={{
        toolNames: [],
        popupNames: []
      }}
      currentUser={appState.currentUser}
      isAdminUser={false}
      signers={[]}
      docs={appState.docs}
      selectedDoc={appState.selectedDoc}
      selectedSigner={appState.selectedSigner}
      blankPages={appState.blankPages[appState.getSelectedDoc()]}
    />
  )
}


export default withAppStateProvider(Esign)