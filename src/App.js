import React, { useState } from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import WebviewerApp from './components/webviewer';
import WebviewerEsignApp from './components/webviewer/esign';
import { Route, Switch, Link } from 'react-router-dom';
import { useDefault, useLocation } from 'react-use';

const initialData = {
  nsId: '8d976a23-b865-4fcd-9165-ddc0aedaf614',
  orgId: '8d976a23-b865-4fcd-9165-ddc0aedaf614'
};
const defaultData = {
  nsId: '8d976a23-b865-4fcd-9165-ddc0aedaf614',
  orgId: '8d976a23-b865-4fcd-9165-ddc0aedaf614'
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App({
  user,
  userId,
  isAdminUser,
  docs
}) {

  const [data, setData] = useDefault(defaultData, initialData);
  const query = useQuery();


  
  return (
    <Switch>
      <Route path='/v2/:organizationId/rooms/:nsId'>
        <WebviewerApp
          config={config}
          user={user}
          userId={userId}
          isAdminUser={query.get('isAdminUser') === 'true'}
          docs={docs}
          selectedDoc={_.head(_.keys(docs))}
        />
      </Route>

      <Route path='/esign/:nsId'>
        <WebviewerEsignApp
          config={config}
          user={user}
          userId={userId}
          isAdminUser={query.get('isAdminUser') === 'true'}
          docs={docs}
          selectedDoc={_.head(_.keys(docs))}
        />
      </Route>

      <Route path='/notarization/:nsId/notary/:organizationId'>
        <WebviewerApp
          config={config}
          user={user}
          userId={userId}
          isAdminUser={true}
          docs={docs}
          selectedDoc={'-1'}
        />
      </Route>

      <Route path='/notarization/:nsId/consumer/:organizationId'>
        <WebviewerApp
          config={config}
          user={user}
          userId={userId}
          isAdminUser={false}
          docs={docs}
          selectedDoc={'-1'}
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
            <Link to={`/esign/8d976a23-b865-4fcd-9165-ddc0aedaf614`}>Esignature</Link>
          </div>

          <div>
            <Link to={`/v2/${data.nsId}/rooms/${data.orgId}?isAdminUser=true`}>Go to V2 (admin)</Link>
          </div>
          <div>
            <Link to={`/v2/${data.nsId}/rooms/${data.orgId}`}>Go to V2 (non-admin)</Link>
          </div>

          <hr />

          <div>
            <Link to={`/notarization/${data.nsId}/consumer/${data.orgId}`}>Notarization Room (Consumer)</Link>
          </div>
          <div>
            <Link to={`/notarization/${data.nsId}/notary/${data.orgId}`}>Notarization Room (Notary)</Link>
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
