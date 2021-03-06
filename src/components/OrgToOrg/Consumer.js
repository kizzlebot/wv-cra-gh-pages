import React, { useEffect } from 'react'
import * as R from '@enotarylog/ramda';
import ConsumerAuthenticate from './components/ConsumerAuthenticate.modal';
import Collab from 'components/webviewer/collab';
import { useServer, withServerProvider } from 'lib/hooks/useServerProvider';
import useAppState, { withAppStateProvider } from 'lib/hooks/AppState';
import { useParams } from 'react-router-dom';
import { useEffectOnce, useGetSet } from 'react-use';
import * as uuid from 'uuid';
import _ from 'lodash';


function Consumer(props) {
  const appState = useAppState();
  const server = useServer();
  const [getShowAuth, setShowAuth] = useGetSet(false);

  useEffectOnce(() => {
    server.bind('onStatus', ({ val }) => appState.setStatus(val));
  });

  useEffect(() => {
    const runId = appState.getRunId();
    const signersOnDevice = _.chain(appState.signers)
      .values()
      .filter((s) => s.runId === runId)
      .value();

    
    if (appState.status === 'ready' || signersOnDevice.length === 0){
      setShowAuth(true);
    }
    if (appState.status !== 'ready' && signersOnDevice.length > 0){
      setShowAuth(false)
    }
  }, [appState.status, appState.signers, appState, setShowAuth])

  return (
    <>
      <ConsumerAuthenticate 
        show={getShowAuth()}
        addUser={async (values) => {
          await server.addPresence({
            id: uuid.v4(),
            ...values
          })
        }}
        markReady={() => server.markReady(appState.getRunId())}
      />

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
      // signers: props.signers,
      signerLocation: props.signerLocation,  
      runId: appState.getRunId(),
      userType: props.userType
    }
  }),
)


export default composeComponent(Consumer);
