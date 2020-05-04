import React from 'react';
import Webviewer from "./viewer";
import config from './lib/config';


function WvApp(props) {
  return (
    <Webviewer
      config={config}
      selectedDoc={props.selectedDoc}
      onReady={(viewer) => {
        console.log('viewer ready', viewer);
      }}
    />
  );
}

export default WvApp;
