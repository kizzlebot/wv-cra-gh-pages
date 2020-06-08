import React from "react";
import Collab from '../components/webviewer/collab';
import { FirebaseProvider } from '../lib/hooks/useFirebase';
import { ServerProvider } from '../lib/hooks/useServerProvider';

import { withKnobs, text, radios, boolean, number, select, optionsKnob as options } from "@storybook/addon-knobs";
import data from './lib/data';
import _ from 'lodash';
import faker from 'faker';
import config from './lib/config';
import { useGetSetState } from "react-use";


export default {
  title: "Design System|Webviewer",

  decorators: [withKnobs({ escapeHTML: false })],
  parameters: {
    component: Collab,
  },
};

const docs = {
  'linearized.pdf': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
  'ack.pdf': 'https://storage.googleapis.com/enl-static-files/local/ack.pdf',
}


const userId = sessionStorage.getItem('userId') ? sessionStorage.getItem('userId') : `${Math.floor(Math.random() * 10000000)}`;
sessionStorage.setItem('userId', userId);

const user = (sessionStorage.getItem(userId)) ? JSON.parse(sessionStorage.getItem(userId)) : {
  id: userId,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
}

sessionStorage.setItem(userId, JSON.stringify(user));






export function Beta() {
  const selectedDoc = select('documents', ['ack.pdf', 'linearized.pdf'], 'linearized.pdf', 'props');
  const [getState, setState] = useGetSetState({ signers: {} });

  const signerIds = _.keys(getState().signers)
  const selectedSigner = select('selectedSigner', signerIds, userId, 'props');

  const pdftronServer = text('pdftronServer', `https://webviewer-server.staging.enotarylog.com`, 'config');

  const l = text('license', 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7', 'config');
  const fullAPI = boolean('fullApi', true, 'config');
  const isAdminUser = boolean('isAdminUser', false, 'props')
   


  
  return (
    <FirebaseProvider>
      <ServerProvider
        config={{
          nsId: '8d976a23-b865-4fcd-9165-ddc0aedaf614',
          userId,
          user,
          rtdbNamespace:'8d976a23-b865-4fcd-9165-ddc0aedaf614'
        }}
      >
        <Collab
          config={{
            ...config,
            pdftronServer,
            l,
            fullAPI,
          }}
          userId={userId}
          selectedSigner={selectedSigner}
          isAdminUser={isAdminUser}
          docs={docs}
          selectedDocId={selectedDoc}
          onSignersUpdated={(signers) => setState({ signers })}
        />
        </ServerProvider>
    </FirebaseProvider>
  )
}

