import React from "react";
import Webviewer from "./webviewer";
import { withKnobs, text, boolean, number, select } from "@storybook/addon-knobs";


export default {
  title: "Design System|Webviewer",

  decorators: [withKnobs],
  parameters: {
    component: Webviewer,
  },
};

export const standard = () => {
  const l = text('license', 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7', 'config');
  const fullAPI = boolean('fullApi', true, 'config');
  const config = text('config', '/config.js', 'config');
  const initialDoc = text('initialDoc', `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`, 'config');

  const selectedDoc = select('documents', {
    'linearized.pdf': `https://storage.googleapis.com/enl-static-files/local/linearized.pdf`,
    'ack.pdf': 'https://storage.googleapis.com/enl-static-files/local/ack.pdf',
    None: null
  }, 'linearized.pdf', 'props');

  const pdftronServer = text('pdftronServer', `https://webviewer-server.staging.enotarylog.com`, 'config');

  return (
    <Webviewer 
      config={{
        l,
        path: `${process.env.PUBLIC_URL}/lib`,
        fullAPI,
        pdftronServer,
        initialDoc,
        config: config ? `${process.env.PUBLIC_URL}${config}` : undefined
      }}
      selectedDoc={selectedDoc}
    />
  );
}