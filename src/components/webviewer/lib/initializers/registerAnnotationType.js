const registerAnnotationType = ({ elementName, annotClassName }) => async ({ instance, annotClasses, ...rest }) => {
  console.log(annotClassName, { annotClasses })
  await instance.annotManager.registerAnnotationType(annotClasses[annotClassName].prototype.elementName, annotClasses[annotClassName]);
  return ({
    ...rest,
    annotClasses,
    instance,
  })
};



export default registerAnnotationType;