/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import Promise from 'bluebird';
import _ from 'lodash';
import * as R from 'ramda';
import Webviewer from "./viewer";
import { useServer } from 'lib/hooks/useServerProvider';
import { useQueue, useGetSetState, createStateContext, useGetSet, useEffectOnce } from 'react-use';
import useAppState from '../../lib/hooks/AppState';


const saveSignatureToLocalStorage = (conf) => {
  localStorage.setItem(`${conf.type}_${conf.authorId}`, JSON.stringify(conf));
}
const tapP = (fn) => R.pipe(R.tap(fn), R.bind(Promise.resolve, Promise));

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



  const appState = useAppState();

  const server = useServer();

  const [getState, setState] = useGetSetState({ pageNumber: {}, signers: {}, fields: {} });


  
  
  // when current document toggled. update fbase
  useEffect(() => {
    if (selectedDocId){
      server.setSelectedDocId(selectedDocId);
    }
  }, [appState.selectedDoc]);


  const bindServerEvents = async () => {
    await Promise.all([
      server.getFields()
        .then((fields) => appState.setFields(fields)),

      server.bind('onBlankPagesChanged', ({ val }) => {
        console.log('blankPagesChanged', val)
        appState.setBlankPages(val);
      }),

      server.bind('onAuthorsChanged', ({ val }) => {

        appState.setSigners(val);
      }),

      server.bind('onSelectedDocIdChanged', ({ val }) => {
        appState.setSelectedDoc(val);
      }),

      server.bind('onFieldChanged', ({ val, key }) => {
        appState.setFields({
          ...appState.getFields(),
          [key.replace(/__/ig, ' ').replace(/_/ig, '.')]: val
        })
      }),
    ]);
  }
  useEffectOnce(() => {
    bindServerEvents();
  }, [getState, server, setState]);


  const { signers } = appState.getSigners()

  useEffect(() => onSignersUpdated(signers), [signers]);



  useEffect(() => {
    const clearAllAnnotsWidgets = async () => {
      await Promise.all([server.clearAnnotations(), server.clearWidgets()]);
      return onAllCleared();
    };
    
    if (clearAll === true){
      clearAllAnnotsWidgets();
    }

  }, [clearAll])



  const handleAnnotationAdded = (type) => async (args, docId) => {
    const create = (type === 'annotation') ? server.createAnnotation : server.createWidget;
    await create(args.id, args)
    await server.setPageNumber(docId, args.pageNumber)
  };
  
  const handleAnnotationUpdated = (type) => async (args, docId) => {
    const create = (type === 'annotation') ? server.updateAnnotation: server.updateWidget;
    await create(args.id, args)
  };
  return (
    <Webviewer

      onReady={(viewer) => {
        // console.log('onReady', viewer);
      }}

      onAnnotationAdded={handleAnnotationAdded('annotation')}
      onAnnotationUpdated={handleAnnotationUpdated('annotation')}
      onWidgetAdded={handleAnnotationAdded('widget')}
      onAnnotationDeleted={(args) => server.deleteAnnotation(args.id, args)}
      onWidgetDeleted={(id) => server.deleteWidget(id)}

      // TODO: implement on field changed
      onFieldUpdated={async ({ name, value, widget }) => {
        if (!widget || !widget.CustomData.id || !value){
          return;
        }
        await server.setField(name, value);
        await server.updateWidget(widget.CustomData.id, {
          fieldName: name,
          fieldValue: value
        })
      }}

      // Pass the next item in the annot queue
      annotToImport={appState.annotsToImport}
      onAnnotImported={() => appState.setAnnotsToImport([])}




      onSignatureSaved={(args) => saveSignatureToLocalStorage(args)}
      fields={{}}


      // after initial document + annotations have loaded. Start listening on firebase
      // note we are using a generator here. 
      onAnnotationsLoaded={async function * (docId, pageCount) {
        await server.unbindAll();
        // pass number of blank pages to add to call

        // pass annots to load to caller and pause for initial annot import
        const allAnnots = await server.getAnnotations(docId);
        yield allAnnots;

        const blankPages = await server.getBlankPagesByDocId(docId);
        yield blankPages;

        // pageNumber to load
        await server.setPageNumber(docId, 1)
        const pageNumber = await server.getPageNumber(docId); 
        const pgNumToYield = (pageNumber > 0 && pageNumber <= pageCount) ? pageNumber : 1;
        yield pgNumToYield;
        
        
        await Promise.all([
          server.bind('onPageChanged', docId, ({ val, key }) => appState.setPageNumbers(val)),
          server.bind('onWidgetCreated', docId, ({ val, key }) => appState.upsertAnnot(val)),
          // TODO: fix this. After first widget is delete from fbase, everything stops syncing
          server.bind('onWidgetDeleted', docId, ({ val, key }) => appState.upsertAnnot({ ...val, action: 'delete' })),
          server.bind('onAnnotationCreated', docId, ({ val, key }) => appState.upsertAnnot(val)),
          server.bind('onAnnotationUpdated', docId, ({ val, key }) => appState.upsertAnnot(val)),
          server.bind('onAnnotationDeleted', docId, ({ val, key }) => appState.upsertAnnot({ ...val, action: 'delete' }))
        ])
      }}
      
      
      // When document is unloaded (`selectedDoc` changed). Clear queue and unbind from firebase
      onDocumentUnloaded={async () => {
        await server.clearWidgets();
        appState.setAnnotsToImport([]);
      }}

      
      onBlankPagesAdded={(docId, currBlankPages) => server.setBlankPages(docId, currBlankPages + 1)}
      onBlankPagesRemoved={(docId, currBlankPages) => server.setBlankPages(docId, Math.max(currBlankPages - 1, 0))}


      onRemoveFormFields={async () => {
        const selectedDocId = appState.getSelectedDoc()
        await server.clearWidgets();
        await server.setSelectedDocId('-1');
        await Promise.delay(1000);
        await server.setSelectedDocId(selectedDocId);
      }}

      pageNumber={appState.getPageNumbers()[appState.getSelectedDoc()]}

      selectedSigner={appState.getSelectedSigner()}
      currentUser={appState.getCurrentUser()}
      selectedDoc={appState.getSelectedDoc()}

      blankPages={appState.blankPages[appState.getSelectedDoc()]}

      isAdminUser={appState.isAdminUser}
      docs={appState.docs}
      config={appState.config}
      signers={_.values(appState.getSigners())}
    />
  );
}

export default Collab;
