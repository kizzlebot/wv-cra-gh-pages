import React from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import { useGetSetState, useToggle } from 'react-use';
import WebviewerApp from './components/webviewer';
import { Route } from 'react-router-dom';


function App({ 
  userId, 
  isAdminUser,
  docs
}) {
  return (
    <>
      <Route path='/v1'>
        <div>hello world</div>
      </Route>

      <Route path='/v2'>
        <WebviewerApp
          config={config}
          userId={userId} 
          isAdminUser={isAdminUser}
          docs={docs}
        />
      </Route>
    </>
  )
}

export default App;
