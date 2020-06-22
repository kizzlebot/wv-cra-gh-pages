import React, { useEffect } from 'react';
import _ from 'lodash';
import * as R from 'ramda';
import { useGetSetState, useToggle, useEffectOnce } from 'react-use';
import Collab from './collab';
import { withAppStateProvider, useAppState } from '../../lib/hooks/AppState';


function WebviewerApp() {
  const appState = useAppState();

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
          onClick={() => toggleClearAll(true)}
        >
          Clear All Widgets/Annots
        </button>
        <div>{appState.selectedDoc}</div>
      </div>




      <div className="App" style={{ height: '100% !important' }}>
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

export default withAppStateProvider(WebviewerApp);
