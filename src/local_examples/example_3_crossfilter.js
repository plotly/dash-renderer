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
                        'Index': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                        'Column 1': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        'Column 2': [1, 2, 2, 3, 3, 3, 4, 4, 4, 4],
                        'Column 3': ['A', 'B', 'C', 'D', 'E',
                                     'A', 'A', 'C', 'C', 'E'],
                        'Column 4': [2, 1, 4, 5, 1, 3, 2, 5, 6, 9]
                    }
                }
            },

            {
                'type': 'Filter',
                'namespace': 'dash_functional_components',
                'props': {
                    'id': 'filter-graph-1-vs-2',
                    'operation': 'intersect',
                    'filterColumnId': 'Index'
                }
            },

            {
                'type': 'Filter',
                'namespace': 'dash_functional_components',
                'props': {
                    'id': 'filter-graph-2-vs-4',
                    'operation': 'intersect',
                    'filterColumnId': 'Index'
                }
            },

            {
                'type': 'Div',
                'namespace': 'dash_html_components',
                'props': {
                    'content': 'Hover or drag points on either graph'
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
                                'content':  {
                                    'type': 'Graph',
                                    'namespace': 'dash_core_components',
                                    'props': {
                                        'id': 'graph-1-vs-2'
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
                                    'type': 'Graph',
                                    'namespace': 'dash_core_components',
                                    'props': {
                                        'id': 'graph-2-vs-4'
                                    }
                                }
                            }
                        }
                    ]
                }
            },

            {
                'type': 'Table',
                'namespace': 'dash_functional_components',
                'props': {
                    'id': 'table-all-data'
                }
            }

        ]
    }
};


export const mapInputsToOutputs = [

    {
        inputs: [
            {
                'id': 'my-data',
                'property': 'columns'
            }
        ],
        output: {
            'id': 'table-all-data',
            'property': 'columns',
            'transform': inputArguments => inputArguments['my-data.columns']
        }
    },

    {
        inputs: [
            {
                'id': 'my-data',
                'property': 'columns'
            }
        ],
        output: {
            'id': 'filter-graph-1-vs-2',
            'property': 'columns',
            'transform': inputArguments => inputArguments['my-data.columns']
        }
    },

    {
        inputs: [
            {
                'id': 'my-data',
                'property': 'columns'
            }
        ],
        output: {
            'id': 'filter-graph-2-vs-4',
            'property': 'columns',
            'transform': inputArguments => inputArguments['my-data.columns']
        }
    },

    {
        inputs: [
            {
                'id': 'graph-1-vs-2',
                'property': 'hoverData',
            },
            {
                'id': 'graph-1-vs-2',
                'property': 'selectedData',
            }
        ],
        output: {
            'id': 'filter-graph-1-vs-2',
            'property': 'filterValue',
            'transform': inputArguments => {
                let hoverData = [];
                let selectedData = [];
                if (inputArguments['graph-1-vs-2.hoverData']) {
                    hoverData = R.pluck('customdata', inputArguments['graph-1-vs-2.hoverData']['points']);
                }
                if (inputArguments['graph-1-vs-2.selectedData']) {
                    selectedData = R.pluck('customdata', inputArguments['graph-1-vs-2.selectedData']['points']);
                }
                return R.concat(hoverData, selectedData);
            }
        }
    },

    {
        inputs: [
            {
                'id': 'graph-2-vs-4',
                'property': 'hoverData',
            },
            {
                'id': 'graph-2-vs-4',
                'property': 'selectedData',
            }
        ],
        output: {
            'id': 'filter-graph-2-vs-4',
            'property': 'filterValue',
            'transform': inputArguments => {
                let hoverData = [];
                let selectedData = [];
                if (inputArguments['graph-2-vs-4.hoverData']) {
                    hoverData = R.pluck('customdata', inputArguments['graph-2-vs-4.hoverData']['points']);
                }
                if (inputArguments['graph-2-vs-4.selectedData']) {
                    selectedData = R.pluck('customdata', inputArguments['graph-2-vs-4.selectedData']['points']);
                }
                return R.concat(hoverData, selectedData);
            }
        }
    },

    {
        inputs: [
            {
                'id': 'my-data',
                'property': 'columns'
            },
            {
                'id': 'filter-graph-2-vs-4',
                'property': 'filteredColumns'
            }
        ],
        output: {
            'id': 'graph-1-vs-2',
            'property': 'figure',

            'transform': inputArguments => ({
                'layout': {
                    'margin': {'l': 20, 'r': 10, 't': 10, 'b': 20},
                    'hovermode': 'closest',
                    'dragmode': 'select',
                    'showlegend': false
                },
                'data': [{
                    'x': inputArguments['my-data.columns']['Column 1'],
                    'y': inputArguments['my-data.columns']['Column 2'],
                    'text': inputArguments['my-data.columns']['Column 3'],
                    'customdata': inputArguments['my-data.columns']['Index'],
                    'mode': 'markers',
                    'opacity': 0.2,
                    'marker': {
                        'size': 20
                    }
                }, {
                    'x': inputArguments['filter-graph-2-vs-4.filteredColumns']['Column 1'],
                    'y': inputArguments['filter-graph-2-vs-4.filteredColumns']['Column 2'],
                    'text': inputArguments['filter-graph-2-vs-4.filteredColumns']['Column 3'],
                    'customdata': inputArguments['filter-graph-2-vs-4.filteredColumns']['Index'],
                    'mode': 'markers',
                    'marker': {
                        'size': 10
                    }
                }]
            })
        }
    },

    {
        inputs: [
            {
                'id': 'my-data',
                'property': 'columns'
            },
            {
                'id': 'filter-graph-1-vs-2',
                'property': 'filteredColumns'
            }

        ],
        output: {
            'id': 'graph-2-vs-4',
            'property': 'figure',

            'transform': inputArguments => ({
                'layout': {
                    'margin': {'l': 20, 'r': 10, 't': 10, 'b': 20},
                    'hovermode': 'closest',
                    'dragmode': 'select',
                    'showlegend': false
                },
                'data': [{
                    'x': inputArguments['my-data.columns']['Column 2'],
                    'y': inputArguments['my-data.columns']['Column 4'],
                    'text': inputArguments['my-data.columns']['Column 3'],
                    'customdata': inputArguments['my-data.columns']['Index'],
                    'mode': 'markers',
                    'opacity': 0.2,
                    'marker': {
                        'size': 20
                    }
                }, {
                    'x': inputArguments['filter-graph-1-vs-2.filteredColumns']['Column 2'],
                    'y': inputArguments['filter-graph-1-vs-2.filteredColumns']['Column 4'],
                    'text': inputArguments['filter-graph-1-vs-2.filteredColumns']['Column 3'],
                    'customdata': inputArguments['filter-graph-1-vs-2.filteredColumns']['Index'],
                    'mode': 'markers',
                    'marker': {
                        'size': 10
                    }
                }]
            })
        }
    }

]
