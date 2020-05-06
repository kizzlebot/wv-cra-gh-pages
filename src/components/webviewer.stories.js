import React from "react";
import Webviewer from "./webviewer";
import { withKnobs, text, boolean, number, select } from "@storybook/addon-knobs";
import data from './data';


export default {
  title: "Design System|Webviewer",

  decorators: [withKnobs],
  parameters: {
    component: Webviewer,
  },
};

export const beta = () => {
  const selectedDoc = select('documents', ['linearized.pdf', 'ack.pdf'], 'linearized.pdf', 'props');


  const selectAnnotations = select('annotations', data, 'first', 'props');

  console.log("<?xml version='1.0' encoding='UTF-8' ?><xfdf xmlns='http://ns.adobe.com/xfdf/' xml:space='preserve'><pdf-info xmlns='http://www.pdftron.com/pdfinfo' version='2' import-version='3' /><fields /><annots><ink page='0' rect='381.987578,376.531323,581.987578,488.628097' color='#000000' flags='print' name='cee4d9c3-83ae-dabb-2f4b-6a7fbca659f3' title='1' subject='Signature' date='D:20200505141740-04'00'' creationdate='D:20200505141739-04'00''><trn-custom-data bytes='{&quot;type&quot;:&quot;signature&quot;}'/><inklist><gesture>578.76,386.21</gesture><gesture>581.18,398.31;581.18,400.72;581.18,407.98;578.76,420.08;573.12,433.79;556.18,456.37;523.12,475.72;461.02,487.82;432.79,486.21;410.21,478.14;389.25,457.18;382.79,438.63;382.79,410.4;396.5,385.4;405.37,377.34</gesture></inklist></ink><ink page='0' rect='231.26294,655.503698,431.26294,696.612244' color='#000000' flags='print' name='ccc55d16-53fd-1711-a9dc-d1421e2c4ade' title='1' subject='Signature' date='D:20200505141747-04'00'' creationdate='D:20200505141746-04'00''><trn-custom-data bytes='{&quot;type&quot;:&quot;signature&quot;}'/><inklist><gesture>299.16,696.15;299.16,696.15;298.7,696.15;294.54,693.84;287.15,690.61;261.75,677.67;248.81,670.75;235.42,661.51;231.72,656.89;231.72,656.43;235.88,655.97;260.36,660.12;320.87,672.59;364.75,683.22;398.01,686.45;424.8,684.6;430.34,681.37;430.8,675.83</gesture></inklist></ink><ink page='0' rect='262.732919,248.124492,462.732919,305.647764' color='#000000' flags='print' name='353cbfb1-f2ce-4edd-27b8-15ac36b0c307' title='1' subject='Signature' date='D:20200505141751-04'00'' creationdate='D:20200505141750-04'00''><trn-custom-data bytes='{&quot;type&quot;:&quot;initials&quot;}'/><inklist><gesture>370.24,301.92;366.15,304.65;366.15,304.65;364.33,304.2;347.48,294.18;300.14,270.51;267.37,254.13;263.73,252.31;271.92,253.22;385.72,282.35;436.7,293.73;456.73,295.09;461.74,293.73;454,280.98;444.9,268.24;433.06,249.12</gesture></inklist></ink><ink page='0' rect='73.913043,485.641934,273.913043,581.58788' color='#000000' flags='print' name='1de0afd7-2476-999c-bbcd-5ddf9d0c531e' title='1' subject='Signature' date='D:20200505141757-04'00'' creationdate='D:20200505141755-04'00''><trn-custom-data bytes='{&quot;type&quot;:&quot;signature&quot;}'/><inklist><gesture>109.05,540.37</gesture><gesture>109.05,540.37;109.05,539.02;107.7,535.64;100.94,522.13;86.75,500.51;77.29,486.32;74.59,486.32;77.97,492.4;85.4,505.24;91.48,516.72;95.53,524.16;98.24,528.21;100.94,531.59</gesture><gesture>173.91,568.75;273.24,580.91</gesture></inklist></ink></annots><pages><defmtx matrix='1,0,0,-1,0,792' /></pages></xfdf>")

  const pdftronServer = text('pdftronServer', `https://webviewer-server.staging.enotarylog.com`, 'config');

  const signers = [
    { id: '1', firstName: 'John', lastName: 'Schmoe' },
    { id: '2', firstName: 'Joe', lastName: 'Exotic' },
  ];

  const selectedSigner = select('selectedSigner', ['1', '2'], '1', 'props');

  const l = text('license', 'eNotaryLog, LLC(enotarylog.com):OEM:eNotaryLog::B+:AMS(20201230):76A52CDD0477580A3360B13AC982537860612F83FF486E45958D86734C8F4E902A4935F5C7', 'config');
  const fullAPI = boolean('fullApi', true, 'config');
  const isAdminUser = boolean('isAdminUser', false, 'props')

  const config = text('config', '/config.out.js', 'config');

  console.log('data', data);
  return (
    <Webviewer
      config={{
        l,
        path: `${process.env.PUBLIC_URL}/lib`,
        ui: 'beta',
        fullAPI,
        pdftronServer,
        config: [
          '/wv-configs/state.js',
          '/wv-configs/extendAnnotations.js',
          '/wv-configs/configureHeader.js',
          '/wv-configs/configureFeatures.js',
          '/wv-configs/config.js',
        ]
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