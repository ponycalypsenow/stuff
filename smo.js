function linearKernel(a, b){
  return a.reduce(function(ret, ai, i){
    return ret + ai*b[i];
  }, 0);
}
		
function rbfKernel(a, b){
  var sigma = 0.5;
  return Math.exp(-a.reduce(function(ret, ai, i){
    return ret + (ai - b[i])*(ai - b[i]);
  }, 0)/(2.0*sigma*sigma));
}

function polynomialKernel(a, b){
  var d = 2.0;
  return Math.pow(a.reduce(function(ret, ai, i){
    return ret + ai*b[i];
  }, 0) + 1, d);
}

function smoTrain(x, y, K){
  var C = 1.0;
  var errTol = 1e-4;
  var maxPassesNo = 10;
  var m = x.length,
    a = Array.apply(null, { length: m }).map(function(){ return 0; }),
    b = 0;
  var passesNo = 0;
  function predict(q){
    return x.reduce(function(p, xi, i){
      return p + a[i]*y[i]*K(q, xi);
    }, b);
  }
  
  var kernelRes = [];
  function kernelResult(i, j){
    if(!kernelRes[i]) kernelRes[i] = [];
    if(!kernelRes[i][j]) kernelRes[i][j] = K(x[i], x[j]);
    return kernelRes[i][j];
  }

  while(passesNo < maxPassesNo){
    var changedAsNo = 0;
    for(var i = 0; i < m; i++){
      var ei = predict(x[i]) - y[i];
      if(!(y[i]*ei < -errTol && a[i] < C) && !(y[i]*ei > errTol && a[i] > 0)) continue;
      var j = i;
      while(j == i) j = Math.floor(Math.random()*m);
      var ai = a[i], aj = a[j];
      var ej = predict(x[j]) - y[j];
      var L = 0, H = C;
      if(y[i] == y[j]){
        L = Math.max(0, ai + aj - C);
        H = Math.min(C, ai + aj);
      }else{
        L = Math.max(0, aj - ai);
        H = Math.min(C, C + aj - ai);
      }

      if(Math.abs(L - H) < 1e-4) continue;
      var eta = 2*kernelResult(i,j) - kernelResult(i,i) - kernelResult(j,j);
      if(eta >= 0) continue;
      var newaj = aj - y[j]*(ei - ej)/eta;
      if(newaj > H) newaj = H;
      if(newaj < L) newaj = L;
      if(Math.abs(aj - newaj) < 1e-4) continue;
      a[j] = newaj;
      var newai = ai + y[i]*y[j]*(aj - newaj);
      a[i] = newai;
      var b1 = b - ei - y[i]*(newai - ai)*kernelResult(i,i)
         - y[j]*(newaj - aj)*kernelResult(i,j);
      var b2 = b - ej - y[i]*(newai - ai)*kernelResult(i,j)
         - y[j]*(newaj - aj)*kernelResult(j,j);
      b = 0.5*(b1 + b2);
      if(newai > 0 && newai < C) b = b1;
      if(newaj > 0 && newaj < C) b = b2;
      changedAsNo++;
    }

    if(changedAsNo == 0) passesNo++;
    else passesNo = 0;
  }
  
  return{
    a: a,
    b: b,
    predict: predict
  }
}
