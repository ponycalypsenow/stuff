var HarmonySearch = function(populationSize, geneticRepresentation, genotypeFitness){
	var self = {
		population: initPopulation(populationSize || 30),
		fitness: [],
		update: update
	};
	
	return self;
	function initPopulation(populationSize){
		var ret = [];
		for(var i = 0; i < populationSize; i++) ret.push(
			geneticRepresentation.createGenotype());
		return ret;
	}
	
	function update(maxGenerations, crossover, mutation){
		self.fitness = self.population(function(genotype){
			return genotypeFitness(genotype);
		});
		for(var i = 0; i < maxGenerations; i++){
			var worstIndex = self.fitness.indexOf(Math.max.apply(null, self.fitness));
			var candidateGenotype = geneticRepresentation.createGenotype(
				self.population, crossover || 0.9, mutation || 0.3);
			var candidateFitness = genotypeFitness(candidateGenotype);
			if(candidateFitness >  self.fitness[worstFitness]){
				self.population[worstIndex] = candidateGenotype;
				self.fitness[worstIndex] = candidateFitness;
			}
		}
		
		return self;
	}
};

var GeneticRepresentation = function(){
	var self = {
		geneCreators: initGeneFunctors(arguments[0]),
		geneMutators: initGeneFunctors(arguments[1])
	};
	
	return self;
	initGeneFunctors(args){
		var ret = [];
		for(var i = 0; i < args.length; i += 2)
			for(var j = 0; j < args[i]; j++)
				ret.push(args[i + 1]);
		return ret;
	};
	
	function createGenotype(population, crossover, mutation){
		return self.geneCreators.map(function(geneCreator, index){
			if(population && Math.random() < crossover){
				var gene = self.population[
					Math.floor(Math.random()*self.population.length)][index];
				return Math.random() < mutation?
					self.geneMutators[index](gene): gene;
			}else return geneCreator();
		});
	}
};
