import * as R from 'ramda';
import _ from 'lodash';

const getName = (prop) => R.pipe(
  R.ifElse(
    R.propSatisfies(R.complement(R.isNil), prop),
    R.prop(prop),
    R.path(['user', prop])
  )
);

const upperFirst = R.pipe(
  R.juxt([R.pipe(R.nth(0), R.toUpper), R.tail]),
  R.join('')
);

const parseName = R.pipe(
  R.juxt([getName('firstName'), getName('lastName')]),
  R.map(upperFirst),
  R.join(' ')
)

export const toFullName = R.pipe(
  R.split(' '),
  R.map(_.upperFirst),
  R.join(' ')
);



export default parseName;