import React, { useEffect } from 'react'
import * as R from '@enotarylog/ramda';
import Collab from 'components/webviewer/collab';
import { useServer, withServerProvider } from 'lib/hooks/useServerProvider';
import useAppState, { withAppStateProvider } from 'lib/hooks/AppState';
import { useParams } from 'react-router-dom';
import { useEffectOnce, useGetSet } from 'react-use';

import * as uuid from 'uuid';
import _ from 'lodash';



function Notary(props) {
  const appState = useAppState();
  const server = useServer();
  const [getShowAuth, setShowAuth] = useGetSet(false);

  useEffectOnce(() => {
    // server.bind('onAuthorsChanged', ({ val }) => appState.setSigners(val), 'main');
    server.bind('onStatus', ({ val }) => {
      console.log('signers', appState.signers, uuid);
      appState.setStatus(val)
    });
  });

  useEffect(() => {
    const runId = appState.getRunId();
    const signersOnDevice = _.chain(appState.signers)
      .values()
      .filter((s) => s.runId === runId)
      .value();
    console.log('signers changed', appState.signers, signersOnDevice)
  }, [appState.status, appState.signers, appState, setShowAuth])

  
  return (
    <>
      <Collab {...props} />
    </>
  )
}


const composeComponent = R.compose(
  withAppStateProvider,
  withServerProvider((props) => {
    const { organizationId, nsId } = useParams();
    const appState = useAppState();

    return {
      nsId: nsId,
      rtdbNamespace: organizationId,
      signers: props.signers,
      signerLocation: props.signerLocation,  
      userId: props.userId,
      user: props.user,
      runId: appState.getRunId(),
      userType: props.userType
    }
  }),
);


export default composeComponent(Notary);
