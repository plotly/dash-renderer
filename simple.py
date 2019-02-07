# -*- coding: utf-8 -*-
import dash
import dash_html_components as html
import dash_core_components as dcc
import plotly.graph_objs as go
import time

from dash.dependencies import Input, Output, State

external_stylesheets = [
    "https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"]

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

card_style = {
    "box-shadow": "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)"
}

app.scripts.config.serve_locally = True

app.layout = html.Div([
    html.H1('Dash Tabs component demo'),
    dcc.Tabs(id="tabs-without-value", children=[
        dcc.Tab(label='Tab One', value='tab-1'),
        dcc.Tab(label='Tab Two', value='tab-2'),
    ]),
    html.Div(id='tabs-content')
])

@app.callback(Output('tabs-content', 'children'),
                [Input('tabs-without-value', 'value')])
def render_content(tab):
    print(tab)
    if tab == 'tab-1':
        return html.H3('Default selected Tab content 1')
    elif tab == 'tab-2':
        return html.H3('Tab content 2')

if __name__ == "__main__":
    app.run_server(debug=False)
