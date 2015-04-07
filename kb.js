var KB = function(facts){	
	var self = {
		facts: facts || [],
		load: load,
		ntuples: ntuples,
		query: query
	};
	
	return self;
	function load(name){		
		self.facts = getTuples(fs.readFileSync(name).toString().split("\r\n")).map(flattenTuple);
		return self;
		
		function getTuples(lines){			
			var parents = [];			
			return lines.reduce(function(ret, x){
				var indent = getIndent(x);
				parents[indent] = [removeIndent(x)];
				if(indent > 0) parents[indent - 1].push(parents[indent]);
				else ret.push(parents[0]);
				return ret;
				
                function getIndent(line){
                    return ((line && line.match(/\t|\s{4}/g)) || []).length;
                }
                
                function removeIndent(line){
                    return line.replace(/\t|\s{4}/g, "");
                }
			}, []);
		};
		
		function flattenTuple(tuple){
			var rec = function(tuple){
				return tuple.map(function(x, xi){
					return (xi == 0)? x:
						(Array.isArray(x) && x.length == 1)? x[0]:
						rec(x);
				});
			};
			
			return rec(tuple);
		};
	}
	
	function ntuples(query){
        var ntuples = [];
		self.facts.forEach(function(fact){
            var rec = function(query, fact, parent){
                var q = query[0], f = fact[0];
                if(typeof q == "string" && (q[0] != '?' && q != f)) return;
                if(typeof q == "function" && !q(f)) return;
                if(query.length == 1) ntuples.push(parent.concat(f));
                else fact.slice(1).forEach(function(term){
                    rec(query.slice(1),
                        Array.isArray(term)? term: [term],
                        parent.concat(f));
                });
            };
			rec(query, fact, []);
		});
		
		return ntuples;
	}
	
	function query(clauses){
        return clauses.reduce(function(bindings, clause){
            var rows = self.ntuples(clause);
            return (bindings == null)?
                getNewBindings(rows, clause) :
                updateBindings(bindings, rows, clause);
                
            function getBinding(clause, row, oldbinding){
                var binding = {};
                for(var i = 0; i < clause.length; i++){
                    if(clause[i][0] == '?') binding[clause[i]] = row[i];
                }

                Object.getOwnPropertyNames(oldbinding || {}).forEach(function(name){
                    if(binding.hasOwnProperty(name)){
                        if(binding[name] != oldbinding[name])
                            throw "binding mismatch";
                    }else binding[name] = oldbinding[name];
                });
                
                return binding;
            }
            
            function getNewBindings(rows, clause){
                return rows.map(function(row){
                    return getBinding(clause, row);
                });
            }
            
            function updateBindings(bindings, rows, clause){
                return bindings.reduce(function(newbindings, oldbinding){
                    rows.forEach(function(row){
                        try{
                            newbindings.push(getBinding(clause, row, oldbinding));
                        }catch(e){}
                    });
                    return newbindings;
                }, []);
            }
        }, null); 
	}
};
