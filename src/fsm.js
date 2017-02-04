class FSM {
    /**
     * Creates new FSM instance.
     * @param config
     */
    constructor(config) {
        if (!arguments.length) throw new Error;

        this.currentConfig = {};

        // deep copying @param into this.currentConfig
        for (var prop in config) {
            if (config[prop]) {
                this.currentConfig[prop] = config[prop];
            }
        }
        
        this.currentState = this.currentConfig.initial;
        this.previousState = this.currentState;
        this.undoTransitions = [];
        this.redoTransitions = [];
    }

    /**
     * Returns active state.
     * @returns {String}
     */
    getState() {
        return this.currentState;
    }

    /**
     * Goes to specified state.
     * @param state
     */
    changeState(state) {
        
        // "undo" was done and at once "redo" was not done => clear "redo" buffer
        if (!this.undoTransitions.length && this.redoTransitions.length) {
            this.redoTransitions.shift();
        }
        
        this.previousState = this.currentState;
        
        // check array for @param existence
        function checkArray (element) {
            return element == state;
        }

        if (Object.keys(this.currentConfig.states).some(checkArray)) {
            this.currentState = state;
            this.undoTransitions.push(this.previousState); // important, for undo, redo functioning
            this.redoTransitions.push(this.currentState);
            return;
        }
        
        throw new Error ('state isn\'t exist');
    }

    /**
     * Changes state according to event transition rules.
     * @param event
     */
    trigger(event) {
        this.previousState = this.currentState;

        // "undo" was done and at once "redo" was not done => clear "redo" buffer
        if (!this.undoTransitions.length && this.redoTransitions.length) {
            this.redoTransitions.shift();
        }
        

        // shorter variable
        var currentTree = this.currentConfig.states[this.currentState].transitions;
        if (Object.keys(this.currentConfig.states[this.currentState].transitions).includes(event)) {
            this.currentState = currentTree[event];
            this.undoTransitions.push(this.previousState);
            this.redoTransitions.push(this.currentState);
        } else throw new Error('This event in current state isn\'t exist');
    }

    /**
     * Resets FSM state to initial.
     */
    reset() {
        return this.currentState = this.currentConfig.initial;
    }

    /**
     * Returns an array of states for which there are specified event transition rules.
     * Returns all states if argument is undefined.
     * @param event
     * @returns {Array}
     */
    getStates(event) {

        // use case returning all possible states
        if (!arguments.length) {
            return Object.keys(this.currentConfig.states);
        }

        var res = []
        
        this.getStates().forEach(checkEvent, this);

        function checkEvent (element) {

            // check event existence for every state
            if (Object.keys(this.currentConfig.states[element].transitions).includes(event)) {
                res.push(element);
            }
        }
        
        if (res.length) return res
            else return [];
    }

    /**
     * Goes back to previous state.
     * Returns false if undo is not available.
     * @returns {Boolean}
     */
    undo() {
        
        if (!this.undoTransitions.length) return false;

        this.currentState = this.undoTransitions.pop();
        this.previousState = this.undoTransitions[this.undoTransitions.length - 1];
        return true;
        
    }

    /**
     * Goes redo to state.
     * Returns false if redo is not available.
     * @returns {Boolean}
     */
    redo() {

        if (!this.redoTransitions.length || this.currentState == this.redoTransitions[0]) return false;
 
        this.currentState = this.redoTransitions.shift();
        return true;

    }

    /**
     * Clears transition history
     */
    clearHistory() {
        this.undoTransitions = [];
        this.redoTransitions = [];
    }
}

module.exports = FSM;

/** @Created by Uladzimir Halushka **/
