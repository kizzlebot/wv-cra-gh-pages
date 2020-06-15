import * as R from 'ramda';
import path from 'path';

const getFilesToImport = R.pipe(
  R.invoker(0, 'keys'),
  R.filter(R.complement(R.includes)('index.js'))
);


const baseName = (f) => path.basename(f, '.js');

const requireAll = (r) => R.pipe(
  getFilesToImport,
  R.map(R.juxt([baseName, r])),
  R.fromPairs
)(r)

export default requireAll(require.context('./', true, /\.js$/));