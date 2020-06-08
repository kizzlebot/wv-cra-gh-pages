import React from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import { useGetSetState } from 'react-use';
import Collab from './components/webviewer/collab';


function App({ 
  userId, 
  isAdminUser,
  docs
}) {
  const [getState, setState] = useGetSetState({ 
    selectedDocId: _.head(_.keys(docs)),
    signers: {},
    selectedSigner: null
  });

  return (
    <>
      <div>
        <label htmlFor='signer'>Doc: </label>
        <select
          value={getState().selectedDocId}
          onChange={(evt) => {
            setState({ selectedDocId: evt.target.value })
          }}
        >
          <option value={'-1'}>Select a document</option>
          {
            _.map(_.keys(docs), (docId) => {
              return (
                <option key={docId} value={docId}>{docId}</option>
              );
            })
          }
        </select>
      </div>




      <div className="App" style={{ height: '100% !important' }}>

        <Collab
          config={config}
          userId={userId}
          isAdminUser={isAdminUser}
          docs={docs}
          selectedDocId={getState().selectedDocId}
          selectedSigner={getState().selectedSigner}
          onSignersUpdated={(signers) => setState({
            ...getState(),
            signers: signers,
            selectedSigner: _.head(_.keys(signers))
          })}
        />
      </div>
    </>
  );
}

export default App;
