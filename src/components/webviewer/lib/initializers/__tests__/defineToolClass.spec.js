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


    function DummyTool(docViewer){
      expect(docViewer).toBeInstanceOf(window.CoreControls.DocumentViewer);
    }

    const mockSwitchIn = jest.fn((x) => console.log('onReady', x));
    const mouseLeftDown = jest.fn((x) => console.log('onReady', x));
    const mouseLeftUp = jest.fn((x) => console.log('onReady', x));
    DummyTool.prototype.switchIn = function() {
      mockSwitchIn(...arguments);
    }
    DummyTool.prototype.mouseLeftDown = function() {
      mouseLeftDown(...arguments);
    }

    DummyTool.prototype.mouseLeftUp = function() {
      mouseLeftUp(...arguments);
    }
    DummyTool.prototype.on = function() {
     
    }

    const pipeConfig = await createToolClass({
      tools: {},
      annotClasses: { ...window.Annotations },
      instance
    });

    expect(pipeConfig.toolClasses.CustomTool).toBeDefined();
    expect(pipeConfig.toolClasses.CustomTool.prototype).toBeInstanceOf(window.Tools.GenericAnnotationCreateTool);
    const docViewer = new window.CoreControls.DocumentViewer();
    const tool = new pipeConfig.toolClasses.CustomTool(docViewer);
    expect(tool).toBeDefined();

    expect(tool.trigger).toBeDefined();
    tool.trigger('annotationAdded', { id: 1 });
    expect(onAnnotationAdded)
      .toHaveBeenCalled();
  });

  it('should create an instance of DummyTool', async () => {
    expect(window.Tools).toBeDefined();
    const onAnnotationAdded = jest.fn(() => () => {});
    const createToolClass = defineToolClass({
      className: 'CustomTool',
      baseClassName: 'DummyTool',
      annotClassName: 'RectangleAnnotation',
      onAnnotationAdded
    });


    const instance = { 
      Annotations: window.Annotations, 
      Tools: { ...window.Tools, DummyTool  }, 

    };


    function DummyTool(docViewer){
      expect(docViewer).toBeInstanceOf(window.CoreControls.DocumentViewer);
    }

    const mockSwitchIn = jest.fn((x) => console.log('onReady', x));
    const mouseLeftDown = jest.fn((x) => console.log('onReady', x));
    const mouseLeftUp = jest.fn((x) => console.log('onReady', x));
    DummyTool.prototype.switchIn = function() {
      mockSwitchIn(...arguments);
    }
    DummyTool.prototype.mouseLeftDown = function() {
      mouseLeftDown(...arguments);
    }

    DummyTool.prototype.mouseLeftUp = function() {
      mouseLeftUp(...arguments);
    }
    DummyTool.prototype.on = function() {
    }
    DummyTool.prototype.trigger = function() {
    }

    const pipeConfig = await createToolClass({
      tools: {},
      annotClasses: { ...window.Annotations },
      instance
    });

    expect(pipeConfig.toolClasses.CustomTool).toBeDefined();
    expect(pipeConfig.toolClasses.CustomTool.prototype).toBeInstanceOf(DummyTool);
    const docViewer = new window.CoreControls.DocumentViewer();
    const tool = new pipeConfig.toolClasses.CustomTool(docViewer);
    expect(tool).toBeDefined();

    expect(tool.trigger).toBeDefined();
    tool.trigger('annotationAdded', { id: 1 });
    expect(onAnnotationAdded)
      .toHaveBeenCalled();
    tool.mouseLeftDown();
    tool.mouseLeftUp();
    
    expect(mouseLeftDown)
      .toHaveBeenCalled();
    expect(mouseLeftUp)
      .toHaveBeenCalled();

  });

  it('overrides switchIn if passed', async () => {
    expect(window.Tools).toBeDefined();
    const onAnnotationAdded = jest.fn(() => () => {});
    const onMouseLeftDown = jest.fn((x) => console.log('onMouseLeftDown'))
    const onMouseLeftUp = jest.fn((x) => console.log('onMouseLeftUp'))
    const createToolClass = defineToolClass({
      className: 'CustomTool',
      baseClassName: 'DummyTool',
      annotClassName: 'RectangleAnnotation',
      onAnnotationAdded,
      onMouseLeftDown,
      onMouseLeftUp,
    });




    function DummyTool(docViewer){
      expect(docViewer).toBeInstanceOf(window.CoreControls.DocumentViewer);
    }

    const mockSwitchIn = jest.fn((x) => console.log('onReady', x));
    const mouseLeftDown = jest.fn((x) => console.log('onReady', x));
    const mouseLeftUp = jest.fn((x) => console.log('onReady', x));
    DummyTool.prototype.switchIn = function() {
      mockSwitchIn(...arguments);
    }
    DummyTool.prototype.on = function() { }
    DummyTool.prototype.mouseLeftDown = function() {
      mouseLeftDown(...arguments);
    }

    DummyTool.prototype.mouseLeftUp = function() {
      mouseLeftUp(...arguments);
    }


    const instance = { 
      Annotations: window.Annotations, 
      Tools: { ...window.Tools, DummyTool  }, 
    };
    const pipeConfig = await createToolClass({
      tools: {},
      annotClasses: { },
      instance
    });

    expect(pipeConfig.toolClasses.CustomTool).toBeDefined();
    expect(pipeConfig.toolClasses.CustomTool.prototype).toBeInstanceOf(DummyTool);
    const docViewer = new window.CoreControls.DocumentViewer();
    const tool = new pipeConfig.toolClasses.CustomTool(docViewer);
    expect(tool).toBeDefined();

    expect(tool.defaults.FillColor).toBeDefined();
    tool.switchIn();
    expect(mockSwitchIn)
      .toHaveBeenCalled();

    tool.mouseLeftDown();
    tool.mouseLeftUp();
    expect(onMouseLeftDown)
      .toHaveBeenCalled();

    expect(onMouseLeftUp)
      .toHaveBeenCalled();

  });
});