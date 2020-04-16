module.exports = {
  stories: [
    '../src/**/*.stories.js',
    // '../src/components/**/*.stories.js'
  ],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    '@storybook/addon-knobs',
    '@storybook/addon-a11y',
    'storybook-dark-mode/register'
  ],
};