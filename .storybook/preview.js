// import '../src/index.css'
import React from 'react';
import { addDecorator } from '@storybook/react';
import { GlobalStyle } from '../src/shared/global';
// import '@storybook/addon-console';




addDecorator((story) => (
  <>
    <GlobalStyle />
    {story()}
  </>
));
