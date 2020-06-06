import defineToolClass from '../defineToolClass';


describe('defineToolClass({ className, baseClassName, annotClassName, onAnnotationAdded })', () => {

  it('should create an instance of GenerateAnnotationCreateTool', async () => {
    expect(window.Tools).toBeDefined();
    const onAnnotationAdded = jest.fn(() => () => {});
    const createToolClass = defineToolClass({
      className: 'CustomTool',
      baseClassName: 'GenericAnnotationCreateTool',
      annotClassName: 'RectangleAnnotation',
      onAnnotationAdded
    });

    const instance = { 
      Annotations: window.Annotations, 
      Tools: window.Tools, 
    };
    const pipeConfig = await createToolClass({
      tools: {},
      annotClasses: { ...window.Annotations },
      instance
    });

    expect(pipeConfig.tools.CustomTool).toBeDefined();
    expect(pipeConfig.tools.CustomTool.prototype).toBeInstanceOf(window.Tools.GenericAnnotationCreateTool);
    const docViewer = new window.CoreControls.DocumentViewer();
    const tool = new pipeConfig.tools.CustomTool(docViewer);
    expect(tool).toBeDefined();

    expect(tool.trigger).toBeDefined();
    tool.trigger('annotationAdded', { id: 1 });
    expect(onAnnotationAdded)
      .toHaveBeenCalled();


  });
});