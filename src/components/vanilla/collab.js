import React from 'react';
import * as R from 'ramda';
import _ from 'lodash';
import Viewer from './viewer';
import { useServer } from 'lib/hooks/useServerProvider';
import Promise from 'bluebird';
import { useEffectOnce } from 'react-use';
import useAppState from '../../lib/hooks/AppState';
import { importFbaseVal, delFbaseVal, importWidgetFbaseVal } from './lib/helpers/import';



const invokeServerMethod = (fn) => R.pipe(
  R.tap((args) => console.log('annotation created', args)),
  R.converge(fn, [R.prop('id'), R.identity])
)

export default function Collab(props){

  const server = useServer();
  const appState = useAppState();

  useEffectOnce(() => {
    server.bind('onAuthorsChanged', ({ val }) => appState.setSigners(val));
  })



  return (
    <Viewer
      {...props}
      userId={appState.currentUser}
      isAdminUser={appState.isAdminUser}
      authenticate={server.authenticate}
      signers={_.values(appState.signers)}
      docs={appState.docs}
      selectedDoc={appState.selectedDoc}
      selectedSigner={appState.selectedSigner}

      bindEvents={(inst) => {
        return Promise.all([
          server.bind('onAnnotationCreated', inst.selectedDoc, importFbaseVal(inst)),
          server.bind('onAnnotationUpdated', inst.selectedDoc, importFbaseVal(inst)),
          server.bind('onAnnotationDeleted', inst.selectedDoc, delFbaseVal(inst)),
          server.bind('onWidgetCreated', inst.selectedDoc, importWidgetFbaseVal(inst))
        ])
      }}
      unbindEvents={({ selectedDoc, ...rest }) => { 
        console.log('unbinding events called', selectedDoc);
        return server.unbindAll(selectedDoc);
      }}

      onAnnotationAdded={invokeServerMethod(server.createAnnotation)}
      onAnnotationUpdated={invokeServerMethod(server.updateAnnotation)}
      onAnnotationDeleted={invokeServerMethod(server.deleteAnnotation)}
      onWidgetAdded={invokeServerMethod(server.createWidget)}
      onWidgetUpdated={invokeServerMethod(server.updateWidget)}
      onWidgetDeleted={invokeServerMethod(server.deleteWidget)}

    />
  )
}

