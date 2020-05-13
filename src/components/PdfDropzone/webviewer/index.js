import React, { useRef, useEffect } from 'react';
import Webviewer from './viewer';
import config from './lib/config';


function WvApp(props) {
  const wvRef = useRef();


  useEffect(() => {
    if (wvRef.current) {
      wvRef.current.annotManager.setIsAdminUser(props.isAdminUser);
    }
  }, [props.isAdminUser, wvRef]);



  return (
    <Webviewer
      config={config}
      signers={props.signers}
      selectedSigner={props.selectedSigner}
      selectedDoc={props.selectedDoc}
      annotations={props.annotations}
      onAnnotationAdded={props.onAnnotationAdded}
      onAnnotationUpdated={props.onAnnotationUpdated}
      onAnnotationDeleted={props.onAnnotationDeleted}
      docs={props.docs}
      onReady={(instance) => {
        wvRef.current = instance;
        wvRef.current.annotManager.setIsAdminUser(!!props.isAdminUser);
        wvRef.current.annotManager.setReadOnly(!!props.isReadOnly);

        if (props.onReady) {
          return props.onReady(instance);
        }
      }}
    />
  );
}

export default WvApp;
