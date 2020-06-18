import _ from 'lodash';
const enableToolButtons = async ({ instance, config, tools, ...rest }) => {
  _.map(config.toolNames, (toolName) => {
    instance.setHeaderItems((header) => {
        header.get('eraserToolButton').insertBefore(tools[toolName]);
    });
  })
  return {
    instance,
    config,
    tools,
    ...rest
  }
}

export default enableToolButtons;