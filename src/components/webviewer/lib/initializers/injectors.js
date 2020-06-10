import _ from 'lodash';

export const injectToolArr = async (instance) => ({
  instance,
  header: [],
  annotClasses: {},
  tools: {},
  headers: {},
  headerItems: [],
});



export const toHeaderGroup = (groupName) => async ({ instance, header, headers, ...rest }) => ({
  ...rest,
  header: [],
  instance,
  headers: {
    ...headers,
    [groupName]: _.chain(header)
      .castArray()
      .map((h) => {
        return (h.onClick) ? ({
          ...h,
          onClick: h.onClick({ instance, header, headers, ...rest }),
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
    onClick: conf.onClick({ instance, headerItems, ...rest })
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
  // instance.registerHeaderGroup(groupName, [
  //   { type: 'spacer' },
  //   { type: 'divider' },
  //   ...headers[groupName],
  // ]);

  instance.setHeaderItems((obj) => {
    obj.headers[groupName] = [
      { type: 'spacer' },
      { type: 'divider' },
      ...headers[groupName]
    ]
    return obj;
  });
  
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