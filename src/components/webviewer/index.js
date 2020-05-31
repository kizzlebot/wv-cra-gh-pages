import React, { useRef, useEffect } from 'react';
import Webviewer from "./viewer";


function WvApp(props) {
  const wvRef = useRef();

  const { current } = wvRef;
  
  useEffect(() => {
    if (current && props.isAdminUser) {
      current.annotManager.setIsAdminUser(props.isAdminUser);
    }
  }, [props.isAdminUser, current])



  return (
    <Webviewer
      {...props}
      onReady={(instance) => {
        wvRef.current = instance;
        wvRef.current.annotManager.setIsAdminUser(props.isAdminUser);
        if (props.onReady) {
          return props.onReady(instance)
        }
      }}
    />
  );
}

export default WvApp;
