# -*- coding: utf-8 -*-
import dash
import dash_html_components as html
import dash_core_components as dcc

from dash.dependencies import Input, Output, State

external_stylesheets = ['https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

app.scripts.config.serve_locally = True

app.layout = html.Div(className='sans-serif', children=[
    html.Div([
        html.H1(className='tc f1 hot-pink mv6', children=["Dash Loading States API"])
    ]),
    html.Div(className='w-60 center', children=[
        dcc.Tabs(id="tabs", parent_className='bg-light-green pa2', children=[
            dcc.Tab(label='Tab one', children=[
                html.Div([
                    dcc.Graph(
                        id='example-graph',
                        figure={
                            'data': [
                                {'x': [1, 2, 3], 'y': [4, 1, 2],
                                    'type': 'bar', 'name': 'SF'},
                                {'x': [1, 2, 3], 'y': [2, 4, 5],
                                'type': 'bar', 'name': u'Montréal'},
                            ]
                        }
                    )
                ])
            ]),
            dcc.Tab(label='Tab two', children=[
                    dcc.Graph(
                        id='example-graph-1',
                        figure={
                            'data': [
                                {'x': [1, 2, 3], 'y': [1, 4, 1],
                                    'type': 'bar', 'name': 'SF'},
                                {'x': [1, 2, 3], 'y': [1, 2, 3],
                                'type': 'bar', 'name': u'Montréal'},
                            ]
                        }
                    )
            ]),
            dcc.Tab(label='Tab three', children=[
                    dcc.Graph(
                        id='example-graph-2',
                        figure={
                            'data': [
                                {'x': [1, 2, 3], 'y': [2, 4, 3],
                                    'type': 'bar', 'name': 'SF'},
                                {'x': [1, 2, 3], 'y': [5, 4, 3],
                                'type': 'bar', 'name': u'Montréal'},
                            ]
                        }
                    )
            ]),
        ])
    ])
])


if __name__ == '__main__':
    app.run_server(debug=True)