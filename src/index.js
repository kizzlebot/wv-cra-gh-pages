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



if (process.env.NODE_ENV !== 'production') {
  ReactDOM.render(
    <Router>
      <FirebaseProvider>
        <App 
          userId={userId}
          user={user}
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