import * as R from 'ramda';

const defineToolClass = ({ 
  className, 
  annotClassName,
  baseClassName, 
  onAnnotationAdded = R.always(R.identity),
  switchIn = R.always(R.identity),
  onMouseLeftDown,
  onMouseLeftUp,
}) => async ({ instance, tools, annotClasses, ...rest }) => {

  const BaseClass = instance.Tools[baseClassName];
  
  const C = class extends BaseClass {
    constructor(docViewer) {
      super(docViewer, annotClasses[annotClassName]);
      this.defaults = this.defaults || {};
      this.defaults.FillColor = new instance.Annotations.Color(255, 141, 0, 0.5);
      this.on('annotationAdded', onAnnotationAdded({ instance, tools, annotClasses, ...rest }));
    }

    switchIn(...args){
      super.switchIn(...args);
      return switchIn({ context: { tool: this, args }, instance, tools, annotClasses, ...rest });
    }

    mouseLeftDown(...args){
      console.log('onMouseLeftUp');
      return onMouseLeftDown && onMouseLeftDown({ context: { tool: this, args }, instance, tools, annotClasses, ...rest })
    }

    mouseLeftUp(...args){
      console.log('onMouseLeftUp');
      return onMouseLeftUp && onMouseLeftUp({ context: { tool: this, args }, instance, tools, annotClasses, ...rest })
    }
  };


  if (!onMouseLeftDown){
    C.prototype.mouseLeftDown = instance.Tools.RectangleCreateTool.prototype.mouseLeftDown;
  }
  if (!onMouseLeftUp){
    C.prototype.mouseLeftUp = instance.Tools.RectangleCreateTool.prototype.mouseLeftUp;
  }

  return {
    ...rest,
    tools: {
      ...tools,
      [className]: C,
    },
    annotClasses,
    instance,
  }
}

export default defineToolClass