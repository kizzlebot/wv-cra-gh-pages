import React, { useEffect } from 'react';
import * as R from 'ramda';
import _ from 'lodash';
import Viewer from './viewer';
import { useServer, withServerProvider } from 'lib/hooks/useServerProvider';
import Promise from 'bluebird';
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

        // bind non-doc-specific listeners for downstream updates; when firebase pushes data to browser, update webviewer
        bindEvents={(inst) => Promise.all([
          server.bind('onSelectedDocIdChanged', inst.getDocId(), ({ val }) => appState.setSelectedDoc(val), 'main'),
          server.bind('onAuthorsChanged', inst.getDocId(), ({ val }) => {
            console.log('onAuthorsChanged', val);
            appState.setSigners(val)
          }, 'main'),
          server.bind('onLockChanged', inst.getDocId(), lockWebviewer(inst), 'main'),
          server.bind('onSelectedSignerChanged', inst.getDocId(), R.pipe(
            R.tap(({ val }) => inst.annotManager.trigger('setSelectedSigner', val)),
            R.tap(({ val }) => appState.setSelectedSigner(val)),
            ({ val }) => {
              if (inst.annotManager.getIsAdminUser()){
                inst.toggleTools(false);
                return;
              }
              if (val == '-1' || (inst.getSignerById(val) && appState.runId !== inst.getSignerById(val).runId)) {
                inst.annotManager.setCurrentUser('-1');
                inst.toggleTools(true);
              }
              else if ((inst.getSignerById(val) && appState.runId === inst.getSignerById(val).runId)){
                inst.annotManager.setCurrentUser(val);
                inst.toggleTools(false);
              }
            }
            // R.when(
            //   ({ val }) => (inst.getSignerById(val) && appState.runId === inst.getSignerById(val).runId) || val === '-1',
            //   setCurrentUser(inst)
            // )
          ), 'main'),
          server.bind('onLockChanged', inst.getDocId(), lockWebviewer(inst), 'main'),
        ])}
        unbindEvents={() => server.unbindAll('all')}

        // bind doc-specific listeners for downstream updates; when firebase pushes data to browser, update webviewer
        bindDocEvents={(inst) => Promise.all([
          server.bind('onAnnotationCreated', inst.getDocId(), importFbaseVal(inst)),
          server.bind('onAnnotationUpdated', inst.getDocId(), importFbaseVal(inst)),
          server.bind('onAnnotationDeleted', inst.getDocId(), delFbaseVal(inst)),
          server.bind('onWidgetCreated', inst.getDocId(), importWidgetFbaseVal(inst)),
          server.bind('onWidgetDeleted', inst.getDocId(), delWidgetFbaseVal(inst)),
          server.bind('onFieldAdded', inst.getDocId(), importField(inst)),
          server.bind('onFieldUpdated', inst.getDocId(), importField(inst)),
          server.bind('onBlankPagesChanged', inst.getDocId(), setBlankPages(inst)),
        ])}
        unbindDocEvents={({ selectedDoc }) => server.unbindAll(selectedDoc)}


        
        // upstream updates; when webviewer emits changes, push it up to firebase
        onAnnotationAdded={invokeServerMethod(server.createAnnotation)}
        onAnnotationUpdated={invokeServerMethod(server.updateAnnotation)}
        onAnnotationDeleted={invokeServerMethod(server.deleteAnnotation)}
        onWidgetAdded={invokeServerMethod(server.createWidget)}
        onWidgetUpdated={invokeServerMethod(server.updateWidget)}
        onWidgetDeleted={invokeServerMethod(server.deleteWidget)}
        onLockChanged={server.setLock}
        onRemoveFormFields={server.clearWidgets}
        onRemoveAllAnnots={server.clearAll}

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
  // withAppStateProvider,
  // withServerProvider((props) => {
  //   const { organizationId, nsId } = useParams();
  //   const appState = useAppState();

  //   return {
  //     nsId: nsId,
  //     rtdbNamespace: organizationId,
  //     signers: props.signers,
  //     signerLocation: props.signerLocation,  
  //     userId: props.userId,
  //     user: props.user,
  //     runId: appState.getRunId(),
  //     userType: props.userType
  //   }
  // }),
  R.identity
)


export default composeComponent(Collab);
