import React from "react";
import Webviewer from "../webviewer";
import { withKnobs, text, radios, boolean, number, select, optionsKnob as options } from "@storybook/addon-knobs";
import data from './lib/data';


export default {
  title: "Design System|Webviewer",

  decorators: [withKnobs({ escapeHTML: false })],
  parameters: {
    component: Webviewer,
  },
};

export const beta = () => {
  const selectedDoc = select('documents', ['ack.pdf', 'linearized.pdf'], 'ack.pdf', 'props');


  const selectAnnotations = options('annotations', data, data.first, {
    display: 'select',
  }, 'props')


  const pdftronServer = text('pdftronServer', `https://webviewer-server.staging.enotarylog.com`, 'config');

  const signers = [
    { id: '1', firstName: 'John', lastName: 'Schmoe' },
    { id: '2', firstName: 'Joe', lastName: 'Exotic' },
  ];

  const selectedSigner = radios('selectedSigner', { 1: '1', 2: '2' }, '2', 'props');

  const l = text('license', 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7', 'config');
  const fullAPI = boolean('fullApi', true, 'config');
  const isAdminUser = boolean('isAdminUser', false, 'props')


  return (
    <Webviewer
      config={{
        l,
        path: `${process.env.PUBLIC_URL}/lib`,
        fullAPI,
        pdftronServer,
        config: '/wv-configs/config.js',
      }}
      annotations={selectAnnotations}
      isAdminUser={isAdminUser}
      signers={signers}
      selectedSigner={selectedSigner}
      selectedDoc={selectedDoc}
      docs={{
        'linearized.pdf': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
        'ack.pdf': 'https://storage.googleapis.com/enl-static-files/local/ack.pdf',
      }}
    />
  );
}

export const betad = () => {
  const selectedDoc = select('documents', ['linearized.pdf', 'ack.pdf'], 'linearized.pdf', 'props');


  const selectAnnotations = select('annotations', data, 'first', 'props');


  const pdftronServer = text('pdftronServer', `https://webviewer-server.staging.enotarylog.com`, 'config');

  const signers = [
    { id: '1', firstName: 'John', lastName: 'Schmoe' },
    { id: '2', firstName: 'Joe', lastName: 'Exotic' },
  ];

  const selectedSigner = select('selectedSigner', ['1', '2'], '1', 'props');

  const l = text('license', 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7', 'config');
  const fullAPI = boolean('fullApi', true, 'config');
  const isAdminUser = boolean('isAdminUser', false, 'props')

  const config = text('config', '/config.js', 'config');

  return (
    <Webviewer
      config={{
        l,
        path: `${process.env.PUBLIC_URL}/lib`,
        fullAPI,
        pdftronServer,
        config: '/wv-configs/config.js',
        // config: [
        //   '/wv-configs/state.js',
        //   '/wv-configs/extendAnnotations.js',
        //   '/wv-configs/configureHeader.js',
        //   '/wv-configs/configureFeatures.js',
        //   '/wv-configs/config.js',
        // ]
      }}
      annotations={selectAnnotations}
      isAdminUser={isAdminUser}
      signers={signers}
      selectedSigner={selectedSigner}
      selectedDoc={selectedDoc}
      docs={{
        'linearized.pdf': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
        'ack.pdf': 'https://storage.googleapis.com/enl-static-files/local/ack.pdf',
      }}
    />
  );
}
