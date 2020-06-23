import React from 'react'
import _ from 'lodash';
import * as R from 'ramda';

import { Dropdown } from 'react-bootstrap';
import styled from 'styled-components';
import useAppState from 'lib/hooks/AppState';

const DocSelectorWrapper = styled.div`
  #doc-select {
    box-shadow: none !important;
  }
`;


const DocSelector = (props) => {
  const appState = useAppState();
  
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