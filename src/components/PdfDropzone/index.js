/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import { useDropzone } from 'react-dropzone';
import { Modal, Button, Form } from 'react-bootstrap';
import { useQueue } from 'react-use';
import Promise from 'bluebird';
import * as R from 'ramda';
import Webviewer from './webviewer';



function PreviewModal(props) {
  const inputRef = useRef();
  const [files, setFiles] = useState({});
  const [wv, setWv] = useState(null);
  const [validated, setValidated] = useState(false);

  const { remove, first: currFileId, size } = useQueue(_.keys(props.files));



  useEffect(() => {
    setFiles(props.files);
  }, [props.files]);



  const handleTitleChange = useCallback((evt) => setFiles(({
    ...files,
    [currFileId]: {
      ...files[currFileId],
      title: evt.target.value,
    },
  })), [files, currFileId]);

  const handleDescChange = useCallback((evt) => setFiles(({
    ...files,
    [currFileId]: {
      ...files[currFileId],
      description: evt.target.value,
    },
  })), [files, currFileId]);




  const handleAddPages = useCallback(async (evt) => {
    if (!wv) {
      return;
    }

    const doc = wv.docViewer.getDocument();

    await Promise.mapSeries(evt.target.files, async (file) => {
      const insertIndex = doc.getPageCount() + 1;
      const docToInsert = await wv.CoreControls.createDocument(file, {
        filename: file.name,
        extension: 'pdf',
      });
      const pagesToInsert = _.range(1, docToInsert.getPageCount() + 1);

      await doc.insertPages(docToInsert, pagesToInsert, insertIndex);

      const data = await doc.getFileData({});
      const arr = new Uint8Array(data);
      const blob = new window.Blob([arr], { type: 'application/pdf' });
      const f = new window.File([blob], currFileId, { type: blob.type });


      // const xfdf = wv.annotManager.exportAnnotations();

      return setFiles({
        ...files,
        [currFileId]: {
          ...files[currFileId],
          file: f,
          // xfdf,
        },
      });
    });
  }, [files, currFileId, wv]);



  const handleNext = useCallback(async (evt) => {
    evt.preventDefault();
    const form = evt.currentTarget;

    if (form.checkValidity() === false) {
      evt.preventDefault();
      evt.stopPropagation();
      setValidated(true);

      return false;
    }

    if (!wv) {
      return;
    }

    const doc = wv.docViewer.getDocument();
    const data = await doc.getFileData({});
    const arr = new Uint8Array(data);
    const blob = new window.Blob([arr], { type: 'application/pdf' });
    const f = new window.File([blob], currFileId, { type: blob.type });
    const xfdf = await wv.annotManager.exportAnnotations();

    setFiles({
      ...files,
      [currFileId]: {
        ...files[currFileId],
        file: f,
        xfdf,
      },
    });

    if (size > 1) {
      return remove();
    }

    return props.onSubmit({
      ...files,
      [currFileId]: {
        ...files[currFileId],
        file: f,
        xfdf,
      },
    });
  }, [files, currFileId, props, remove, size, wv]);


  return (
    <Modal
      style={{ zIndex: 4000, border: '1px solid' }}
      show={_.values(props.files || {}).length > 0}
      onHide={() => { }}
      variant='primary'
      size='xl'
    >
      <Modal.Header
        style={{
          borderBottom: '1px solid',
          display: 'block',
          color: '#000000',
          textAlign: 'center',
          fontSize: '26px',
          fontWeight: 'bold',
        }}
      >
        <div className='d-flex align-items-center'>
          <div>
            <img alt='' src='/static/img/icons/small/delay.svg' />
            <span><h4 style={{ fontSize: '10px' }}>Pending documents</h4></span>
          </div>
          <div className='flex-grow-1'>Let's make sure this is the right document!</div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Webviewer
          signers={props.signers}
          selectedSigner={props.selectedSigner}
          docs={_.mapValues(files, (f) => f.file)}
          selectedDoc={currFileId}
          onReady={R.pipe(
            R.tap((wv) => {
              console.log('onReady', wv)
              setWv(wv)
            }),
            R.when(
              R.complement(R.isNil),
              props.onReady
            )
          )}
          onAnnotationAdded={(args) => {
            return setFiles({
              ...files,
              [currFileId]: {
                ...files[currFileId],
                annotations: {
                  ...(files[currFileId].annotations || {}),
                  [args.id]: args,
                },
              },
            });
          }}
          onAnnotationChanged={(args) => {
            return setFiles({
              ...files,
              [currFileId]: {
                ...files[currFileId],
                annotations: {
                  ...(files[currFileId].annotations || {}),
                  [args.id]: args,
                },
              },
            });
          }}
          onAnnotationDeleted={(args) => {
            const { annotations = {} } = (files[currFileId] || {});

            console.log('here annotation delted', annotations, args.id, _.omit(annotations, [args.id]));

            return setFiles({
              ...files,
              [currFileId]: {
                ...files[currFileId],
                annotations: _.omit(annotations, [args.id]),
              },
            });
          }}
          isReadOnly={props.isPreview}
          isAdminUser
        />
      </Modal.Body>





      <Form
        noValidate
        validated={validated}
        onSubmit={handleNext}
      >

        <Modal.Footer>
          <input
            type='file'
            accept='application/pdf'
            style={{ display: 'none' }}
            ref={inputRef}
            multiple
            onChange={handleAddPages}
          />

          <div className='w-100'>
            <Form.Group>
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type='text'
                required
                placeholder='Document Title'
                disabled={props.isPreview}
                value={files[currFileId]?.title || ''}
                onChange={handleTitleChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type='text'
                disabled={props.isPreview}
                placeholder='Document Description'
                value={files[currFileId]?.description || ''}
                onChange={handleDescChange}
              />
            </Form.Group>
          </div>
        </Modal.Footer>

        <Modal.Footer
          style={{
            borderTop: '1px solid',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >

          {
            !props.isPreview ? (
              <>
                <Button
                  type='button'
                  disabled={!wv}
                  onClick={() => inputRef.current.click()}
                >
                  Add More Pages
                </Button>
                <Button
                  disabled={!wv}
                  onClick={() => props.onSubmit({})}
                >
                  Try Again
                </Button>
                <Button
                  type='submit'
                  disabled={!wv}
                >
                  {size <= 1 ? 'Submit' : 'Next'}
                </Button>
              </>

            ) : (
                <Button
                  disabled={!wv}
                  onClick={() => props.onClose({})}
                >
                  Close
                </Button>
              )
          }
        </Modal.Footer>
      </Form>
    </Modal>
  );
}


function FileDropzone(props) {
  const [pendingFiles, setPendingFiles] = useState({});
  const [files, setFiles] = useState({});
  const [isPreview, setIsPreview] = useState(false);
  const inputRef = useRef();



  const onDrop = useCallback((acceptedFiles) => {
    const files = _.reduce(acceptedFiles, (acc, file) => {
      return {
        ...acc,
        [file?.name]: {
          file,
          title: file.name,
          description: '',
        },
      };
    }, {});

    setPendingFiles(files);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: 'application/pdf',
    disabled: props.disabled,
  });



  useEffect(() => {
    setFiles(props.files);
  }, [props.files])



  return (

    <>
      <div
        className='document-preparation'
        style={{ width: '100%' }}
      >
        <form className='box' encType='multipart/form-data'>
          <div {...getRootProps()}>
            <div className='box__input'>
              <input ref={inputRef} {...getInputProps()} />
              <label htmlFor='file' />
              <img
                alt=''
                src='/static/img/icons/big/uploadOff.svg'
              />
              {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
            </div>
          </div>
        </form>
      </div>

      <div className='pt-2'>
        <ul className='ul-doc-list'>
          {
            _.map(files, (file, index) => (
              <li key={`${file.name}-${index}`}>
                <a
                  href='#'
                  onClick={() => {
                    setIsPreview(true);
                    setPendingFiles({
                      [index]: file,
                    });
                  }}
                >
                  <span>
                    {file.title} - {_.truncate(file.description, { length: 15 })}
                  </span>
                </a>

                <button
                  className='li-remove'
                  type='button'
                  style={{ border: 'none' }}
                  disabled={props.disabled}
                  onClick={() => {
                    setFiles(_.omit(files, [index]));
                    props.onFilesChanged(_.omit(files, [index]));
                  }}
                />
              </li>
            ))
          }
        </ul>

      </div>


      {
        _.keys(pendingFiles).length > 0 && (
          <PreviewModal
            files={pendingFiles}
            signers={_.map(props.signers, (s, i) => ({ ...s, id: i.toString() }))}
            isPreview={isPreview}
            onReady={(...args) => props.onReady && props.onReady(...args)}
            onClose={() => {
              setPendingFiles({});
              setIsPreview(false);
            }}
            onSubmit={(finalFiles) => {
              setPendingFiles({});
              console.log('currFiles', files)
              console.log('finalFiles', finalFiles);
              setFiles(finalFiles);
              props.onFilesChanged({
                ...files,
                ...finalFiles
              });
            }}
          />
        )
      }


    </>
  );
}

export default FileDropzone;
