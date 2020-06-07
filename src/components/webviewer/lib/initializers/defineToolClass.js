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
      if (onMouseLeftDown){
        return onMouseLeftDown({ context: { tool: this, args }, instance, tools, annotClasses, ...rest })
      }
      // super.mouseLeftDown(...args);
    }

    mouseLeftUp(...args){
      if (onMouseLeftUp){
        return onMouseLeftUp({ context: { tool: this, args }, instance, tools, annotClasses, ...rest })
      }
      // super.mouseLeftDown(...args);
    }
  };


  if (!onMouseLeftDown){
    C.prototype.mouseLeftDown = BaseClass.prototype.mouseLeftDown;
  }
  if (!onMouseLeftUp){
    C.prototype.mouseLeftUp = BaseClass.prototype.mouseLeftUp;
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