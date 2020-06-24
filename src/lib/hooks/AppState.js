import React, { useContext, useCallback } from 'react'
import _ from 'lodash';
import * as R from 'ramda';
import { useGetSetState, useGetSet, useMap } from 'react-use';
import debug from 'debug';
const log = debug('hooks:AppState');

const AppStateCtx = React.createContext();




const tapFns = R.pipe(
  R.toPairs,
  R.map(
      R.when(
        R.pipe(R.nth(1), _.isFunction),
        R.converge(R.unapply(R.identity), [R.nth(0), ([key, fn]) => R.pipe(R.tap(() => log(`${key} called`)), fn)])
      )
  ),
  R.fromPairs
);



// Provider
export function AppStateProvider({
  children,
  config,
  userId, 
  isAdminUser,
  docs
}){
  const [getState, setState] = useGetSetState({ pageNumber: {}, signers: {}, fields: {} });

  const [getSigners, setSigners] = useGetSetState({ });
  const [getSelectedSigner, setSelectedSigner] = useGetSet(null);
  const [getCurrentUser, setCurrentUser] = useGetSet(userId);
  const [getSelectedDoc, setSelectedDoc] = useGetSet();

  const [getPageNumbers, setPageNumbers] = useGetSetState(_.mapValues(docs, () => 1));
  const [getFields, setFields] = useGetSetState({ });
  // const [fields, { set: setFieldMap, setAll: setAllFields, remove: removeField, reset: resetFields }] = useMap({});

  const [getBlankPages, setBlankPages] = useGetSetState({});
  const [getAnnotsToImport, setAnnotsToImport] = useGetSet([]);



  const upsertAnnot = useCallback((toAdd) => {
    let allAnnots = getAnnotsToImport();
    const i = _.findIndex(allAnnots, (b) => b.id === toAdd.id);
    if (i > -1){
      log('upserting', toAdd, allAnnots.length)
      allAnnots[i] = toAdd;
    } else {
      log('adding', toAdd, allAnnots.length)
      allAnnots = [...allAnnots, toAdd];
    }
    return setAnnotsToImport(allAnnots);
  }, [getAnnotsToImport, setAnnotsToImport]);


  const updateFields = useCallback((val) => setFields({ ...getFields(), ...val }), [getFields, setFields]);



  const context = {
    setBlankPages: (blankPages) => setBlankPages(blankPages),
    setSigners: (signers) => {
      setSigners(signers)
    },
    setPageNumbers: (pageNumbers) => setPageNumbers(pageNumbers),

    setSelectedSigner: (selectedSigner) => setSelectedSigner(selectedSigner),

    setFields: (fields) => setFields(fields),
    updateFields,

    setSelectedDoc: (docId) => setSelectedDoc(docId),
    setAnnotsToImport: (annotsToImport) => setAnnotsToImport(annotsToImport),
    setCurrentUser: (userId) => setCurrentUser(userId),

    getBlankPages,
    getSigners,
    getPageNumbers,
    getSelectedSigner,
    getFields,
    getSelectedDoc,
    getCurrentUser,
    getAnnotsToImport,
    upsertAnnot,


    blankPages: getBlankPages(),
    signers: getSigners(),
    pageNumbers: getPageNumbers(),
    selectedSigner: getSelectedSigner(),
    fields: getFields(),
    selectedDoc: getSelectedDoc(),
    annotsToImport: getAnnotsToImport(),
    currentUser: getCurrentUser(),
    userId: getCurrentUser(),
    isAdminUser,
    config,
    docs,
  }

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




// HOC
export const withAppStateProvider = (Component) => (props) => (
  <AppStateProvider {..._.pick(props, ['config', 'userId', 'isAdminUser', 'docs' ])} >
    <Component {...props} />
  </AppStateProvider>
);
export const withUseAppState = (Component) => (props) => {
  const appState = useAppState();
  return (
    <Component {...props} appState={appState}/>
  )
}






export default useAppState;