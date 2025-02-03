const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src'); // adjust if your source folder is different
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getSourceFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSourceFiles(fullPath));
    } else if (EXTENSIONS.includes(path.extname(fullPath))) {
      results.push(fullPath);
    }
  });
  return results;
}

function stripComments(code) {
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  code = code.replace(/\/\/.*/g, '');
  return code;
}

function analyzeFile(filePath) {
  const rawCode = fs.readFileSync(filePath, 'utf8');
  const code = stripComments(rawCode);
  const definitions = [];
  const calls = new Set();
  const jsxUsages = new Set();
  const propUsages = new Set();
  const lines = code.split('\n');

  function isExported(lineNum) {
    return lines[lineNum - 1].includes('export');
  }

  const funcDeclRegex = /function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let match;
  while ((match = funcDeclRegex.exec(code)) !== null) {
    const sub = code.substring(0, match.index);
    const lineNum = sub.split('\n').length;
    const name = match[1];
    const isComponent = /^[A-Z]/.test(name);
    definitions.push({
      name,
      line: lineNum,
      file: filePath,
      exported: isExported(lineNum),
      isComponent,
    });
  }

  const varFuncRegex = /^[ \t]*(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>/gm;
  while ((match = varFuncRegex.exec(code)) !== null) {
    const sub = code.substring(0, match.index);
    const lineNum = sub.split('\n').length;
    const name = match[1];
    const isComponent = /^[A-Z]/.test(name);
    definitions.push({
      name,
      line: lineNum,
      file: filePath,
      exported: isExported(lineNum),
      isComponent,
    });
  }

  const callRegex = /\b([A-Za-z0-9_$]+)\s*\(/g;
  while ((match = callRegex.exec(code)) !== null) {
    const word = match[1];
    if (['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'console'].includes(word)) {
      continue;
    }
    calls.add(word);
  }

  const jsxRegex = /<([A-Z][A-Za-z0-9_$]*)\b/g;
  while ((match = jsxRegex.exec(code)) !== null) {
    jsxUsages.add(match[1]);
  }

  const jsxAttrRegex = /{([^}]+)}/g;
  while ((match = jsxAttrRegex.exec(code)) !== null) {
    const expr = match[1];
    const idRegex = /\b([A-Za-z0-9_$]+)\b/g;
    let idMatch;
    while ((idMatch = idRegex.exec(expr)) !== null) {
      const id = idMatch[1];
      if (['if','for','while','switch','catch','function','return','console','true','false','null','undefined'].includes(id)) {
        continue;
      }
      propUsages.add(id);
    }
  }

  return { definitions, calls, jsxUsages, propUsages };
}

function analyzeProject() {
  const files = getSourceFiles(SRC_DIR);
  if (files.length === 0) {
    console.error(`No source files found in ${SRC_DIR}`);
    process.exit(1);
  }

  const allDefinitions = [];
  const allCalls = new Set();
  const allJsxUsages = new Set();
  const allPropUsages = new Set();

  files.forEach(file => {
    const { definitions, calls, jsxUsages, propUsages } = analyzeFile(file);
    allDefinitions.push(...definitions);
    calls.forEach(fn => allCalls.add(fn));
    jsxUsages.forEach(comp => allJsxUsages.add(comp));
    propUsages.forEach(id => allPropUsages.add(id));
  });

  const allUsages = new Set([...allCalls, ...allJsxUsages, ...allPropUsages]);
  const deadFunctions = [];
  const unusedComponents = [];

  allDefinitions.forEach(def => {
    if (def.exported) return; // assume exported items might be used elsewhere
    if (allUsages.has(def.name)) return; // if used anywhere, skip
    if (def.isComponent) {
      unusedComponents.push(def);
    } else {
      deadFunctions.push(def);
    }
  });

  if (deadFunctions.length === 0 && unusedComponents.length === 0) {
    console.log('No potential dead functions or unused React function components were detected.');
    return;
  }

  if (deadFunctions.length > 0) {
    console.log('\nPotential dead functions (non-components) detected:\n');
    deadFunctions.forEach(def => {
      console.log(`${def.file}:${def.line} — Function "${def.name}" is defined but never called or used.`);
    });
  }

  if (unusedComponents.length > 0) {
    console.log('\nPotential unused React function components detected:\n');
    unusedComponents.forEach(def => {
      console.log(`${def.file}:${def.line} — Component "${def.name}" is defined but never used.`);
    });
  }
}

analyzeProject();
