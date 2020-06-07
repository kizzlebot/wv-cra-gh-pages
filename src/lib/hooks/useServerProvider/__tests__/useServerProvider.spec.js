import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';

import { ServerProvider, useServer } from '../';
jest.mock('../server', () => {
  return async () => {
    return ({
      initialize: () => {}
    })
  }
});

jest.mock('../../useFirebase', () => {
  return {
    useFirebase: () => ({
      initializeApp: {}
    })
  }
});


const config = { userId: '1234', rtdbNamespace: 'orgIdHere', nsId: 'test' }
const wrapper = ({ children }) => <ServerProvider config={config}>{children}</ServerProvider>;

describe('useServerProvider', () => {
  it('should exist', () => {
    expect(ServerProvider).toBeDefined();
  })


  
  it('should render', async () => {
    const { result, waitForNextUpdate } = renderHook(useServer, { wrapper });
    expect(result).toBeDefined();
    await waitForNextUpdate();

  }, 5000)
});