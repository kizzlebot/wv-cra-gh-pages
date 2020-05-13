import React, { useState } from "react";
import PdfDropzone from "./PdfDropzone";
import { withKnobs, text, radios, boolean, number, select, optionsKnob as options } from "@storybook/addon-knobs";
import data from './data';
import _ from 'lodash';


export default {
  title: "Design System|Dropzone",

  decorators: [withKnobs({ escapeHTML: false })],
  parameters: {
    component: PdfDropzone,
  },
};

export function Beta() {
  const [files, setFiles] = useState({});
  const signers = [
    { id: '1', firstName: 'John', lastName: 'Schmoe' },
    { id: '2', firstName: 'Joe', lastName: 'Exotic' },
  ];

  const disabled = boolean('disabled', false, 'props')


  console.log('data', data);
  return (
    <div className='container'>

      <div className='row'>

        <div className='col-xs-12'>
          <PdfDropzone
            signers={signers}
            disabled={disabled}
            files={files}
            onFilesChanged={(newFiles) => {
              console.log('files changed', newFiles);
              setFiles(newFiles);
              // dispatch({ type: 'set-files', payload: { ...state.files, ...newFiles } });
              // // dispatch({ type: 'clear-uploaded-files', payload: false });
              // dispatch({ type: 'action-confirmed', payload: true });
            }}
          // onReady={setWv}
          />
        </div>
      </div>
    </div>
  );
}
