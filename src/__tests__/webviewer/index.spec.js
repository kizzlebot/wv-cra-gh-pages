
import React from 'react';
import { render } from '@testing-library/react';

import Webviewer from '../../components/webviewer/index';

it('renders without crashing', () => {
  const div = document.createElement('div');

  const mockOnReady = jest.fn((x) => console.log('onReady', x));

  const { baseElement } = render(<Webviewer onReady={mockOnReady}/>);
  console.log('baseElement', baseElement);

});
