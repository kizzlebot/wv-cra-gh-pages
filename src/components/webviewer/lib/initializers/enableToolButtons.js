import _ from 'lodash';
const enableToolButtons = async ({ instance, config, tools, ...rest }) => {
  _.map(config.toolNames, (toolName) => {
    if (!tools[toolName]){
      throw new Error(`${toolName} tool not found`);
    }
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