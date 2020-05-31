import R from '@merlionsolutions/ramda';
import _ from 'lodash';


export const escapeQuotes = R.pipe(
  R.tryCatch(
    JSON.stringify,
    R.always({})
  )
)