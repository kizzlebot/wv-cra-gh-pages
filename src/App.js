import React from 'react';
import Webviewer from "./components/webviewer";
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';



function App() {



  return (
    <div className="App h-100" style={{ height: '100% !important' }}>

      <Webviewer
        // selectedDoc={`https://storage.googleapis.com/enl-static-files/local/linearized.pdf`}
        onReady={(viewer) => {
          console.log('viewer', viewer);
        }}
      />

    </div>
  );
}

export default App;
