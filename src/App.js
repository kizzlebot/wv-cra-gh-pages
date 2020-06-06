import React from 'react';
import Webviewer from "./components/webviewer";
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';
import config from './lib/config';



function App() {



  return (
    <div className="App h-101" style={{ height: '100% !important' }}>

      <Webviewer
        // selectedDoc={`https://storage.googleapis.com/enl-static-files/local/linearized.pdf`}
        onReady={(viewer) => {
          console.log('onReady', viewer);
          
        }}

        onAnnotationAdded={(args) => console.log('annotation added', args)}
        onAnnotationUpdated={(args) => console.log('annotation updated', args)}
        onAnnotationDeleted={(args) => console.log('annotation deleted', args)}
        onWidgetAdded={(args) => console.log('widget added', args)}
        onFieldUpdated={(args) => console.log('field changed', args)}



        selectedSigner={'1'}
        selectedDoc={'linearized.pdf'}
        isAdminUser
        docs={{
          'linearized.pdf': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
          'ack.pdf': 'https://storage.googleapis.com/enl-static-files/local/ack.pdf',
        }}
        config={config}
        signers={[
          {
            firstName: "james",
            lastName: "Choi",
            id: '1',
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
