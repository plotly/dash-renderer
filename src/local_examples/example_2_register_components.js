import R from 'ramda';

import * as components from './example_components.react';

export const appLayout = {
    'type': 'Div',
    'namespace': 'dash_html_components',
    'props': {
        'content': [

            {
                'type': 'DataStore',
                'namespace': 'dash_functional_components',
                'props': {
                    'id': 'my-data',
                    'columns': {
                        'Column 1': [1, 2, 3, 4, 5],
                        'Column 2': [4, 2, 1, 4, 5],
                        'Column 3': ['A', 'B', 'C' ,'D', 'E'],
                    }
                }
            },

            {
                'type': 'Filter',
                'namespace': 'dash_functional_components',
                'props': {
                    'id': 'my-filter',
                    /*
                     * The rest of the filter properties
                     * (like filterColumnId, filterValue, operation)
                     * are set dynamically from different controls
                     */
                }
            },

            {
                'type': 'Dropdown',
                'namespace': 'dash_core_components',
                'props': {
                    'id': 'filter-column-dropdown',
                    /*
                     * The rest of these properties like `options` and `value`
                     * are set dynamically from the DataStore component
                     */
                }
            },

            {
                'type': 'Dropdown',
                'namespace': 'dash_core_components',
                'props': {
                    'id': 'filter-operation-dropdown',
                    'options': [
                        {'label': 'Less than', 'value': '<'},
                        {'label': 'Greater than', 'value': '>'},
                        {'label': 'Equals', 'value': '=='}
                    ],
                    'value': '<'
                }
            },

            {
                'type': 'Input',
                'namespace': 'dash_core_components',
                'props': {
                    'id': 'my-input',
                    'value': 3
                }
            },

            {
                'type': 'Div',
                'namespace': 'dash_html_components',
                'props': {
                    'className': 'row',
                    'content': [
                        {
                            'type': 'Div',
                            'namespace': 'dash_html_components',
                            'props': {
                                'className': 'six columns',
                                'content': {
                                    'type': 'Table',
                                    'namespace': 'dash_functional_components',
                                    'props': {
                                        'id': 'my-original-table'
                                    }
                                }
                            }
                        },
                        {
                            'type': 'Div',
                            'namespace': 'dash_html_components',
                            'props': {
                                'className': 'six columns',
                                'content': {
                                    'type': 'Table',
                                    'namespace': 'dash_functional_components',
                                    'props': {
                                        'id': 'my-filtered-table'
                                    }
                                }
                            }
                        }
                    ]
                }
            },

            {
                'type': 'Graph',
                'namespace': 'dash_core_components',
                'props': {
                    'id': 'my-graph',
                    'animate': true
                }
            }

        ]
    }
};

export const mapInputsToOutputs = [

    // Display the columns as the dropdown
    {
        inputs: [
            {
                id: 'my-data',
                property: 'columns'
            },
        ],
        output: {
            id: 'filter-column-dropdown',
            property: 'options',

            /*
             * The properties of the components would need to be designed
             * in a way that makes composing one components output into
             * the next component's input declarative.
             * In this case, we're setting the dropdown to be the columns
             * through `keys` and `map` functions, which isn't declarative
             * nor does it have a direct declarative analogue.
             */
            transform: inputArguments => (
                R.keys(inputArguments['my-data.columns']).map(c => ({
                    label: c, value: c
                }))
            )
        }
    },

    // Select a default column
    {
        inputs: [
            {
                id: 'my-data',
                property: 'columns'
            },
        ],
        output: {
            id: 'filter-column-dropdown',
            property: 'value',

            /*
             * The properties of the components would need to be designed
             * in a way that makes composing one components output into
             * the next component's input declarative.
             * In this case, we're setting the dropdown to be the columns
             * through `keys` and `map` functions, which isn't declarative
             * nor does it have a direct declarative analogue.
             */
            transform: inputArguments => (
                R.keys(inputArguments['my-data.columns'])[0]
            )
        }
    },

    // The `filterColumnId` of the filter is the dropdown
    {
        inputs: [
            {
                id: 'filter-operation-dropdown',
                property: 'value'
            },
        ],
        output: {
            id: 'my-filter',
            property: 'operation',

            transform: inputArguments => inputArguments['filter-operation-dropdown.value']
        }
    },

    // The input data (`columns`) for the filter is the data store
    {
        inputs: [
            {
                id: 'my-data',
                property: 'columns'
            },
        ],
        output: {
            id: 'my-filter',
            property: 'columns',

            transform: inputArguments => inputArguments['my-data.columns']
        }
    },

    // The `filterValue` of the filter is the input's value
    {
        inputs: [
            {
                id: 'my-input',
                property: 'value'
            },
        ],
        output: {
            id: 'my-filter',
            property: 'filterValue',

            transform: inputArguments => inputArguments['my-input.value']
        }
    },

    // The `filterColumnId` of the filter is the dropdown
    {
        inputs: [
            {
                id: 'filter-column-dropdown',
                property: 'value'
            },
        ],
        output: {
            id: 'my-filter',
            property: 'filterColumnId',

            transform: inputArguments => inputArguments['filter-column-dropdown.value']
        }
    },

    // Display the original data as a table
    {
        inputs: [
            {
                id: 'my-data',
                property: 'columns'
            },
        ],
        output: {
            id: 'my-original-table',
            property: 'columns',

            transform: inputArguments => inputArguments['my-data.columns']
        }
    },

    // Display the output of the filter as a table
    {
        inputs: [
            {
                id: 'my-filter',
                property: 'filteredColumns'
            },
        ],
        output: {
            id: 'my-filtered-table',
            property: 'columns',

            transform: inputArguments => inputArguments['my-filter.filteredColumns']
        }
    },

    // Combine the filtered data and the original data on a graph
    {
        inputs: [
            {
                id: 'my-filter',
                property: 'filteredColumns'
            },
            {
                id: 'my-data',
                property: 'columns'
            }
        ],

        output: {
            id: 'my-graph',
            property: 'figure',

            transform: inputArguments => ({
                'layout': {'showlegend': false, 'margin': {'l': 10, 'r': 10, 't': 10}},
                'data': [
                    {
                        'x': inputArguments['my-data.columns']['Column 1'],
                        'y': inputArguments['my-data.columns']['Column 2'],
                        'text': inputArguments['my-data.columns']['Column 3'],
                        'mode': 'markers',
                        'opacity': 0.2,
                        'marker': {
                            'size': 24
                        }
                    },
                    {
                        'x': inputArguments['my-filter.filteredColumns']['Column 1'],
                        'y': inputArguments['my-filter.filteredColumns']['Column 2'],
                        'text': inputArguments['my-filter.filteredColumns']['Column 3'],
                        'mode': 'markers',
                        'marker': {
                            'size': 14,
                            'line': {
                                'width': 0.5,
                                'color': 'lightgrey'
                            }
                        }
                    }
                ]
            })
        }
    }

];
