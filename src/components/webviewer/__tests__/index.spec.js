import React from 'react';
import { render, waitForElement } from '@testing-library/react';

import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { shallow, mount } from 'enzyme';
import fs from 'fs';
import path from 'path';
import Webviewer from '../viewer'



it.only('renders without crashing', async () => {
  const mockOnReady = jest.fn((x) => console.log('onReady', x));
  const { debug, findByTestId } = render(
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
