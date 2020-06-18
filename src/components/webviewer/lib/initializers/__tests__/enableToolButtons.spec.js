import enableToolButtons from '../enableToolButtons';



describe('enableToolButtons({ config, instance, ...rest })', () => {

  it('should call instance.setHeaderItems', () => {
    const setHeaderItems = jest.fn();
    const instance = { setHeaderItems }


    enableToolButtons({ 
      instance,
      tools: {
        TestToolButton: {}
      },
      config: {
        toolNames: ['TestToolButton']
      }
    });


    expect(setHeaderItems).toHaveBeenCalled();
  });

  it('should call header.get("eraserToolButton").insertBefore(tools[toolName])', () => {
    const insertBefore = jest.fn();
    const header = { get: jest.fn(() => ({ insertBefore })) }
    const setHeaderItems = jest.fn((cb) => cb(header));
    const instance = { setHeaderItems }


    enableToolButtons({ 
      instance,
      tools: {
        TestToolButton: {}
      },
      config: {
        toolNames: ['TestToolButton']
      }
    });


    expect(setHeaderItems).toHaveBeenCalled();
    expect(header.get).toHaveBeenCalled();
    expect(insertBefore).toHaveBeenCalled();
  });
});