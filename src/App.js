import React, { useState } from 'react';
import _ from 'lodash';
import config from './stories/lib/config';
import WebviewerApp from './components/webviewer/collab';
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

const docs = {
  'doc_a': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
  'emortgagelaw': `https://storage.googleapis.com/enl-static-files/local/emortgagelaw.pdf`,
  'ps1583': `https://storage.googleapis.com/enl-static-files/local/ps1583.pdf`,
  'doc_c': 'https://storage.googleapis.com/enl-static-files/local/with_date.pdf',
  'doc_cs': 'https://storage.googleapis.com/enl-static-files/local/cs2.pdf',
};

const notary = {
  id: '1',
  userType: 'admin',
  firstName: 'Joseph',
  lastName: 'Bisaillon',
};

const signers = [{
  id: '2',
  firstName: 'John',
  lastName: 'Gills',
}, {
  id: '3',
  firstName: 'Blake',
  lastName: 'Gills',
}]






function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App({
  user,
  userId,
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


      {/* org-to-consumer use-case */}
      <Route path='/notarization/:nsId/notary/:organizationId'>
        <WebviewerApp
          config={config}
          user={notary}
          userId={notary.id}
          signers={signers}
          signerLocation='local'
          userType='admin'
          isAdminUser={true}
          docs={docs}
          selectedDoc={'-1'}
        />
      </Route>

      <Route path='/notarization/:nsId/consumer/:organizationId'>
        <WebviewerApp
          config={config}
          // primary signer is the user
          // user={signers[0]}
          // userId={signers[0].id}

          userType='signer'

          // signers are all together
          signerLocation='local'
          signers={signers}
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
            <Link to={`/notarization/${data.nsId}/notary/${data.orgId}`}>Notarization Room (Notary)</Link>
          </div>
          <div>
            <Link to={`/notarization/${data.nsId}/consumer/${data.orgId}`}>Notarization Room (Consumer)</Link>
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
