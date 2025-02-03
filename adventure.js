let location = 1;
const items = [];
let itemLocations = [];
const world = [[0, 0, 0, 0]];
let worldState = [];
const descriptions = [
];

const RULES = [
  "1000A1.F0",
  "0600B0.A0F1",
  "1000B0.F2",
  "1000B1.F3",
  "0900B1B0.C1F4"
];

const wordHash = w => {
  const prefix = ["to", "the", "an", "a"].find(p => 
    w.toLowerCase().startsWith(p)
  ) || '';
  return w.replace(new RegExp("^" + prefix, "i"), "").slice(0, 4).toLowerCase();
};

const CODES = Object.fromEntries([
  ['open', '01'],
  ['close', '02'],
  ['push', '03'],
  ['pull', '04'],
  ['walk to', '05'],
  ['pick up', '06'],
  ['talk to', '07'],
  ['give',   '08'],
  ['use',    '09'],
  ['look at','10'],
  ['turn on','11'],
  ['turn off','12']
].map(([w, c]) => ([wordHash(w), c])));

const CONDITIONS = {
  // A(n): True if n===location or n===0
  A: n => n === location || n === 0,
  // B(n): True if itemLocations[n]===location or 0 (in inventory)
  B: n => itemLocations[n] === location || itemLocations[n] === 0,
  // C(n): True if worldState[n] === 1
  C: n => worldState[n] === 1,
  // D(n): True if worldState[n] === 0
  D: n => worldState[n] === 0
};

const ACTIONS = {
  // A(n): Put item n into inventory
  A: n => { itemLocations[n] = 0; },
  // B(n): Swap itemLocations[n] with itemLocations[n+1]
  B: n => {
    let t = itemLocations[n];
    itemLocations[n] = itemLocations[n + 1];
    itemLocations[n + 1] = t;
  },
  // C(n): Remove/destroy item n
  C: n => { itemLocations[n] = -1; },
  // D(n): Set worldState[n] = 1
  D: n => { worldState[n] = 1; },
  // E(): Print inventory
  E: () => {
    console.log(
      'Inventory:',
      items
        .flatMap((d, i) => (itemLocations[i] === 0 ? [d] : []))
        .join(', ') || '(empty)'
    );
  },
  // F(n): Print descriptions[n]
  F: n => {
    if (descriptions[n]) {
      console.log(descriptions[n]);
    }
  }
};

const runRules = code => {
  const checkAllConditions = str => {
    return [...str.matchAll(/([A-Z])(\d*)/g)].every(
      ([, letter, digits]) => CONDITIONS[letter]?.(parseInt(digits) || 0)
    );
  };

  const runAllActions = str => {
    [...str.matchAll(/([A-Z])(\d*)/g)].forEach(
      ([, letter, digits]) => ACTIONS[letter]?.(parseInt(digits) || 0)
    );
  };

  const matchingLine = RULES.find(line => {
    if (!line.startsWith(code)) return false;
    const afterCode = line.slice(code.length);
    const [condPart] = afterCode.split(".");
    return checkAllConditions(condPart);
  });

  if (matchingLine) {
    const afterCode = matchingLine.slice(code.length);
    const [_, actionPart] = afterCode.split(".");
    runAllActions(actionPart);
    return true;
  }
  return false;
};

const handleCommand = input => {
  const codes = input
    .trim()
    .split(/\s+/)
    .map(w => CODES[wordHash(w)] || "00")
    .filter(c => c !== "00")
    .slice(0, 2);

  if (!codes.length) {
    console.log("I don't understand.");
    return;
  }

  const success = runRules(codes.join(""));
  if (!success) {
    console.log("I cannot do that.");
  }
};
