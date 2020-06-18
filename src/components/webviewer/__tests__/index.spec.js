import React from 'react';
import { render } from '@testing-library/react';

import Webviewer from '../viewer'



it('renders without crashing', async () => {
  const mockOnReady = jest.fn((x) => console.log('onReady', x));
  const { findByTestId } = render(
    <Webviewer 
      onReady={mockOnReady}
    />
  );


  expect(await findByTestId('webviewer-container')).toBeDefined();
  // console.log('container', debug());
  // await waitForElement(() => wrapper.findBy('.webviewer-container'))

  
  // console.log('container', wrapper.html());
  // console.log('container', wrapper.debug());

}, 20000);
