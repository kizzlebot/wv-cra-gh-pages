import React from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import { useGetSetState, useToggle } from 'react-use';
import WebviewerApp from './components/webviewer';


function App({ 
  userId, 
  isAdminUser,
  docs
}) {
  return (
    <WebviewerApp
      config={config}
      userId={userId} 
      isAdminUser={isAdminUser}
      docs={docs}
    />
  )
}

export default App;
