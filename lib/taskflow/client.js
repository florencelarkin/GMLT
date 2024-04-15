const TaskFlow = {
    _helpers: {
        get_measure_id: () => {
            let path = window.parent.location.href;

            let regex = new RegExp('.easures/([0-9]*)/');

            let parsed_measure_id = regex.exec(path)[1];

            return parsed_measure_id;
        },
        get_population_id: () => {
            let path = window.parent.location.href;

            let regex = new RegExp('.opulations/([0-9]*)/');

            let parsed_population_id = regex.exec(path)[1];

            return parsed_population_id;
        },
        get_participant_id: () => {
            let path = window.parent.location.href;

            let regex = new RegExp('(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}');

            let parsed_participant_id = regex.exec(path)[0];

            return parsed_participant_id;
        },
        get_session_id: () => {
            let path = window.parent.location.href;

            let regex = new RegExp('.essions/([0-9]*)/');

            let parsed_session_id = regex.exec(path)[1];

            return parsed_session_id;
        }
    },
    _endpoints: {
        configuration: {
            get: () => {
                let participant_id = TaskFlow._helpers.get_participant_id();
                let population_id = TaskFlow._helpers.get_population_id();

                return window.parent.location.origin + '/api/v1.0/populations/' + population_id + '/participants/' + participant_id + '/configurationproperties';
            }        
        },
        measure: {
            get: () => {
                let measure_id = TaskFlow._helpers.get_measure_id();
                let session_id = TaskFlow._helpers.get_session_id();

                return window.parent.location.origin + '/api/v1.0/sessions/' + session_id + '/measures/' + measure_id;
            }
        },
        session: {
            get: () => {
                let population_id = TaskFlow._helpers.get_population_id();
                let session_id = TaskFlow._helpers.get_session_id();

                return window.parent.location.origin + '/api/v1.0/populations/' + population_id + '/sessions/' + session_id;
            }
        }
    },
    Client: {
        Configuration: {
            get: async () => {
                let endpoint = TaskFlow._endpoints.configuration.get();

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-api-key': '0e89336b-27bc-466b-bebc-03b84ed7cc7b'
                    },
                });

                if (response.status !== 200) {
                    throw new Error("Something went wrong..."); 
                }

                let result = await response.json();

                return result;
            },
            set: async (measure_type_id, task_guid, key, value) => {
                let endpoint = TaskFlow._endpoints.configuration.get();

                let value_data = {
                    GUID: task_guid,
                    VALUE: value
                };

                let configuration_property = {
                    "measureTypeId": measure_type_id,
                    "populationId": TaskFlow._helpers.get_population_id(),
                    "userId": TaskFlow._helpers.get_participant_id(),
                    "key": key,
                    "value": JSON.stringify(value_data)
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-api-key': '0e89336b-27bc-466b-bebc-03b84ed7cc7b'
                    },
                    body: JSON.stringify(configuration_property)
                });

                if (response.status !== 200) {
                    throw new Error("Something went wrong..."); 
                }
            }
        },
        Measure: { 
            /**
             * Updated for 2.0.
             */
            end: () => {
                    let message = {
                        _guid: "",
                        _type: "MESSAGETYPE.ACTION",
                        _value: ""
                    };
        
                    window.parent.postMessage(JSON.stringify(message), '*');
            },
            /**
             * Updated for 2.0.
             */
            get: async () => {
                let endpoint = TaskFlow._endpoints.measure.get();

                const response = await fetch(endpoint, {
                    method: 'GET',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-api-key': '0e89336b-27bc-466b-bebc-03b84ed7cc7b' 
                    }
                });

                if (response.status !== 200) {
                    throw new Error("Something went wrong....");
                }

                return response.json();
            },
            /**
             * Updated for 2.0.
             */
            set: async (data) => {
                let endpoint = TaskFlow._endpoints.measure.get();

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-api-key': '0e89336b-27bc-466b-bebc-03b84ed7cc7b' 
                    },
                    body: JSON.stringify(data)
                });

                if (response.status !== 204) {
                    throw new Error("Something went wrong....");
                }
            }
        },
        Session: {
            get: async () => {
                let endpoint = TaskFlow._endpoints.session.get();

                const response = await fetch(endpoint, {
                    method: 'GET',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-api-key': '0e89336b-27bc-466b-bebc-03b84ed7cc7b' 
                    }
                });

                if (response.status !== 200) {
                    throw new Error("Something went wrong....");
                }

                return response.json();
            },
            set: async (session) => {
                let endpoint = TaskFlow._endpoints.session.get();

                const response = await fetch(endpoint, {
                    method: 'PUT',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'x-api-key': '0e89336b-27bc-466b-bebc-03b84ed7cc7b' 
                    },
                    body: JSON.stringify(session)
                });

                if (response.status !== 204) {
                    throw new Error("Something went wrong....");
                }
            }
        }
    }
};