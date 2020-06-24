import React from 'react'
import * as R from 'ramda';
import { injectPanel } from "../../initializers/injectors";
import TestPanel from './component';



const registerCustomPanel = R.pipeP(
  injectPanel('TestPanel', ({ instance }) => ({
    tab:{
      dataElement: 'customPanelTab',
      title: 'customPanelTab',
      img: 'https://www.pdftron.com/favicon-32x32.png',
    },
    panel: {
      dataElement: 'customPanel',
      render: () => <TestPanel/>
    }
  })),
);


export default registerCustomPanel;