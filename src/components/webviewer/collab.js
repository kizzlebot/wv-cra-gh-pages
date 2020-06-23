import React, { useEffect } from 'react';
import * as R from 'ramda';
import _ from 'lodash';
import Viewer from './viewer';
import { useServer } from 'lib/hooks/useServerProvider';
import Promise from 'bluebird';
import { useEffectOnce } from 'react-use';
import useAppState from 'lib/hooks/AppState';
import { importFbaseVal, delFbaseVal, importWidgetFbaseVal, delWidgetFbaseVal, importField, setBlankPages } from './lib/helpers/import';
import debug from 'debug';
const log = debug('collab');


const invokeServerMethod = (fn) => R.pipe(
  R.tap((args) => log('annotation created', args)),
  R.converge(fn, [R.prop('id'), R.identity])
);

export default function Collab(props){

  const server = useServer();
  const appState = useAppState();

  useEffectOnce(() => {
    server.bind('onSelectedSignerChange', ({ val }) => appState.setSelectedSigner(val))
    server.bind('onAuthorsChanged', ({ val }) => appState.setSigners(val));
    server.bind('onSelectedDocIdChanged', ({ val }) => appState.setSelectedDoc(val));
  });


  useEffect(() => {
    if (appState.selectedDoc){
      server.setSelectedDocId(appState.selectedDoc);
    }
  }, [appState.selectedDoc, server]);


  
  return (
    <Viewer
      /*
       * appState
       */
      config={appState.config}
      toolConfig={{
        toolNames: [
          // 'ShowSigner', 
          'SelectSigner', 
          'Divider', 
          'AddBlankPage', 
          'RemoveBlankPage', 
          'Divider', 
          'RemoveFormFields', 
          'Divider', 
          'FormFieldTools', 
          'TemplateTools', 
          'Divider', 
          'StampTools', 
          'CertTool'
        ],
        popupNames: [
          'AssignSigner',
          'SetRequired'
        ]
      }}
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
        server.bind('onBlankPagesChanged', inst.getDocId(), setBlankPages(inst))
      ])}
      unbindEvents={({ selectedDoc }) => server.unbindAll(selectedDoc)}


      
      // upstream updates; when webviewer emits changes, push it up to firebase
      onAnnotationAdded={invokeServerMethod(server.createAnnotation)}
      onAnnotationUpdated={invokeServerMethod(server.updateAnnotation)}
      onAnnotationDeleted={invokeServerMethod(server.deleteAnnotation)}
      onWidgetAdded={invokeServerMethod(server.createWidget)}
      onWidgetUpdated={invokeServerMethod(server.updateWidget)}
      onWidgetDeleted={invokeServerMethod(server.deleteWidget)}

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
  )
}