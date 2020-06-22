import React, { useEffect, useReducer, useContext } from 'react';
import { useFirebase } from '../useFirebase';

export const ServerCtx = React.createContext();

const reducer = (state = null, action) => {
  switch (action.type) {
    case 'set':
      return action.payload;
    default:
      return state;
  }
};

let wvmod = null;


// Provider
export function ServerProvider({ config, ...props }) {
  const [server, dispatch] = useReducer(reducer, null);
  const firebase = useFirebase();


  useEffect(() => {
    const importServer = async () => {
      if (wvmod || server) {
        dispatch({ type: 'set', payload: wvmod || server });
  
        return wvmod;
      }
  
      const { default: createServer } = await import('./server');
      const _server = wvmod = await createServer(firebase, { ...config });
      window.server = _server;
  
      dispatch({ type: 'set', payload: _server });
  
      return _server;
    };
  
    if (!server && firebase && (config.userId || config.mode === 'request')) {
      importServer();
    }

    return () => {
      if (server) {
        // return server.markAsDisconnected()
      }
    };
  }, [server, firebase, config.userId, config.mode, config]);



  return (
    <ServerCtx.Provider value={server}>
      {server && props.children}
    </ServerCtx.Provider>
  );
}


// hook
export const useServer = () => {
  const server = useContext(ServerCtx);
  if (!server){
    throw new Error('useServer must be called within <ServerProvider/> context');
  }
  return server;
};



// HOC
export const withServerProvider = (useConfig) => (Component) => function WithServerProvider(props) {
  const conf = useConfig(props);

  return (
    <ServerProvider config={conf}>
      <Component {...props} />
    </ServerProvider>
  );
};

export const withUseServer = (Component) => (props) => {
  const server = useServer();
  return (
    <Component {...props} server={server} />
  )
};


