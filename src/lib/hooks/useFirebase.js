import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import firebase from '../firebase';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const firebase = useContext(FirebaseContext);
  if (!firebase){
    throw new Error('useFirebase must be used within FirebaseProvider context');
  }
  return firebase;
};

export function FirebaseProvider({ children }) {
  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired
}