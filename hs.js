var HS = function(populationSize){
	var genotypeCreator = null, genotypeMutator = null, genotypeEvaluator = null;
	var populationSize = populationSize || 30, population = [], fitness = [];
	var isMinimizing = true;
	var self = {
		setCreator: setCreator,
		setMutator: setMutator,
		setEvaluator: setEvaluator,
		maximize: maximize,
		minimize: minimize,
		getBest: getBest
	};
	
	return self;
	function setCreator(){
		genotypeCreator = genotypeFunctor([].slice.call(arguments));
		population = initPopulation();
		return self;
		function initPopulation(){
			var population = [];
			for(var i = 0; i < populationSize; i++)
				population.push(genotypeCreator());
			return population;
		}
	}
	
	function setMutator(){
		genotypeMutator = genotypeFunctor([].slice.call(arguments));
		return self;
	}
	
	function setEvaluator(evaluator, data){
		genotypeEvaluator = function(genotype){
			if(data){
				return sharpeRatio(data.map(function(x){
					return evaluator(genotype, x);
				}));
			}else return evaluator(genotype);
			
			function sharpeRatio(data){
				var dataAvg = average(data);
				return dataAvg/Math.sqrt(variance(data, dataAvg));
				function average(data){
					return data.reduce(function(sum, x){
						return sum + x;
					}, 0)/data.length;
				}
				
				function variance(data, dataAvg){
					return data.reduce(function(sum, x){
						return sum + Math.pow(x - dataAvg, 2);
					}, 0)/data.length;
				}
			}
		};
		
		fitness = initFitness();
		return self;
		function initFitness(){
			return population.map(function(genotype){
				return genotypeEvaluator(genotype);
			});
		}
	}
	
	function getBest(){
		var bestIndex = fitness.indexOf((isMinimizing? Math.min : Math.max).
			apply(Math, fitness));
		return{
			genotype: population[bestIndex],
			fitness: fitness[bestIndex]
		};
	}
	
	function maximize(maxGenerations, crossover, mutation){
		isMinimizing = false;
		return evolve(maxGenerations, crossover, mutation);
	}
	
	function minimize(maxGenerations, crossover, mutation){
		isMinimizing = true;
		return evolve(maxGenerations, crossover, mutation);
	}

	function evolve(maxGenerations, crossover, mutation){
		for(i = 0; i < maxGenerations; i++){
			var worstIndex = fitness.indexOf((isMinimizing? Math.max : Math.min).
				apply(Math, fitness));
			var candidateGenotype = createGenotype(population,
				crossover || 0.9, mutation || 0.3);
			var candidateFitness = genotypeEvaluator(candidateGenotype);
			if((isMinimizing && candidateFitness <  fitness[worstIndex]) ||
				(!isMinimizing && candidateFitness >  fitness[worstIndex])){
				population[worstIndex] = candidateGenotype;
				fitness[worstIndex] = candidateFitness;
			}
		}
		
		return self;
		function createGenotype(population, crossover, mutation){
			return population[0].map(function(gene, index){
				if(Math.random() < crossover){
					var gene = population[Math.floor(
						Math.random()*population.length)][index];
					return Math.random() < mutation?
						genotypeMutator(index, gene):
						gene;
				}
				
				return genotypeCreator(index);
			});
		}
	}
		
	function genotypeFunctor(args){
		var geneFunctors = initGeneFunctors(args);
		return function(index, gene){
			return (index != null)?
				geneFunctors[index](gene):
				geneFunctors.map(function(geneFunctor){
					return geneFunctor();
				});
		};
		
		function initGeneFunctors(args){
			var ret = [];
			for(var i = 0; i < args.length; i += 2)
				for(var j = 0; j < args[i]; j++)
					ret.push(args[i + 1]);
			return ret;
		}
	}
};

HS.U = function(min, max){
	var min = min || 0, max = max || 1;
	return function(){
		return (max - min)*Math.random() + min;
	};
};

HS.Normal = function(){
	var min = 0, max = 1, radius = 0.1;
	if(arguments.length == 3) min = arguments[0], max = arguments[1], radius = arguments[2];
	else if(arguments.length == 2) min = arguments[0], max = arguments[1];
	else if(arguments.length == 1) radius = arguments[2];
	return function(avg){
		var sum = 0;
		for(var i = 0; i < 12; i++) sum += Math.random();
		var normal = avg + (max - min)*radius*(sum - 6)/6;
		return Math.max(Math.min(normal, max), min);
	};
};
