function tripleStore(){
	var self = this, spo = {}, pos = {}, osp = {};
	function insert(s, p, o){		
		function insertToIndex(index, a, b, c){
			if(!index[a]) index[a] = {};
			if(!index[a][b]) index[a][b] = {};
			if(!index[a][b][c]) index[a][b][c] = true;
		}

		insertToIndex(spo, s, p, o);
		insertToIndex(pos, p, o, s);
		insertToIndex(osp, o, s, p);
		return self;
	}
	
	function triples(s, p, o){
		var ret = [];
		if(s){
			if(p){
				if(o) if(spo[s][p][o]) ret.push([s, p, o]);
				else for(var i in spo[s][p]) ret.push([s, p, i]);
			}else{
				if(o) for(var i in osp[o][s]) ret.push([s, i, o]);
				else for(var i in spo[s]) for(var j in spo[s][i]) ret.push([s, i, j]);
			}
		}else{
			if(p){
				if(o) for(var i in pos[p][o]) ret.push([i, p, o]);
				else for(var i in pos[p]) for(var j in pos[p][i]) ret.push([j, p, i]);
			}else{
				if(o) for(var i in osp[o]) for(var j in osp[o][i]) ret.push([i, j, o]);
				else for(var i in spo) for(var j in spo[i]) for(var k in spo[i][j]) ret.push([i, j, k]);
			}
		}
		
		return ret;
	}
	
	function query(clauses){
		var bindings = null;
		clauses.forEach(function(clause){
			var bindingPos = {}, rows = initRows();
			function initRows(){				
				var clauseQuery = clause.map(function(key, keyi){
					if(key[0] == '?'){
						bindingPos[key] = keyi;
						return null;
					}
					
					return key;
				});
				
				return triples(clauseQuery[0], clauseQuery[1], clauseQuery[2]);
			}
			
			function updateBindings(){
				var newBindings = [];
				bindings.forEach(function(binding){ rows.forEach(function(row){
					var validMatch = true, newBinding = {};
					for(var key in binding) newBinding[key] = binding[key];
					for(var key in bindingPos){
						if(newBinding[key]){
							if(newBinding[key] != row[bindingPos[key]]) validMatch = false;
						}else newBinding[key] = row[bindingPos[key]];
					}
					
					if(validMatch) newBindings.push(newBinding);
				})});
				
				return newBindings;
			}
			
			if(!bindings) bindings = rows.map(function(row){
				var binding = {};
				for(var key in bindingPos) binding[key] = row[bindingPos[key]];
				return binding;
			})
			else bindings = updateBindings();
		});
		
		return bindings;
	}
	
	self.insert = insert;
	self.triples = triples;
	self.query = query;
	return self;
}
