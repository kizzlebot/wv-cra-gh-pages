import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { FirebaseProvider } from './lib/hooks/useFirebase';
import { ServerProvider } from './lib/hooks/useServerProvider';

const userId = sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : `${Math.floor(Math.random() * 10000000)}`;
sessionStorage.setItem('userId', userId);

if (process.env.NODE_ENV !== 'production') {
  ReactDOM.render(
    <React.StrictMode>
      <FirebaseProvider>
        <ServerProvider 
          config={{ 
            nsId: '8d976a23-b865-4fcd-9165-ddc0aedaf614',
            userId,
            rtdbNamespace:'8d976a23-b865-4fcd-9165-ddc0aedaf614'
          }}
        >
          <App 
            userId={userId}
          />
        </ServerProvider>
      </FirebaseProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA



export { default as Webviewer } from './components/webviewer';