export const appLayout = {
    'type': 'Div',
    'namespace': 'dash_html_components',
    'props': {
        'content': [

            {
                'type': 'Input',
                'namespace': 'dash_core_components',
                'props': {
                    'id': 'my-input',
                    'value': 'Initial value'
                }
            },

            {
                'type': 'Div',
                'namespace': 'dash_html_components',
                'props': {
                    'id': 'my-div'
                }
            }

        ]
    }
};

export const mapInputsToOutputs = [
    {
        inputs: [
            {
                id: 'my-input',
                property: 'value'
            }
        ],
        output: {
            id: 'my-div',
            property: 'content',

            /*
             * Of course, we can't have functions in the actual spec,
             * but we could introduce a lightweight transformation
             * language for modifying strings, accessing values in
             * objects or arrays, arithmetic, etc.
             */
            transform: inputArguments => {
                return `You've entered: ${inputArguments['my-input.value']}`;
            }
        }
    }
];
