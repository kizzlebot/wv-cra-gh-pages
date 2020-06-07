import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import Webviewer from "./components/webviewer";
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';
import config from './stories/lib/config';
import { useServer } from './lib/hooks/useServerProvider';
import { useMap, useQueue, useGetSetState } from 'react-use';



function App({ 
  signers, 
  userId, 
  isAdminUser,
  docs
}) {

  const server = useServer();
  const { add, remove, first, last, size } = useQueue();
  const [getState, setState] = useGetSetState({ selectedDocId: '-1', signers: {} });



  useEffect(() => {
    server.bind('onAuthorsChanged', ({ val }) => {
      setState({
        ...getState(),
        signers: val
      });
    })

  }, [getState, server, setState])



  return (

    <div className="App h-101" style={{ height: '100% !important' }}>
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

      <Webviewer
        onReady={(viewer) => {
          console.log('onReady', viewer);
        }}

        onAnnotationAdded={(args) => server.createAnnotation(args.id, { ...args, docId: getState().selectedDocId })}
        onAnnotationUpdated={(args) => server.updateAnnotation(args.id, { ...args, docId: getState().selectedDocId })}
        onAnnotationDeleted={(args) => server.deleteAnnotation(args.id, { ...args, docId: getState().selectedDocId })}
        onWidgetAdded={(args) => console.log('widget added', args)}
        onFieldUpdated={(args) => console.log('field changed', args)}

        toImport={first}
        onImported={() => remove()}

        // when document + annotations have loaded. Start listening on firebase
        onAnnotationsLoaded={async (docId) => {
          await Promise.all([
            server.bind('onAnnotationCreated', docId, ({ val, key }) => add(val)),
            server.bind('onAnnotationUpdated', docId, ({ val, key }) => add(val)), 
            server.bind('onAnnotationDeleted', docId, ({ val, key }) => add({ ...val, type: 'delete' }))
          ])
        }}
        // When document is unloaded (`selectedDoc` changed). Clear queue and unbind from firebase
        onDocumentUnloaded={() => {
          while(size > 0){
            remove();
          }
          server.unbindAll();
        }}


        selectedSigner={'1'}
        currentUser={userId}
        selectedDoc={getState().selectedDocId}
        isAdminUser={isAdminUser}
        docs={docs}
        config={config}
        signers={_.values(getState().signers)}
      />
    </div>
  );
}

export default App;
