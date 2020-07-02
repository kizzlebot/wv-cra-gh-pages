import React, { useEffect } from 'react';
import Viewer from './viewer';
import useAppState, { withAppStateProvider } from 'lib/hooks/AppState';


function Esign(props){

  const appState = useAppState();
  
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