

export const injectToolArr = async (instance) => ({
  instance,
  header: [],
  tools: [],
  headers: {},
});



export const toHeaderGroup = (groupName) => ({ header, headers, ...rest }) => ({
  ...rest,
  header: [],
  tools: [],
  headers: {
    ...headers,
    [groupName]: header
  }
})