import React, { useContext, useCallback } from 'react'
import _ from 'lodash';
import * as R from 'ramda';
import { useGetSetState, useGetSet } from 'react-use';
import debug from 'debug';
const log = debug('hooks:AppState');

const AppStateCtx = React.createContext();




const tapFns = R.pipe(
  R.toPairs,
  R.map(
    R.when(
      R.pipe(R.nth(1), _.isFunction),
      R.converge(R.unapply(R.identity), [R.nth(0), ([key, fn]) => R.pipe(R.tap((args) => log(`${key} called`, args)), fn)])
    )
  ),
  R.fromPairs
);



// Provider
export function AppStateProvider({
  children,
  config,
  userId = '-1', 
  isAdminUser,
  runId,
  docs,
  userType,
  signerLocation,
  selectedDoc,
  ...rest
}){

  const [getSigners, setSigners] = useGetSet(null);
  const [getSelectedSigner, setSelectedSigner] = useGetSet(null);
  const [getCurrentUser, setCurrentUser] = useGetSet(userId);
  const [getStatus, setStatus] = useGetSet(userId);
  const [getSelectedDoc, setSelectedDoc] = useGetSet();
  const [getRunId] = useGetSet(runId);
  const [getUserType] = useGetSet(userType);
  const [getSignerLocation] = useGetSet(signerLocation);

  // const [fields, { set: setFieldMap, setAll: setAllFields, remove: removeField, reset: resetFields }] = useMap({});

  const [getBlankPages, setBlankPages] = useGetSetState({});
  const [getAnnotsToImport, setAnnotsToImport] = useGetSet([]);



  const getUsersOnDevice = () => {
    const getUsersOnDevice = R.pipe(
      R.toPairs,
      R.filter(R.pipe(R.nth(1), R.propEq('runId', getRunId()))),
      R.fromPairs
    )
    return getUsersOnDevice(getSigners());
  };



  const context = {
    setBlankPages: (blankPages) => setBlankPages(blankPages),
    setSigners: (signers = {}) => {
      console.log('setSigners called', signers);
      setSigners(_.isNil(signers) ? {} : signers);
    },
    setSelectedSigner: (selectedSigner) => setSelectedSigner(selectedSigner),


    setSelectedDoc: (docId) => setSelectedDoc(docId),
    setAnnotsToImport: (annotsToImport) => setAnnotsToImport(annotsToImport),
    setCurrentUser: (userId) => setCurrentUser(userId),
    setStatus,

    getBlankPages,
    getSigners,
    getSelectedSigner,
    getSelectedDoc,
    getCurrentUser,
    getAnnotsToImport,
    getRunId,
    getStatus,
    getUsersOnDevice,


    // runId is used to identity which users are on the same machine
    usersOnDevice: getUsersOnDevice(),
    status: getStatus(),
    runId: getRunId(),
    blankPages: getBlankPages(),
    signers: getSigners(),
    selectedSigner: getSelectedSigner(),
    selectedDoc: getSelectedDoc(),
    annotsToImport: getAnnotsToImport(),
    currentUser: getCurrentUser(),
    userId: getCurrentUser(),
    isAdminUser,
    config,
    docs,
    userType: getUserType(),
    signerLocation: getSignerLocation(),
  };

  return (
    <AppStateCtx.Provider value={tapFns(context)}>
      {children}
    </AppStateCtx.Provider>
  )
}


// hook
export const useAppState = () => {
  const appState = useContext(AppStateCtx);

  if (!appState){
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return appState;
};




// runId is used to determine which users are on the same machine
const runId = `${Math.floor(Math.random() * 10000)}`;


// HOC
export const withAppStateProvider = (Component) => (props) => {

  return (
    <AppStateProvider {...props} runId={runId}>
      <Component {...props} />
    </AppStateProvider>
  )
};
export const withUseAppState = (Component) => (props) => {
  const appState = useAppState();
  return (
    <Component {...props} appState={appState}/>
  )
}






export default useAppState;