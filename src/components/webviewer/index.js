import React from 'react';
import _ from 'lodash';
import * as R from 'ramda';
import { useToggle, useEffectOnce } from 'react-use';
import Collab from './collab';
import { withAppStateProvider, useAppState } from 'lib/hooks/AppState';
import { withServerProvider, useServer } from 'lib/hooks/useServerProvider';
import { useParams } from 'react-router-dom';


function WebviewerApp() {
  const appState = useAppState();
  const server = useServer();

  const [clearAll, toggleClearAll] = useToggle(false);


  useEffectOnce(() => {
    appState.setSelectedDoc(_.head(_.keys(appState.docs)))
  }, []);
  


  return (
    <>
      <div className="App d-flex flex-column" style={{ height: '100% !important' }}>
        <Collab
          config={appState.config}
          userId={appState.getCurrentUser()}
          isAdminUser={appState.isAdminUser}
          docs={appState.docs}
          selectedDoc={appState.selectedDoc}
          selectedSigner={appState.selectedSigner}
          clearAll={clearAll}
          onAllCleared={() => toggleClearAll(false)}
          onSignersUpdated={(signers) => appState.setSigners(signers)}
        />
      </div>
    </>
  );
}


const composeComponent = R.compose(
  withServerProvider((props) => {
    const { organizationId, nsId } = useParams();

    const rtn = {
      nsId: nsId,
      userId: props.userId,
      user: props.user,
      rtdbNamespace: organizationId,
    }
    return rtn;
  }),
  withAppStateProvider,
)


export default composeComponent(WebviewerApp);
