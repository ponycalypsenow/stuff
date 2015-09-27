var Rbm = function(visibleNo, hiddenNo){
	var self = {
		learningRate: 0.1,
		weights: initWeights(),
		bias: initBias(),
		forward: forward,
		backward: backward,
		associations: associations,
		train: train
	};
	
	return self;
	function initWeights(){
		return Array.from({ length: visibleNo }).map(() => {
			return Array.from({ length: hiddenNo }).map(() => {
				return 0.2*Math.random() - 0.1;
			});
		});
	}
	
	function initBias(){
		return [visibleNo, hiddenNo].map(length => {
			return Array.from({ length: length }).fill(0);
		});
	}
	
	function activation(x){
		var sigmoid = 1.0/(1.0 + Math.exp(-x));
		var bernoulli = (Math.random() < sigmoid)? 1 : 0;
		return{
			activation: x,
			probability: sigmoid,
			state: bernoulli
		}
	}
		
	function forward(visible){
		return Array.from({ length: hiddenNo }).map((hidden, j) => {
			return visible.reduce((sum, visible, i) => {
				return sum + self.weights[i][j]*((visible.state != undefined)? visible.state : visible);
			}, self.bias[1][j]);
		}).map((sum, j) => activation(sum));
	}
	
	function backward(hidden){
		return Array.from({ length: visibleNo }).map((visible, i) => {
			return hidden.reduce((sum, hidden, j) => {
				return sum + self.weights[i][j]*((hidden.state != undefined)? hidden.state : hidden);				
			}, self.bias[0][i]);
		}).map(sum => activation(sum));
	}
	
	function associations(visible, hidden){
		return visible.map((visible, i) => {
			return hidden.map((hidden, j) => {
				return ((visible.probability != undefined)? visible.probability : visible)*hidden.probability;
			});
		});
	}
	
	function train(samples, maxgGenerations){
		for(var generationNo = 0; generationNo < maxgGenerations; generationNo++){
			samples.forEach(sample => {
				var hidden = forward(sample);
				var visible = backward(hidden);
				var daydream = forward(visible);
				updateWeights(sample, hidden, visible, daydream);
				updateBias(sample, visible, hidden, daydream);
			});
		}
		
		return self;
		function updateWeights(sample, hidden, visible, daydream){
			var positive = associations(sample, hidden);
			var negative = associations(visible, daydream);
			for(var i = 0; i < visibleNo; i++){
				for(var j = 0; j < hiddenNo; j++){
					self.weights[i][j] += self.learningRate*(positive[i][j] - negative[i][j])/samples.length;
				}
			}
		}
		
		function updateBias(sample, visible, hidden, daydream){
			for(var i = 0; i < visibleNo; i++){
				self.bias[0][i] += self.learningRate*(sample[i] - visible[i].probability)/samples.length;
			}
			
			for(var i = 0; i < hiddenNo; i++){
				self.bias[1][i] += self.learningRate*(hidden[i].probability - daydream[i].probability)/samples.length;
			}
		}
	}
};
