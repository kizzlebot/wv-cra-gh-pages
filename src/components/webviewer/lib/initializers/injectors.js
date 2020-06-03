import * as R from 'ramda';
import _ from 'lodash';

export const injectToolArr = async (instance) => ({
  instance,
  header: [],
  tools: [],
  headers: {},
  headerItems: [],
});



export const toHeaderGroup = (groupName) => ({ instance, header, headers, ...rest }) => ({
  ...rest,
  header: [],
  tools: [],
  instance,
  headers: {
    ...headers,
    [groupName]: _.chain(header)
      .castArray()
      .map((h) => {
        return (h.onClick) ? ({
          ...h,
          onClick: h.onClick(instance),
        }) : h
      })
      .value()
  }
})

export const injectHeaderItem = (conf) => async ({ instance, headerItems, ...rest }) => ({
  ...rest,
  instance,
  headerItems: [...headerItems, (conf.onClick) ? {
    ...conf,
    onClick: conf.onClick(instance)
  } : conf],
});


export const setHeaderItems = ({ insertBefore }) => async ({ headerItems, instance, ...rest }) => {
  instance.setHeaderItems((header) => {
    _.map(headerItems, (item) => {
      header.get(insertBefore).insertBefore(item);
    });
  });

  return {
    ...rest,
    instance,
    headerItems: []
  }
};


export const registerHeaderGroup = ({ groupName }) => async ({ instance, headers, ...rest }) => {
  console.log(headers);
  instance.registerHeaderGroup(groupName, [
    { type: 'spacer' },
    { type: 'divider' },
    ...headers[groupName],
  ]);

  return {
    ...rest,
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