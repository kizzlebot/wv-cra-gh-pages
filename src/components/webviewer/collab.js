/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import Promise from 'bluebird';
import _ from 'lodash';
import * as R from 'ramda';
import Webviewer from "./viewer";
import { useServer } from '../../lib/hooks/useServerProvider';
import { useQueue, useGetSetState, createStateContext, useGetSet } from 'react-use';


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
  const [getState, setState] = useGetSetState({ pageNumber: {}, signers: {}, fields: {} });
  const [getPageState, setPageState] = useGetSetState({ });
  const [getBlankPageState, setBlankPageState] = useGetSetState({ });
  const [getAnnotsToImport, setAnnotsToImport] = useGetSet([]);

  
  
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
    server.bind('onFieldChanged', ({ val, key }) => {
      setState({ 
        ...getState(), 
        fields: {
          ...getState().fields,
          [key.replace(/__/ig, ' ').replace(/_/ig, '.')]: val
        },
      });
    });
  }, [getState, server, setState]);


  const { signers } = getState()

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




  useEffect(() => {
  }, [userId])


  const upsert = (fn, toAdd) => {
    let allAnnots = getAnnotsToImport();
    const i = _.findIndex(allAnnots, (b) => fn(toAdd, b));
    if (i > -1){
      console.log('upserting', toAdd, allAnnots.length)
      allAnnots[i] = toAdd;
    } else {
      console.log('adding', toAdd, allAnnots.length)
      allAnnots = [...allAnnots, toAdd];
    }
    return setAnnotsToImport(allAnnots);
  };


  const handleAnnotationAdded = (type) => async (args, docId) => {
    const create = (type === 'annotation') ? server.createAnnotation : server.createWidget;
    await create(args.id, args)
    await server.setPageNumber(docId, args.pageNumber)
  };
  
  return (
    <Webviewer

      onReady={(viewer) => {
        // console.log('onReady', viewer);
      }}

      onAnnotationAdded={handleAnnotationAdded('annotation')}
      onWidgetAdded={handleAnnotationAdded('widget')}
      onAnnotationUpdated={(args) => server.updateAnnotation(args.id, args)}
      onAnnotationDeleted={(args) => server.deleteAnnotation(args.id, args)}
      onWidgetDeleted={(id) => server.deleteWidget(id)}

      // TODO: implement on field changed
      onFieldUpdated={async ({ name, value, widget }) => {
        if (!widget || !widget.CustomData.id){
          return;
        }
        console.log('field changed', name, value, widget)
        await server.setField(name, value);
        await server.updateWidget(widget.CustomData.id, {
          fieldName: name,
          fieldValue: value
        })
      }}

      // Pass the next item in the annot queue
      annotToImport={getAnnotsToImport()}
      onAnnotImported={() => setAnnotsToImport([])}




      onSignatureSaved={(args) => saveSignatureToLocalStorage(args)}
      fields={getState().fields}


      // after initial document + annotations have loaded. Start listening on firebase
      onAnnotationsLoaded={async function * (docId, pageCount) {
        await server.unbindAll();
        const allAnnots = await server.getAnnotations(docId);

        // pass annots to load to caller
        yield allAnnots;

        // get page
        const pageNumber = await server.getPageNumber(docId); 
        if (pageNumber > 0 && pageNumber <= pageCount) {
          yield pageNumber;
        }
        else {
          yield 1;
        }

        // const fields = await server.getFields();
        // yield fields;
        
        
        await Promise.all([
          server.bind('onPageChanged', docId, ({ val, key }) => setPageState({ ...getPageState(), ...val })),
          server.bind('onWidgetCreated', docId, ({ val, key }) => upsert((a,b) => a.id === b.id, val)),
          // TODO: fix this. After first widget is delete from fbase, everything stops syncing
          server.bind('onWidgetDeleted', docId, ({ val, key }) => upsert((a, b) => a.id === b.id, { ...val, action: 'delete' })),
          server.bind('onAnnotationCreated', docId, ({ val, key }) => upsert((a,b) => a.id === b.id, val)),
          server.bind('onAnnotationUpdated', docId, ({ val, key }) => upsert((a,b) => a.id === b.id, val)),
          server.bind('onAnnotationDeleted', docId, ({ val, key }) => upsert((a, b) => a.id === b.id, { ...val, action: 'delete' }))
        ])
      }}
      
      
      // When document is unloaded (`selectedDoc` changed). Clear queue and unbind from firebase
      onDocumentUnloaded={async () => {
        await server.clearWidgets();
        setAnnotsToImport([]);
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
