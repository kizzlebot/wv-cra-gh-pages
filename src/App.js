import React, { useState } from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import WebviewerApp from './components/webviewer';
import { Route, Switch, Link } from 'react-router-dom';
import {useDefault} from 'react-use';

const initialData = {
  nsId: '8d976a23-b865-4fcd-9165-ddc0aedaf614',
  orgId: '8d976a23-b865-4fcd-9165-ddc0aedaf614'
};
const defaultData = {
  nsId: '8d976a23-b865-4fcd-9165-ddc0aedaf614',
  orgId: '8d976a23-b865-4fcd-9165-ddc0aedaf614'
}


function App({
  user,
  userId,
  isAdminUser,
  docs
}) {

  const [data, setData] = useDefault(defaultData, initialData);

  return (
    <Switch>
      <Route path='/v2/:organizationId/rooms/:nsId'>
        <WebviewerApp
          config={config}
          user={user}
          userId={userId}
          isAdminUser={isAdminUser}
          docs={docs}
          selectedDoc={_.head(_.keys(docs))}
        />
      </Route>

      <Route path='/notarization/:nsId/notary'>
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
          <div className='d-flex flex-column pt-5'>
            <span>Id: {user.id}</span>
            <span>Last Name: {user.lastName}</span>
            <span>First Name: {user.firstName}</span>
          </div>
          <div className='d-flex flex-column pt-5'>
            <div>Notary Session Id</div>
            <input 
              value={data.nsId}
              onChange={(e) => setData({ nsId: e.target.value })} 
            />
          </div>
          <div className='d-flex flex-column pt-5'>
            <div>Organization Id</div>
            <input 
              value={data.orgId}
              onChange={(e) => setData({ orgId: e.target.value })} 
            />
          </div>
        </div>
        
        <div className='d-flex flex-column mt-5'>
          <div>
            <Link to={`/v2/8d976a23-b865-4fcd-9165-ddc0aedaf614/rooms/8d976a23-b865-4fcd-9165-ddc0aedaf614`}>Go to V2</Link>
          </div>
          <hr />
          <div>
            <Link to={`/notarization/${data.nsId}/consumer?orgId=${data.orgId}`}>Notarization Room (Consumer)</Link>
          </div>
          <div>
            <Link to={`/notarization/${data.nsId}/notary?orgId=${data.orgId}`}>Notarization Room (Notary)</Link>
          </div>

          <hr />
          <div>
            <Link to={`/notarization/${data.nsId}/room/consumer?orgId=${data.orgId}`}>Org-to-Org Notarization Room (Consumer)</Link>
          </div>
          <div>
            <Link to={`/notarization/${data.nsId}/room/notary?orgId=${data.orgId}`}>Org-to-Org Notarization Room (Notary)</Link>
          </div>
        </div>
      </Route>
    </Switch>
  )
}

export default App;
