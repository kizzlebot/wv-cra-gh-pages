import React, { useEffect } from 'react';
import _ from 'lodash';
import * as R from 'ramda';
import { useToggle, useEffectOnce } from 'react-use';
import Collab from './collab';
import { withAppStateProvider, useAppState } from '../../lib/hooks/AppState';
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
      <div>
        <label htmlFor='signer'>Doc: </label>
        <select
          value={appState.getSelectedDoc()}
          onChange={R.pipe(R.path(['target', 'value']), appState.setSelectedDoc)}
        >
          <option value={'-1'}>Select a document</option>
          {
            _.map(_.keys(appState.docs), (docId) => {
              return (
                <option key={docId} value={docId}>{docId}</option>
              );
            })
          }
        </select>
      </div>
      <div>
        <button
          type='button'
          onClick={() => server.clearAll()}
        >
          Clear All Widgets/Annots
        </button>
      </div>




      <div className="App" style={{ height: '100% !important' }}>
        <Collab
          config={appState.config}
          userId={appState.getCurrentUser()}
          isAdminUser={appState.isAdminUser}
          docs={appState.docs}
          selectedDocId={appState.selectedDoc}
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
);


export default composeComponent(WebviewerApp);
