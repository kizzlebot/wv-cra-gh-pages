import React from 'react';
import Webviewer from "./components/webviewer";
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';

const config = '/config.js';

function App() {
  return (
    <div className="App h-100">

      <Webviewer
        config={{
          l: 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7',
          path: `${process.env.PUBLIC_URL}/lib`,
          fullAPI: true,
          initialDoc: `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
          config: config ? `${process.env.PUBLIC_URL}${config}` : undefined,
          custom: {
            name: "James"
          }
        }}
        selectedDoc={`https://storage.googleapis.com/enl-static-files/local/linearized.pdf`}
        onReady={(viewer) => {
          console.log('viewer', viewer);
        }}
      />

    </div>
  );
}

export default App;
