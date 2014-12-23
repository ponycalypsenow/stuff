function Promise(){
    var self = this;
    self.resolved = false;
    self.thenable = [];
    self.then = function(callback){
        self.thenable.push(callback);
        if(self.resolved) self.value = callback(self.value);
        return self;
    };

    self.resolve = function(value){
        self.value = value;
        for(var i = 0; i < self.thenable.length; i++) self.value = self.thenable[i](self.value);
        self.resolved = true;
    };

    return self;
}

if(typeof(module) != "undefined"){
    module.exports.Promise = Promise;
}
