import R from 'ramda';

// crawl a layout object, apply a function on every object
export const crawlLayout = (object, func, path=[]) => {
    func(object, path);
    /* eslint-disable */
    console.warn(path);
    /* eslint-enable */

    /*
     * object may be a string, a number, or null
     * R.has will return false for both of those types
     */
    if (R.type(object) === 'Object') {
        R.keys(object).forEach(key => {
            if (R.contains(R.type(object[key]), ['Array', 'Object'])) {
                crawlLayout(
                    object[key], func, R.append(key, path)
                );
            }
        })
    }  else if (R.type(object) === 'Array') {

        /*
         * Sometimes when we're updating a sub-tree
         * (like when we're responding to a callback)
         * that returns `{children: [{...}, {...}]}`
         * then we'll need to start crawling from
         * an array instead of an object.
         */

        object.forEach((child, i) => {
            crawlLayout(
                child,
                func,
                R.append(i, path));
        });

    }
}

export function hasId(child) {
    return (
        R.type(child) === 'Object' &&
        R.has('props', child) &&
        R.has('id', child.props)
    );
}
