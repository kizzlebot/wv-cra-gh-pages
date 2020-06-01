import * as R from 'ramda';
import { injectToolArr } from "../initializers/injectors";
import registerFormFieldTools from "./formFields";
import registerTemplateTools from "./templating";
import registerStampAnnotTool from "./stamps";

const registerTools = R.pipeP(
  injectToolArr,
  registerFormFieldTools,
  registerTemplateTools,
  registerStampAnnotTool
)
export default registerTools;