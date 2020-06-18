import { injectToolArr, injectTool, registerHeaderGroup, updateTool } from '../injectors';



describe('injectors', () => {

  describe('injectToolArray({ instance, config })', () => {
    it('should add instance and config to an object and return it', async () => {
      const config = { name: 'config' };
      const rtn = await injectToolArr({ instance: 'instance', config })
      expect(rtn.config.name).toEqual(config.name);
      expect(rtn.instance).toEqual('instance');
    })
  })

  describe('injectTool(toolName, toolButtonConfig)', () => {
    it('should call toolButtonConfig if its a function', async () => {
      const toolButtonConfig = jest.fn(() => ({ name: 'test' }));
      const config = await injectTool('ToolName', toolButtonConfig)({ tools: {} })
      expect(config.tools.ToolName).toBeDefined();
    });

    it('should call toolButtonConfig.onClick if its a function', async () => {
      const onClick = jest.fn(() => ({}));
      const toolButtonConfig = {
        name: 'test',
        onClick
      }

      const config = await injectTool('ToolName', toolButtonConfig)({ tools: {} })
      expect(config.tools.ToolName).toBeDefined();
      expect(onClick).toHaveBeenCalled();
    })

    it('should add toolButtonConfig to tools[toolName]', async () => {
      
      const toolButtonConfig = { name: 'test', }

      const config = await injectTool('ToolName', toolButtonConfig)({ tools: {} })
      expect(config.tools.ToolName).toBeDefined();
      expect(config.tools.ToolName).toEqual(toolButtonConfig)
    })

  });

  describe('registerHeaderGroup({ groupName, toolNames })', () => {
    it('should call instance.setHeaderItems', () => {
      const headersObj = { headers: {} };
      const setHeaderItems = jest.fn((cb) => cb(headersObj));
      const setActiveHeaderGroup = jest.fn();
      
      const instance = { setHeaderItems, setActiveHeaderGroup }


      registerHeaderGroup({
        instance,
        groupName: 'TestGroup',
        toolNames: ['TestToolButton']
      })
      ({ instance, tools: { TestToolButton: {} } })


      expect(setHeaderItems).toHaveBeenCalled();
      expect(headersObj.headers.TestGroup).toBeDefined();
      expect(headersObj.headers.TestGroup[headersObj.headers.TestGroup.length - 1].onClick).toBeDefined();
      headersObj.headers.TestGroup[headersObj.headers.TestGroup.length - 1].onClick();
      expect(setActiveHeaderGroup).toHaveBeenCalled();
    });

    it('shouldnt call instance.setHeaderItems if not toolNames passed', () => {
      const headersObj = { headers: {} };
      const setHeaderItems = jest.fn((cb) => cb(headersObj));
      const instance = { setHeaderItems }


      registerHeaderGroup({
        instance,
        groupName: 'TestGroup',
        toolNames: []
      })({ instance, tools: { TestToolButton: {} } })



    });
  });


});