import React, { useEffect } from 'react';
import * as R from 'ramda';
import _ from 'lodash';
import Viewer from './viewer';
import { useServer, withServerProvider } from 'lib/hooks/useServerProvider';
import Promise from 'bluebird';
import { useEffectOnce } from 'react-use';
import useAppState, { withAppStateProvider } from 'lib/hooks/AppState';
import { 
  importFbaseVal, 
  delFbaseVal, 
  importWidgetFbaseVal, 
  delWidgetFbaseVal, 
  importField, 
  setBlankPages, 
  lockWebviewer,
  setCurrentUser,
} from './lib/helpers/import';

import debug from 'debug';
import { useParams } from 'react-router-dom';
import * as toolConfigs from './lib/configs';
const log = debug('collab');


const invokeServerMethod = (fn) => R.pipe(
  R.tap((args) => log('annotation created', args)),
  R.converge(fn, [R.prop('id'), R.identity])
);


function Collab(props){

  const server = useServer();
  const appState = useAppState();

  useEffectOnce(() => {
    server.bind('onAuthorsChanged', ({ val }) => appState.setSigners(val));
    server.bind('onSelectedDocIdChanged', ({ val }) => appState.setSelectedDoc(val));
  });


  useEffect(() => {
    if (appState.selectedDoc){
      server.setSelectedDocId(appState.selectedDoc);
    }
  }, [appState.selectedDoc, server]);


  
  return (
    <div className="App d-flex flex-column" style={{ height: '100% !important' }}>
      <Viewer
        /*
        * appState
        */
        config={appState.config}
        toolConfig={toolConfigs[props.userType]}
        currentUser={appState.currentUser}
        isAdminUser={appState.isAdminUser}
        signers={_.values(appState.signers)}
        docs={appState.docs}
        selectedDoc={appState.selectedDoc}
        selectedSigner={appState.selectedSigner}
        blankPages={appState.blankPages[appState.getSelectedDoc()]}


        /**
         * The following props synchronize data in firebase with webviewer
         */
        authenticate={server.authenticate}

        // bind listeners for downstream updates; when firebase pushes data to browser, update webviewer
        bindEvents={(inst) => Promise.all([
          server.bind('onAnnotationCreated', inst.getDocId(), importFbaseVal(inst)),
          server.bind('onAnnotationUpdated', inst.getDocId(), importFbaseVal(inst)),
          server.bind('onAnnotationDeleted', inst.getDocId(), delFbaseVal(inst)),
          server.bind('onWidgetCreated', inst.getDocId(), importWidgetFbaseVal(inst)),
          server.bind('onWidgetDeleted', inst.getDocId(), delWidgetFbaseVal(inst)),
          server.bind('onFieldAdded', inst.getDocId(), importField(inst)),
          server.bind('onFieldUpdated', inst.getDocId(), importField(inst)),
          server.bind('onBlankPagesChanged', inst.getDocId(), setBlankPages(inst)),
          server.bind('onLockChanged', inst.getDocId(), lockWebviewer(inst)),
          server.bind('onSelectedSignerChanged', inst.getDocId(), R.pipe(
            R.tap(({ val }) => inst.annotManager.trigger('setSelectedSigner', val)),
            R.tap(({ val }) => appState.setSelectedSigner(val)),
            R.when(
              ({ val }) => inst.getSignerById(val) && appState.runId === inst.getSignerById(val).runId || val === '-1',
              setCurrentUser(inst)
            )
          ))
        ])}
        unbindEvents={({ selectedDoc }) => server.unbindAll(selectedDoc)}


        
        // upstream updates; when webviewer emits changes, push it up to firebase
        onAnnotationAdded={invokeServerMethod(server.createAnnotation)}
        onAnnotationUpdated={invokeServerMethod(server.updateAnnotation)}
        onAnnotationDeleted={invokeServerMethod(server.deleteAnnotation)}
        onWidgetAdded={invokeServerMethod(server.createWidget)}
        onWidgetUpdated={invokeServerMethod(server.updateWidget)}
        onWidgetDeleted={invokeServerMethod(server.deleteWidget)}
        onLockChanged={server.setLock}

        onSelectedSignerChanged={server.setSelectedSigner}
        
        onBlankPagesAdded={(docId, currBlankPages) => server.setBlankPages(docId, currBlankPages)}
        onBlankPagesRemoved={(docId, currBlankPages) => server.setBlankPages(docId, Math.max(currBlankPages, 0))}

        onFieldUpdated={async ({ name, value, docId, widget }) => {
          if (!widget || !widget.CustomData.id || !value){
            return;
          }
          await server.setField(widget.CustomData.id, {
            docId,
            name, 
            value,
          });
          await server.updateWidget(widget.CustomData.id, {
            fieldName: name,
            fieldValue: value
          })
        }}
      />
    </div>
  )
}




const composeComponent = R.compose(
  withAppStateProvider,
  withServerProvider((props) => {
    const { organizationId, nsId } = useParams();
    const appState = useAppState();

    return {
      nsId: nsId,
      rtdbNamespace: organizationId,
      signers: props.signers,
      signerLocation: props.signerLocation,  
      userId: props.userId,
      user: props.user,
      runId: appState.getRunId(),
      userType: props.userType
    }
  }),
)


export default composeComponent(Collab);
