/**
 * This class is used to encapsulate the core behaviour
 * of static classes.
 * 
 * Error is thrown on new object instantiation of inherited
 * classes. 
 */
class StaticClass {
    constructor(){
        if (this instanceof(StaticClass)){
            throw StaticInterfaceError("A static class can not be instantiated.");
        }
    }
}

/**
 * Wrapper class for custom error.
 */
class StaticInterfaceError extends Error{
    constructor(errorMessage){
        super(errorMessage);
    }
}

// Export module using Common JS standard.
module.exports = StaticClass;