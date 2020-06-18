import defineAnnotClass from '../defineAnnotClass';


describe('defineAnnotClass({ className, baseClassName, customData })', () => {

  it('should define an annotClass which extends from Annotations[baseClassName]', async () => {

    const createAnnotClass = defineAnnotClass({
      className: 'CustomAnnotClass',
      baseClassName: 'FreeTextAnnotation',
      customData: {
        label: 'test me out'
      }
    });

    const mockRedrawAnnots = jest.fn();

    const pipeConfig = await createAnnotClass({
      instance: { 
        Annotations: window.Annotations, 
        getSignerById: () => ({
          id: '1',
          color: { R: 153, G: 215, B: 114, A: 0.5 },
          firstName: 'James',
          lastName: 'Choi'
        }),
        annotManager: { redrawAnnotation: mockRedrawAnnots },
      },
      annotClasses: {}
    });


    expect(pipeConfig).toBeDefined();
    expect(pipeConfig.annotClasses).toBeDefined()
    expect(pipeConfig.annotClasses.CustomAnnotClass).toBeDefined()
    expect(pipeConfig.annotClasses.CustomAnnotClass.prototype)
      .toBeInstanceOf(window.Annotations.FreeTextAnnotation)

  });

  it('should set custom data on the defined annotClass', async () => {

    const createAnnotClass = defineAnnotClass({
      className: 'CustomAnnotClass',
      baseClassName: 'DummyClass',
      customData: {
        label: 'test me out'
      }
    });

    const mockRedrawAnnots = jest.fn((x) => {});
    const getSignerById = jest.fn((id) => ({
      id,
      color: { R: 153, G: 215, B: 114, A: 0.5 },
      firstName: 'James',
      lastName: 'Choi'
    }))

    const draw = jest.fn();
    class DummyClass extends window.Annotations.FreeTextAnnotation{
      draw(){
        return draw();
      }
    }

    const pipeConfig = await createAnnotClass({
      instance: { 
        Annotations: { ...window.Annotations, DummyClass }, 
        getSignerById,
        annotManager: { 
          redrawAnnotation: mockRedrawAnnots,
          trigger: () => {}
        },
      },
      annotClasses: {}
    });


    const inst = new pipeConfig.annotClasses.CustomAnnotClass();
    expect(inst).toBeDefined();
    inst.setSigner('1');
    expect(mockRedrawAnnots).toHaveBeenCalledWith(inst);
    expect(getSignerById).toHaveBeenCalledWith('1');
    inst.setIsRequired(true);
    expect(inst.CustomData.flags.required).toEqual(true);
    inst.CustomData = { flags: {} };
    inst.setIsRequired(false);
    expect(inst.CustomData.flags.required).toEqual(false);


    inst.draw();
    expect(draw).toHaveBeenCalled();


  });
})