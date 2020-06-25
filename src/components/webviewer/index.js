import React from 'react';
import _ from 'lodash';
import * as R from 'ramda';
import { useToggle, useEffectOnce } from 'react-use';
import Collab from './collab';
import { withAppStateProvider, useAppState } from 'lib/hooks/AppState';
import { withServerProvider, useServer } from 'lib/hooks/useServerProvider';
import { useParams } from 'react-router-dom';


const toolConfigs = {
  admin: {
    // panelNames: ['TestPanel'],
    toolNames: [
      'LockCheckbox',
      'Divider', 
      'SelectSigner', 
      'Divider', 
      'AddBlankPage', 
      'RemoveBlankPage', 
      'Divider', 
      'RemoveFormFields', 
      'Divider', 
      'FormFieldTools', 
      'TemplateTools', 
      'Divider', 
      'StampTools', 
      'CertTool'
    ],
    popupNames: [
      'AssignSigner',
      'SetRequired'
    ]
  },
  signer: {
    toolNames: [
      'ShowSigner', 
      'Divider', 
    ],
  }
};

function WebviewerApp({ userType }) {
  const appState = useAppState();


  useEffectOnce(() => {
    // appState.setSelectedDoc(_.head(_.keys(appState.docs)))
  }, []);
  


  return (
    <>
      <div className="App d-flex flex-column" style={{ height: '100% !important' }}>
        <Collab 
          toolConfig={toolConfigs[userType]}
        />
      </div>
    </>
  );
}


const composeComponent = R.compose(
  withServerProvider((props) => {
    const { organizationId, nsId } = useParams();

    const rtn = {
      nsId: nsId,
      isAdmin: props.isAdmin,
      userId: props.userId,
      user: props.user,
      rtdbNamespace: organizationId,
    }
    return rtn;
  }),
  withAppStateProvider,
)


export default composeComponent(WebviewerApp);
