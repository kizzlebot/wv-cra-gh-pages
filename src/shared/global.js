import { createGlobalStyle, css } from 'styled-components';


export const GlobalStyle = createGlobalStyle`

  body, html, #root, App, #storybook-preview-iframe {
    height: 100% !important;
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden
  }
`;
