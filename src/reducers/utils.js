import R from 'ramda';

const extend = R.reduce(R.flip(R.append))

// crawl a layout object, apply a function on every object
export const crawlLayout = (object, func, path=[]) => {
    func(object, path);

    /*
     * object may be a string, a number, or null
     * R.has will return false for both of those types
     */
    if (R.type(object) === 'Object') {
        R.keys(object).forEach(key => {
            const newPath = extend(path, [key]);

            crawlLayout(
                object[key],
                func,
                newPath);

        });
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

export function hasId(element) {
    return (
        R.type(element) === 'Object' &&
        R.has('props', element) &&
        R.has('id', element.props)
    );
}
