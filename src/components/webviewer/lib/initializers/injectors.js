import _ from 'lodash';

export const injectToolArr = async ({ instance, config }) => ({
  instance,
  config,
  header: [],
  annotClasses: {},
  tools: {
    Spacer: { type: 'spacer' },
    Divider: { type: 'divider' },
  },
  toolClasses: {},

  headers: {},
  headerItems: [],
});

export const injectTool = (toolName, toolButtonConfig) => async ({ tools, ...rest }) => {
  return {
    ...rest,
    tools: {
      ...tools,
      [toolName]: _.isFunction(toolButtonConfig) ? toolButtonConfig({ tools, ...rest, }) : toolButtonConfig.onClick ? {
        ...toolButtonConfig,
        onClick: toolButtonConfig.onClick({ ...rest, tools })
      } : toolButtonConfig
    }
  }
}





export const registerHeaderGroup = ({ groupName, toolNames = [] }) => async ({ instance, tools, headers, ...rest }) => {
  instance.setHeaderItems((obj) => {
    obj.headers[groupName] = [
      { type: 'spacer' },
      { type: 'divider' },
      // ..._.pick(tools, toolNames)
      ..._.values(_.pick(tools, toolNames))
    ]
    return obj;
  });
  
  return {
    ...rest,
    tools,
    headers: _.omit(headers, groupName),
    instance,
  }
}


export const updateTool = ({ toolName, buttonGroup }) => async ({ instance, ...rest }) => {
  instance.updateTool(toolName, { buttonGroup });
  return {
    ...rest,
    instance,  }
}