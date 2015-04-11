var Phlux = {
    createStore: function(protostore) {
        //Initiate the store
        //with some attributes
        //for handling the data.
        var store = {
            data: new Object(),
            getData: function() {
                return this.data
            },
            trigger: function() {
                for(var index in this.listeners) {
                    this.listeners[index](this.data)
                }
            },
            addListener: function(listener) {
                this.listeners.push(listener)
            },
            listeners: []
        }
        for(var key in protostore) {
            //Filter any values of
            //the protostore that
            //attempts to overwrite
            //the getter function.
            if(key === "getData") {
                continue
            }
            //Copy over all values from
            //the protostore to the store.
            store[key] = protostore[key]
            //Grab any functions from the
            //store to add as listeners.
            if(key.substring(0, 2) === "on"
            && typeof protostore[key] === "function") {
                //Get the name of the action.
                var action = key.substring(2)
                //If this is the first listener to be
                //registered for this action, create a
                //new array for handling the listeners.
                if(this.listeners[action] === undefined) {
                    this.listeners[action] = new Array()
                }
                //Add the listener to the list of listeners.
                var listener = protostore[key].bind(store)
                this.listeners[action].push(listener)
                //If you wanted to add an additional
                //trigger at the end of each and every
                //listener, here is where you do it.
            }
        }
        //Initiate the store.
        if(store.initiateStore !== undefined
        && typeof store.initiateStore === "function") {
            store.initiateStore()
        }
        return store
    },
    triggerAction: function(action) {
        //Remove the action from any additional arguments.
        var args = Array.prototype.slice.call(arguments, 1)
        //If any listeners have been registered under
        //that action, iterative through each listener
        //and execute it with the provided arguments.
        if(this.listeners[action] !== undefined) {
            for(var index in this.listeners[action]) {
                this.listeners[action][index].apply(null, args)
            }
        }
    },
    connectStore: function(Store, label) {
        return {
            componentWillMount: function() {
                Store.addListener(function(data) {
                    var state = new Object()
                    state[label] = data
                    this.setState(state)
                }.bind(this))
            },
            getInitialState: function() {
                var state = new Object()
                state[label] = Store.getData()
                return state
            }
        }
    },
    listeners: new Array()
}

module.exports = Phlux
