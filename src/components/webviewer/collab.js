/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import Promise from 'bluebird';
import _ from 'lodash';
import * as R from 'ramda';
import Webviewer from "./viewer";
import { useServer } from '../../lib/hooks/useServerProvider';
import { useQueue, useGetSetState } from 'react-use';


const saveSignatureToLocalStorage = (conf) => {
  localStorage.setItem(`${conf.type}_${conf.authorId}`, JSON.stringify(conf));
}


function Collab({
  clearAll,
  onAllCleared,
  config,
  userId,
  isAdminUser,
  selectedSigner,
  docs,
  selectedDocId,
  onSignersUpdated = R.identity
}) {

  const server = useServer();
  const { add: addAnnot, remove: removeAnnot, first: firstAnnot, size: annotSize } = useQueue();
  const { add: addWidget, remove: removeWidget, first: firstWidget, size: widgetSize } = useQueue();
  const [getState, setState] = useGetSetState({ pageNumber: {}, signers: {} });
  const [getPageState, setPageState] = useGetSetState({ });
  const [getBlankPageState, setBlankPageState] = useGetSetState({ });

  
  // when current document toggled. update fbase
  useEffect(() => {
    server.setSelectedDocId(selectedDocId);
  }, [selectedDocId])

  useEffect(() => {
    server.bind('onBlankPagesChanged', ({ val }) => {
      console.log('blankPagesChanged', val)
      setBlankPageState({
        ...val,
      })
    })

    server.bind('onAuthorsChanged', ({ val }) => {
      setState({ 
        ...getState(), 
        signers: val,
      });
    });
    server.bind('onSelectedDocIdChanged', ({ val }) => {
      setState({ 
        ...getState(), 
        selectedDocId: val,
      });
    });
  }, [getState, server, setState]);





  const { signers } = getState()

  useEffect(() => {
    onSignersUpdated(signers);
  }, [signers]);



  useEffect(() => {
    const clearAllAnnotsWidgets = async () => {
      await Promise.all([server.clearAnnotations(), server.clearWidgets()]);
      return onAllCleared();
    };
    
    if (clearAll === true){
      clearAllAnnotsWidgets();
    }

  }, [clearAll])




  useEffect(() => {
  }, [userId])




  return (
    <Webviewer

      onReady={(viewer) => {
        // console.log('onReady', viewer);
      }}

      onAnnotationAdded={async (args) => {
        await server.createAnnotation(args.id, args)
        await server.setPageNumber(selectedDocId, args.pageNumber)
      }}
      onAnnotationUpdated={(args) => server.updateAnnotation(args.id, args)}
      onAnnotationDeleted={(args) => server.deleteAnnotation(args.id, args)}
      onWidgetAdded={async (args) => {
        await server.createWidget(args.id, args)
        await server.setPageNumber(args.docId, args.pageNumber)
      }}
      onWidgetDeleted={(id) => server.deleteWidget(id)}

      // TODO: implement on field changed
      onFieldUpdated={(args) => console.log('field changed', args)}

      // Pass the next item in the annot queue
      annotToImport={firstAnnot}
      annotSize={annotSize}
      onAnnotImported={() => removeAnnot()}

      // Pass the next item in the widget queue
      widgetToImport={firstWidget}
      widgetSize={widgetSize}
      onWidgetImported={() => removeWidget()}



      onSignatureSaved={(args) => saveSignatureToLocalStorage(args)}


      // when document + annotations have loaded. Start listening on firebase
      onAnnotationsLoaded={async (docId) => {
        await Promise.all([
          server.bind('onPageChanged', docId, ({ val, key }) => setPageState({
            ...getPageState(),
            ...val,
          })),
          server.bind('onWidgetCreated', docId, ({ val, key }) => addWidget(val)),
          // TODO: fix this. After first widget is delete from fbase, everything stops syncing
          server.bind('onWidgetDeleted', docId, ({ val, key }) => addWidget({ ...val, type: 'delete' })),
          server.bind('onAnnotationCreated', docId, ({ val, key }) => addAnnot(val)),
          server.bind('onAnnotationUpdated', docId, ({ val, key }) => addAnnot(val)),
          server.bind('onAnnotationDeleted', docId, ({ val, key }) => addAnnot({ ...val, type: 'delete' }))
        ])
      }}
      
      
      // When document is unloaded (`selectedDoc` changed). Clear queue and unbind from firebase
      onDocumentUnloaded={() => {
        while (annotSize > 0) {
          removeAnnot();
        }
        while (widgetSize > 0) {
          removeWidget();
        }
        server.unbindAll();
      }}

      
      // TODO: update firebase rtdb with the number of blank pages added so it syncs b/t other users
      onBlankPagesAdded={(docId, currBlankPages) => server.setBlankPages(docId, currBlankPages + 1)}
      // TODO: update firebase rtdb with the number of blank pages added so it syncs b/t other users
      onBlankPagesRemoved={(docId, currBlankPages) => server.setBlankPages(docId, Math.max(currBlankPages - 1, 0))}


      onRemoveFormFields={async () => {
        const { selectedDocId } = getState()
        await server.clearWidgets();
        await server.setSelectedDocId('-1');
        await Promise.delay(1000);
        await server.setSelectedDocId(selectedDocId);
      }}

      pageNumber={getPageState()[getState().selectedDocId]}

      selectedSigner={selectedSigner}
      currentUser={userId}
      selectedDoc={getState().selectedDocId}

      blankPages={getBlankPageState()[getState().selectedDocId]}

      isAdminUser={isAdminUser}
      docs={docs}
      config={config}
      signers={_.values(getState().signers)}
    />
  );
}

export default Collab;
