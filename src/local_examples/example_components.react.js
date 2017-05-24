import R from 'ramda';
import React, {PropTypes, Component} from 'react';

export class Filter extends Component {
    componentWillReceiveProps(nextProps) {
        if (['columns', 'filterColumnId', 'filterValue', 'operation'].find(
            prop => nextProps[prop] !== this.props[prop]
        )) {
            const {
                columns, filterColumnId, operation, filterValue, setProps
            } = nextProps;

            console.warn('nextProps: ', nextProps);

            let filteredColumns;
            if (columns) {
                filteredColumns = R.map(() => [], columns);
            }

            if (!(filterColumnId && operation && filterValue)) {
                if (columns) {
                    setProps({filteredColumns});
                }
                return;
            }

            const pushRow = i => R.keys(filteredColumns).forEach(colId =>
                filteredColumns[colId].push(columns[colId][i])
            );

            columns[filterColumnId].forEach((cell, i) => {
                if ((operation === '<' && cell < parseFloat(filterValue, 10)) ||
                    (operation === '>' && cell > parseFloat(filterValue, 10)) ||
                    (operation === '==' && cell == filterValue) ||
                    (operation === 'intersect' && R.contains(cell, filterValue))
                ) {
                    pushRow(i);
                }
            });
            console.warn('filteredColumns: ', filteredColumns);
            setProps({filteredColumns});
        }
    }

    render() {
        return null;
    }
}
Filter.propTypes = {
    /*
     * `id` and `setProps` are required by dash
     */
    id: PropTypes.string.isRequired,
    setProps: PropTypes.func.isRequired,

    /*
     * The rest of the properties are the
     * declarative properties of the filter
     * transform
     */
    columns: PropTypes.object,
    filterColumnId: PropTypes.string,
    operation: PropTypes.oneOf(['<', '>', '==', 'intersect']),
    filterValue: PropTypes.oneOfType(
        PropTypes.array,
        PropTypes.number,
        PropTypes.string
    ),

    /*
     * This set of "props" are output
     * props and are computed by the set of
     * input props
     */
    filteredColumns: PropTypes.object
}

export const DataStore = props => null;

export const Table = props => {
    if (!props.columns) return null;
    const firstColumn = props.columns[R.keys(props.columns)[0]];
    const rows = [];
    firstColumn.forEach((_, i) => (rows.push(
        <tr>
            {R.values(props.columns).map(col => <td>{col[i]}</td>)}
        </tr>
    )));
    return (
        <table>
            <tr>{R.keys(props.columns).map(colId => <th>{colId}</th>)}</tr>
            {rows}
        </table>
    );
}

window.dash_functional_components = {
    DataStore, Filter, Table
};
