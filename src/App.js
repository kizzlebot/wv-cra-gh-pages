import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import Webviewer from "./components/webviewer";
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';
import config from './lib/config';
import { useServer } from './lib/hooks/useServerProvider';
import { useMap, useQueue } from 'react-use';


const docs = {
  'linearized.pdf': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
  'ack.pdf': 'https://storage.googleapis.com/enl-static-files/local/ack.pdf',
};

function App({ userId, isAdminUser }) {

  const server = useServer();
  const [selectedDocId, setSelectedDocId] = useState();
  const { add, remove, first, last, size } = useQueue();
  // const [annots, {set, setAll, remove, reset}] = useMap({ });



  useEffect(() => {
    setSelectedDocId(_.head(_.keys(docs)))
  }, [])


  return (

    <div className="App h-101" style={{ height: '100% !important' }}>
      <div>
        <label htmlFor='signer'>Doc: </label>
        <select
          value={selectedDocId}
          onChange={(evt) => {
            setSelectedDocId(evt.target.value)
          }}
        >
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

        onAnnotationAdded={(args) => server.createAnnotation(args.id, { ...args, docId: selectedDocId })}
        onAnnotationUpdated={(args) => server.updateAnnotation(args.id, { ...args, docId: selectedDocId })}
        onAnnotationDeleted={(args) => server.deleteAnnotation(args.id, { ...args, docId: selectedDocId })}
        onWidgetAdded={(args) => console.log('widget added', args)}
        onFieldUpdated={(args) => console.log('field changed', args)}

        annotations={{}}
        toImport={first}
        onImported={() => remove()}
        onAnnotationsLoaded={() => {
          server.bind('onAnnotationCreated', ({ val, key }) => add(val)); 
          server.bind('onAnnotationUpdated', ({ val, key }) => add(val)); 
          server.bind('onAnnotationDeleted', ({ val, key }) => add({ ...val, type: 'delete' }));
        }}
        onDocumentUnloaded={() => {
          while(size > 0){
            remove();
          }
          server.unbindAll();
        }}


        selectedSigner={userId}
        selectedDoc={selectedDocId}
        isAdminUser={isAdminUser}
        docs={docs}
        config={config}
        signers={[
          {
            firstName: "james",
            lastName: "Choi",
            id: userId,
            type: 'consumer'
          },
          {
            firstName: "joe",
            lastName: "done",
            id: '2'
          }
        ]}
      />
    </div>
  );
}

export default App;
