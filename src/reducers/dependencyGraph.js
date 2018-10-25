import {DepGraph} from 'dependency-graph';

const initialGraph = {};

const graphs = (state = initialGraph, action) => {
    switch (action.type) {
        case 'COMPUTE_GRAPHS': {
            const dependencies = action.payload;
            const inputGraph = new DepGraph();
            const eventGraph = new DepGraph();

            dependencies.forEach(function registerDependency(dependency) {
                const {output, inputs, events} = dependency;
                inputs.forEach(inputObject => {
                    const inputId = `${inputObject.id}.${inputObject.property}`;
                    inputGraph.addNode(output);
                    inputGraph.addNode(inputId);
                    inputGraph.addDependency(inputId, output);
                });
                events.forEach(eventObject => {
                    const eventId = `${eventObject.id}.${eventObject.event}`;
                    eventGraph.addNode(output);
                    eventGraph.addNode(eventId);
                    eventGraph.addDependency(eventId, output);
                });
            });

            return {InputGraph: inputGraph, EventGraph: eventGraph};
        }

        default:
            return state;
    }
};

export default graphs;
