import _ from 'lodash';

export const injectToolArr = async ({ instance, config }) => ({
  instance,
  config,
  annotClasses: {},
  tools: {
    Spacer: { type: 'spacer' },
    Divider: { type: 'divider' },
  },
  toolClasses: {},
  panels: {}
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
};


export const injectPanel = (panelName, panelConfig) => async ({ panels, ...rest }) => {
  return {
    ...rest,
    panels: {
      ...panels,
      [panelName]: _.isFunction(panelConfig) ? await panelConfig({ panels, ...rest, }) : panelConfig 
    }
  }
};