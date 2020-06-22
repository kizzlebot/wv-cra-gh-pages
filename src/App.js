import React from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import WebviewerApp from './components/webviewer';
import WebviewerVanilla from './components/vanilla';
import { Route, Switch, Link } from 'react-router-dom';


function App({
  user,
  userId,
  isAdminUser,
  docs
}) {

  return (
    <Switch>
      <Route path='/v2/:organizationId/rooms/:nsId'>
        <WebviewerVanilla
          config={config}
          user={user}
          userId={userId}
          isAdminUser={isAdminUser}
          docs={docs}
          selectedDoc={_.head(_.keys(docs))}
        />
      </Route>

      <Route path='/v1/:organizationId/rooms/:nsId'>
        <WebviewerApp
          config={config}
          user={user}
          userId={userId}
          isAdminUser={isAdminUser}
          docs={docs}
          selectedDoc={_.head(_.keys(docs))}
        />
      </Route>

      <Route path='/'>
        <div>
          <div>
            <Link to={`/v1/8d976a23-b865-4fcd-9165-ddc0aedaf614/rooms/8d976a23-b865-4fcd-9165-ddc0aedaf614`}>Go to V1</Link>
          </div>
          <div>
            <Link to={`/v2/8d976a23-b865-4fcd-9165-ddc0aedaf614/rooms/8d976a23-b865-4fcd-9165-ddc0aedaf614`}>Go to V2</Link>
          </div>
        </div>
      </Route>
    </Switch>
  )
}

export default App;
