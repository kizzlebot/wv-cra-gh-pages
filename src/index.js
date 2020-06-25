import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {
  BrowserRouter as Router,
} from "react-router-dom";

import { FirebaseProvider } from './lib/hooks/useFirebase';
import { ServerProvider } from './lib/hooks/useServerProvider';
import faker from 'faker';
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css';

const userId = sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : `${Math.floor(Math.random() * 10000000)}`;
sessionStorage.setItem('userId', userId);

const user = (sessionStorage.getItem(userId)) ? JSON.parse(sessionStorage.getItem(userId)) : {
  id: userId,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
}

sessionStorage.setItem(userId, JSON.stringify(user));

const docs = {
  'doc_a': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
  'emortgagelaw': `https://storage.googleapis.com/enl-static-files/local/emortgagelaw.pdf`,
  'ps1583': `https://storage.googleapis.com/enl-static-files/local/ps1583.pdf`,
  'doc_c': 'https://storage.googleapis.com/enl-static-files/local/with_date.pdf',
  'doc_cs': 'https://storage.googleapis.com/enl-static-files/local/cs2.pdf',
};

const signers = [{
  id: '1',
  firstName: 'Joseph',
  lastName: 'Bisaillon',
}, {
  id: '2',
  firstName: 'John',
  lastName: 'Gills',
}, {
  id: '3',
  firstName: 'Blake',
  lastName: 'Gills',
}]




if (process.env.NODE_ENV !== 'production') {
  ReactDOM.render(
    <Router>
      <FirebaseProvider>
        <App 
          userId={userId}
          user={user}
          signers={signers}
          docs={docs}
        />
      </FirebaseProvider>
    </Router>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA



export { default as Webviewer } from './components/webviewer';