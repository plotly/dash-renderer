/*eslint-env browser */

'use strict';
import { DashRenderer } from './DashRenderer'

const renderer = new DashRenderer({
    request_pre: () => {
        /* eslint-disable no-console */
        console.log('THIS IS THE REQUEST PRE HOOK');
        /* eslint-enable no-console */
    },
    request_post: () => {
        /* eslint-disable no-console */
        console.log('THIS IS THE REQUEST *POST* HOOK');
        /* eslint-enable no-console */
    }

})

window.console.log(renderer)