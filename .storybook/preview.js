// import '../src/index.css'
import React from 'react';
import { addDecorator } from '@storybook/react';
import { GlobalStyle } from '../src/shared/global';
import '../src/shared/styles/components/footer.css';
import '../src/shared/styles/scss/app.scss';
import '../src/shared/styles/scss/main.scss';
import '../src/shared/styles/scss/main-responsive.scss';
// import '@storybook/addon-console';




addDecorator((story) => (
  <>
    <GlobalStyle />
    {story()}
  </>
));
