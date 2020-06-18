import _ from 'lodash';
const backIcon = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="redo" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-redo fa-w-16 fa-5x"><path fill="currentColor" d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z" class=""></path></svg>`

export const injectToolArr = async ({ instance, config }) => ({
  instance,
  config,
  annotClasses: {},
  tools: {
    Spacer: { type: 'spacer' },
    Divider: { type: 'divider' },
  },
  toolClasses: {},
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





export const registerHeaderGroup = ({ 
  groupName, 
  toolNames
}) => async ({ instance, tools, ...rest }) => {
  instance.setHeaderItems((obj) => {
    obj.headers[groupName] = [
      { type: 'spacer' },
      { type: 'divider' },
      ..._.values(_.pick(tools, toolNames)),
      { type: 'divider' },
      {
        type: 'actionButton',
        img: backIcon,
        title: 'Back',
        dataElement: 'goBack',
        onClick: async () => instance.setActiveHeaderGroup('default')
      }
    ]
    return obj;
  });
  
  return {
    ...rest,
    tools,
    instance,
  }
}


// export const updateTool = ({ toolName, buttonGroup }) => async ({ instance, ...rest }) => {
//   instance.updateTool(toolName, { buttonGroup });
//   return {
//     ...rest,
//     instance,  }
// }