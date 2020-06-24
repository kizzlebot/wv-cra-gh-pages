import React from 'react'
import _ from 'lodash';
import * as R from 'ramda';

import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import useAppState from 'lib/hooks/AppState';
import { useEffectOnce } from 'react-use';

const DocSelectorWrapper = styled.div`
  #doc-select {
    box-shadow: none !important;
  }
`;


const DocSelector = (props) => {
  const appState = useAppState();
  useEffectOnce(() => {
    if (!appState.selectedDoc){
      appState.setSelectedDoc(_.head(_.keys(appState.docs)));
    }
  })

  if (!appState.isAdminUser){
    return <></>
  }
  
  return (
    <DocSelectorWrapper className='col-xs-12 text-center'>
      <Dropdown
        onSelect={appState.setSelectedDoc}
      >
        <Dropdown.Toggle variant='blank' id='doc-select'>
          {appState.selectedDoc || 'Loading Docs...'}
        </Dropdown.Toggle>
  
        <Dropdown.Menu>
          {
            _.map(appState.docs, (url, docId) => (
              <Dropdown.Item
                key={docId}
                eventKey={docId}
                value={docId}
                active={docId === appState.selectedDoc}
              >
                {docId}
              </Dropdown.Item>
            ))
          }
        </Dropdown.Menu>
      </Dropdown>
    </DocSelectorWrapper>
  );
}


export default DocSelector;