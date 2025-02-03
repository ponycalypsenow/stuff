// Space Bucks:
//      Bidding for routes, required good type once per year, help with negotiation
//
// Offworld Trading Company:
//      Units needed to change price by $1, with a price of p and p between:
//      $1-$10: (Players*20+20)/p, $11-$100: (Players*20+20)/(0.1p+10), $101+: (Players*20+20)/(0.01p+20)
//      The base demand increases the price of every resource by 0.001 * # of Players * (seconds + 100)
//      supply quantity = initial + (new_price - initial_price)*60/(0.1 x initial_price + 10)
//      price = initial + tons / (60/(0.1 x initial_price + 10))
//      Every hour, there is a (n+1)/96 chance of the colony growing, with n equal to the number of players in the game.
//      When the colony grows, it adds one population module and one labor module (60% chance for Habitats, 40% chance for Garages)
//
// Merchant Prince:
//      Long trade routes, cities closed, open to some, all (bribe or conquer)
//      Warehouses if buyers aren't available
//      Subsidized functions (amry, navy, road building)
//      Sieged, plagued, excomunicated cities get inflation: old price + (old price x strength) / 10
//          - siege for example is 3 x time it lasts (3)
//          - excomunication 8
//          - plague is 2 per player, for 3 turns
//
// All of them:
//      Routes with different cargos at each stop, different cargos
//
// Pocket Empires:
//      resources: +1 Ag, +1 Hi, +2 In, +1 Ri, starpot "A", +1 "B", infrastructure: +1 Hi, +2 In, +2 Ri, +2, starpot "A", +4 "B": +3, etc. 
//      demand (max troughtput): resources + population modifier: -3 0-1, -2 2-3, -1 4-5, 0 6, 1 7-8, 2 9-10, 3 11+ (also culture)
//      realized: min of resources and demand, balance: resources - demand
//      if infrastructure > resources, realized: resources - (infrastructure - resources)
//      gross world product 0.1 * TL * realized * Math.pow(10, (population - 1) - 7) * infrastructure / (culture + 1)
//      trade multipier for gwp, n is number of trading partners: starport "A": 2 - (2/sqrt(n + 3)), "B": 1.7 4.89, "C": 1.4 11.25
//      value of resource unit in MCrs 1000000 / (0.1 * TL * realized * infrastructure)
//      value of credit on another world = value of RU on A / B
//      cost of infrastructure growth: (infrastructure + 1) * (size + atmosphere) * 0.1, if foreign investment mutiply by 1 + distance/2
//      population change: (resources + infrastructure + technology)/population
//      export adds 0.5 of it's value to gwp, import 0.4
//
// World Tamer's Handbook:
//      labour is 1/4th of the population, divided into agricultural, light/heavy industrial, construction
//      output needs raw materials, doubled for heavy industry, kilowats of energy, with cost of capital by tech level
//      usually labr must match capital, if not l > c ? Math.max(0.5 * (l - c) + c, 1.5 * c) : Math.max(0.25 * (c - l) + l, 1.25 * l)
//      agrarian required materials is based on labor or capital, whichever is greater (starting at level 3)
//      new capital can be only build by heavy industry
//      default richness modifier for agrary is 0.5
//      heavy industry goods cost x3 more than light, construction 1/2
//      purchasing capital goods half must come from heavy, half from construction
//      for twice the price we can add a level
//      if at least 50% of heavy industry is at the higher level, you can upgrade any other levels for 20% the original level price
//      heavy industry can produce light industry
//      built capital level is the same level that the heavy industry
//      food coverage is number of rations produced monthly / population; good coverage is light industry in credits / population
//      high tech world demand labor intensive cargos, low tech capital intensive
//      exchange rates: starport "A" TL 15: 100%, "B" -5%, 14: -5% (for goods that cannot be produced there get full price)
//      all prices will be the same in local currency for goods that can be manufactured locally, otherwise required TL (starport A) / local TL and starport
//
// Game Balance:
//      Curves: identity, linear, exponential (doubling 2^level), log (decreasing returns), triangular: (x^2 - x)/2
//      Anchor: a single quantity the rest can be derived from (gold or damage)
//      Balance: benefit to cost is identity, cost can be a curve while benefit can be linear

import { shipNames, worldNames } from "./names.mjs";

const neighborOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const sectorPresets = {
    sizes: { small: [50, 40], medium: [80, 50], large: [120, 75] },
    densities: { small: 0.3, medium: 0.5, large: 0.7 },
    ages: [3, 4, 5]
};

const dx = sides => Math.floor(Math.random() * sides) + 1;
const d6 = () => dx(6);
const d12 = () => d6() + d6();
const sample = array => array[dx(array.length) - 1];
const clamp = o => Array.isArray(o)
    ? o.map(value => value < 0 ? 0 : value)
    : Object.fromEntries(Object.entries(o).map(([key, value]) => [key, value < 0 ? 0 : value]));
const isInbetween = (x, from, to) => x >= from && x <= to;
const isBeyond = (x, from, to) => x <= from || x >= to;
const whenBelow = (x, ...args) => (args.find(([to, _]) => x <= to) || [0, 0])[1];
const whenAbove = (x, ...args) => (args.toReversed().find(([from, _]) => x >= from) || [0, 0])[1];
const filterAsVa = a => a.includes("As") ? a.filter(code => code !== "Va") : a;
const sum = a => a.reduce((sum, x) => sum + x, 0);

const terminal = () => {
    const ansiEscapes = {
        clearScreen: '\x1b[2J',
        hideCursor: '\x1b[?25l',
        showCursor: '\x1b[?25h',
        cursorHome: '\x1b[H',
    };

    let keyBindings = {};
    const exit = () => {
        process.stdout.write(ansiEscapes.clearScreen + ansiEscapes.cursorHome + ansiEscapes.showCursor);
        process.exit(1);
    };

    const keyListener = chunk => {
        const key = chunk.toString();
        if (key in keyBindings) {
            keyBindings[key]();
        } else if (key === "\x03") {
            exit();
        }
    };

    const input = (maxLength = null) => {
        return new Promise(resolve => {
            let buffer = "";
            const actions = {
                "\x03": () => {
                    exit();
                },
                "\r": () => {
                    process.stdout.write(ansiEscapes.hideCursor);
                    process.stdin.removeListener("data", dataListener);
                    process.stdin.on("data", keyListener);
                    resolve(buffer);
                },
                "\x08": () => {
                    if (buffer.length) {
                        process.stdout.write("\b \b");
                        buffer = buffer.slice(0, -1);
                    }
                }
            };

            const dataListener = chunk => {
                chunk = chunk.toString();
                if (chunk in actions) {
                    actions[chunk]();
                } else if (!/^\x1b\[([ABCD])$/.test(chunk) && !(maxLength && buffer.length >= maxLength)) {
                    process.stdout.write(chunk);
                    buffer += chunk;
                }
            };

            process.stdout.write(ansiEscapes.showCursor);
            process.stdin.removeListener("data", keyListener);
            process.stdin.on("data", dataListener);
        });
    };

    const flex = (proportion = 1, direction = "row") => {
        const calculateItems = (items, parent) => {
            let [currentX, currentY, width, height] = parent?.width
                ? [parent.x, parent.y, parent.width, parent.height]
                : [0, 0, process.stdout.columns, process.stdout.rows];
            const totalFixedSize = sum(items.map(item => item.proportion < 0 ? -item.proportion : 0));
            const totalProportion = sum(items.map(item => item.proportion >= 0 ? item.proportion : 0));
            const availableSpace = (parent.direction === "row" ? width : height) - totalFixedSize;
            for (let item of items) {
                const itemSize = item.proportion >= 0 ? Math.floor((item.proportion / totalProportion) * availableSpace) : -item.proportion;
                const [itemWidth, itemHeight] = [parent.direction === "row" ? itemSize : width, parent.direction === "row" ? height : itemSize];
                Object.assign(item, { x: currentX, y: currentY, width: itemWidth, height: itemHeight });
                if (parent.direction === "row") {
                    currentX += itemWidth;
                } else {
                    currentY += itemHeight;
                }
            }
        };

        const addItem = item => {
            self.items = [...self.items, item];
            return item;
        };

        const self = {
            direction, proportion, items: [],
            calculateLayout: () => {
                let queue = [self];
                do {
                    queue.forEach(i => calculateItems(i.items, i));
                    queue = queue.map(i => i?.items).flat().filter(i => i?.items);
                } while (queue.length > 0);
                return self;
            },
            get: (id = null) => {
                if (id === null) {
                    return self.items.at(-1);
                } else {
                    return self.items.find(i => i.id === id) ?? self.items.filter(f => f?.items).map(f => f.get(id)).flat().at(0);
                }
            },
            cls: () => {
                self.items.forEach(i => i.cls());
                return self;
            },
            flex: (proportion = 1, direction = "row") => {
                return addItem(flex(proportion, direction));
            },
            box: (proportion = 1, id = null) => {
                addItem(box(proportion, id));
                return self;
            }
        };

        return self;
    };

    const box = (proportion, id) => {
        let [row, col] = [1, 1];
        const formatText = (str, anchorX = 1) => {
            let [x, y, words, formattedStr] = [1, 1, str.split(" "), ""];
            for (const [i, word] of words.entries()) {
                if (anchorX + x + word.length - 2 > self.width) {
                    formattedStr += "\r\n", x = 1, y++;
                }

                formattedStr += word + (i === words.length - 1 ? "" : " "), x += word.length + 1;
            }

            return formattedStr;
        };

        const self = {
            id, proportion,
            cls: (char = " ") => {
                for (let i = 0; i <= self.height; i++) {
                    self.at(1, i);
                    process.stdout.write(char.repeat(self.width));
                }

                self.at(1, 1);
                return self;
            },
            at: (x, y) => {
                process.stdout.write(`\x1b[${self.y + y};${self.x + x}H`);
                [col, row] = [x, y];
                return self;
            },
            tab: x => {
                process.stdout.write(`\x1b[${self.x + x}G`);
                col = x;
                return self;
            },
            print: str => {
                self.at(col, row);
                const anchorCol = col;
                const actions = {
                    "\n": () => self.at(col, row + 1),
                    "\r": () => self.tab(anchorCol),
                    "\t": () => self.tab(Math.ceil(col / 10) * 10 + 1)
                };

                for (const char of formatText(str, anchorCol)) {
                    if (char in actions) {
                        actions[char]();
                    } else {
                        process.stdout.write(char);
                        col++;
                    }
                }

                return self;
            },
            right: (str, width) => {
                return self.print(str.padStart(width, ' '));
            },
            center: (str, width) => {
                const paddingSide = Math.floor((width - str.length) / 2);
                return self.print(str.padStart(str.length + paddingSide, ' ').padEnd(width, ' '));
            },
            input: (maxLength = 40) => {
                self.at(col, row);
                return input(Math.min(self.width - col + 1, maxLength)).then(data => {
                    process.stdout.write(`\x1b[${data.length}D\x1b[${data.length}X`);
                    return data;
                });
            }
        };

        return self;
    };

    process.stdin.setRawMode(true);
    process.stdout.write(ansiEscapes.clearScreen + ansiEscapes.cursorHome + ansiEscapes.hideCursor);
    process.stdin.on("data", keyListener);
    const self = {
        keys: (bindings = {}) => {
            keyBindings = bindings;
        },
        flex
    };

    return self;
};

const ship = (designName = "Trader") => {
    const getShipName = () => {
        return sample(shipNames[sample(Object.keys(shipNames))]);
    };

    const getShipDesign = () => {
        const standardDesignsTable = {
            "Courier": {
                hull: 100, jumpDrive: 0, powerPlant: 0, fuelTankage: 40, cargoCapacity: 3,
                crew: 1, buildCostMCrs: 29.43, buildTime: 4 * 9, streamlined: true, staterooms: 4
            },
            "Trader": {
                hull: 200, jumpDrive: 0, powerPlant: 0, fuelTankage: 30, cargoCapacity: 82,
                crew: 4, buildCostMCrs: 37.08, buildTime: 4 * 11, streamlined: true, staterooms: 10
            },
            "Merchant": {
                hull: 400, jumpDrive: 2, powerPlant: 2, fuelTankage: 50, cargoCapacity: 200,
                crew: 5, buildCostMCrs: 100.035, buildTime: 4 * 14, streamlined: true, staterooms: 13, lowBerths: 9
            },
            "Liner": {
                hull: 600, jumpDrive: 8, powerPlant: 8, fuelTankage: 210, cargoCapacity: 129,
                crew: 9, buildCostMCrs: 245.97, buildTime: 4 * 22, streamlined: false, staterooms: 30, lowBerths: 20
            }
        };

        const getDrivePotential = driveClass => {
            const getRow = (n, m) => [...Array(m), ...Array(6 * n).fill().map((_, i) => Math.floor(i / n) + 1)];
            const drivePotentialTable = { 100: [2, 4, 6], 200: getRow(1, 0), 400: getRow(2, 1), 600: getRow(3, 2) };
            return drivePotentialTable[design.hull][driveClass];
        };

        const design = standardDesignsTable[designName];
        const drivePotential = {
            jump: getDrivePotential(design["jumpDrive"]),
            powerPlant: getDrivePotential(design["powerPlant"]),
        };

        return { name: designName, ...design, drivePotential };
    };

    const shipName = getShipName();
    const shipDesign = getShipDesign();
    const expenses = {
        jumpFuelConsumption: 0.1 * shipDesign.hull,
        maneuverFuelConsumption: 10 * shipDesign.drivePotential.powerPlant / 4,
        lifeSupport: { staterooms: 1000, lowBerthsPerUse: 100 }, // crew occupies staterooms
        maintenance: 0.001 * shipDesign.buildCostMCrs / 52, // can be done only at "A" or "B" starports, only "A" starports can build jump ships
        crewSalaries: 1000 * sum(Array.from({ length: shipDesign.crew }, (_, i) => i < 5 ? 6 - i : 3.5)) / 4
    };

    return { name: shipName, design: shipDesign, expenses };
};

const world = (x = 0, y = 0) => {
    const getSystemContents = () => {
        const starport = ['A', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'E', 'E', 'X'][d12() - 2];
        const gasGiant = d12() <= 9;
        return { starport, gasGiant };
    };

    const getWorldName = () => {
        return sample(worldNames[sample(Object.keys(worldNames))]);
    };

    const getPlanetaryProfile = () => {
        const technologicalLevelTable = () => [
            { 'A': 6, 'B': 4, 'C': 2, 'X': -4 }[systemContents.starport] ?? 0,
            whenBelow(size, [1, 2], [4, 1]),
            isBeyond(atmosphere, 3, 10) ? 1 : 0,
            whenAbove(hydrographics, [9, 1], [10, 2]),
            (isInbetween(population, 1, 5) ? 1 : 0) + whenAbove(population, [9, 2], [10, 4]),
            { 0: 1, 5: 1, 13: -2 }[government] ?? 0
        ];

        const size = d12() - 2;
        const atmosphere = size === 0 ? 0 : d12() - 7 + size;
        const hydrographics = size <= 1 ? 0 : d12() - 7 + atmosphere + (isBeyond(atmosphere, 1, 10) ? -4 : 0);
        const population = d12() - 2;
        const government = d12() - 7 + population;
        const technologicalLevel = d6() + sum(technologicalLevelTable());
        return clamp({ size, atmosphere, hydrographics, population, government, technologicalLevel });
    };

    const getTradeClass = () => {
        const { population, atmosphere, hydrographics, government, size } = planetaryProfile;
        const codesTable = {
            "Ba": population === 0,
            "Lo": population > 0 && population <= 3,
            "Hi": population >= 9,
            "Ag": isInbetween(atmosphere, 4, 9) && isInbetween(hydrographics, 4, 8) && isInbetween(population, 5, 7),
            "Na": atmosphere <= 3 && hydrographics <= 3 && population >= 6,
            "In": [0, 1, 2, 4, 7, 9].includes(atmosphere) && population >= 9,
            "Ni": population <= 6,
            "Ri": isInbetween(government, 4, 9) && [6, 8].includes(atmosphere) && isInbetween(population, 6, 8),
            "Po": isInbetween(atmosphere, 2, 5) && hydrographics <= 3,
            "Wa": hydrographics >= 10,
            "De": hydrographics === 0 && atmosphere >= 2,
            "Va": atmosphere === 0,
            "As": size === 0,
            "Ic": atmosphere <= 1 && hydrographics >= 1,
            "Fl": atmosphere >= 10 && hydrographics >= 1
        };

        return Object.entries(codesTable).map(([code, value]) => value && code).filter(c => c);
    };

    const getCostOfGoods = () => {
        const [technologicalLevel, starport] = [planetaryProfile.technologicalLevel, systemContents.starport];
        const costOfGoodsTable = { "Ba": 1, "Lo": 1, "Hi": -1, "Ag": -1, "In": -1, "Ni": 1, "Ri": 1, "Po": -1, "De": 1, "Va": 1, "As": -1, "Fl": 1 };
        const cargo = sum([
            1000 * sum(tradeClass.map(code => costOfGoodsTable[code] ?? 0)),
            100 * technologicalLevel,
            1000 * ({ 'A': -1, 'C': 1, 'D': 2, 'E': 3, 'X': 5 }[starport] ?? 0)
        ]) + 4000;
        return { cargo, refinedFuel: 500, berthing: 100, shuttle: 50 };
    };

    const getCargoAvailable = destWorld => {
        const { population, technologicalLevel } = planetaryProfile;
        const { population: destPopulation, technologicalLevel: destTechnologicalLevel } = destWorld.planetaryProfile;
        const destPopulationEffects = whenAbove(destPopulation, [0, -4], [5, 0], [8, 1]);
        const techLevelEffects = technologicalLevel - destTechnologicalLevel;
        const cargoTable = clamp([
            population <= 0 ? null : whenAbove(population, [1, -4], [2, population - 4]),
            population <= 0 ? null : whenAbove(population, [1, -4], [2, population - 3]),
            population <= 5 ? null : whenAbove(population, [6, -3], [8, -2], [10, 0])
        ].map(dm => dm !== null ? 3.5 + dm + destPopulationEffects + techLevelEffects : 0)); // d6 for the number of cargos
        const finalTonnage = [10, 5, 1].map((t, i) => 3.5 * t * cargoTable[i]); // d6 for each cargo to determine its size
        const passengersTable = {
            middle: [0, 1, 3, 3, 7, 7, 7, 10, 14, 17, 24],
            low: [0, 1, 7, 7, 7, 7, 10, 10, 14, 17, 21]
        };

        const middlePassengers = passengersTable["middle"][population] + destPopulationEffects;
        const lowPassengers = passengersTable["low"][population] + destPopulationEffects;
        return clamp({ cargo: finalTonnage, passengers: [middlePassengers, lowPassengers] });
    };

    const getPriceOfGoods = destWorld => {
        const { tradeClass: destTradeClass, planetaryProfile: destPlanetaryProfile, systemContents: destSystemContents } = destWorld;
        if (destTradeClass.includes("Ba")) {
            return { cargo: 0, freight: 0 };
        }

        const toDictionary = a => Array.isArray(a) ? Object.fromEntries(filterAsVa(a).map(x => [x, 1])) : a;
        const marketPriceTable = Object.entries({
            "Ag": ["Ag", "As", "De", "Hi", "In", "Lo", "Na", "Ri"],
            "As": ["As", "In", "Na", "Ri", "Va"],
            "Ba": ["Ag", "In"],
            "De": ["De", "Na"],
            "Fl": ["Fl", "In"],
            "Hi": ["Hi", "Lo", "Ri"],
            "Ic": ["In"],
            "In": ["Ag", "As", "De", "Fl", "Hi", "In", "Ni", "Po", "Ri", "Va", "Wa"],
            "Na": ["As", "De", "Va"],
            "Ni": { "In": 1, "Ni": -1 },
            "Po": { "Po": -1 },
            "Ri": ["Ag", "De", "Hi", "In", "Na", "Ri"],
            "Va": ["As", "In", "Va"],
            "Wa": ["In", "Ri", "Wa"]
        }).reduce((ret, [code, a]) => ({ ...ret, [code]: toDictionary(a) }), {});
        const basePrice = 5000;
        const intersection = filterAsVa(tradeClass).reduce((res, origin) => [...res, ...destTradeClass.map(dest => [origin, dest])], []);
        const tradeClassEffects = 1000 * sum(intersection.map(([origin, dest]) => marketPriceTable[origin]?.[dest] ?? 0));
        const techLevelEffects = 0.1 * (planetaryProfile.technologicalLevel - destPlanetaryProfile.technologicalLevel);
        const finalPrice = (basePrice + tradeClassEffects) * (1 + techLevelEffects); // actual value 1 + 0.1x(d12 - 7)
        return { cargo: finalPrice, freight: 1000, passengers: { middle: 8000, low: 1000 } };
    };

    const systemContents = getSystemContents();
    const worldName = getWorldName();
    const planetaryProfile = getPlanetaryProfile();
    const tradeClass = getTradeClass();
    const costOfGoods = getCostOfGoods();
    return { name: worldName, x, y, systemContents, planetaryProfile, tradeClass, costOfGoods, getCargoAvailable, getPriceOfGoods };
};

const sector = (width = 10, height = 8, density = 0.3, age = 5) => {
    const toLoc = (...args) => args[0] + width * args[1];
    const getMap = () => {
        const getHeights = generationsNo => {
            const size = width * height;
            let heights = [Array.from({ length: size }, () => Math.floor(Math.random() * 1000)), []];
            let [from, to] = [0, 1];
            for (let generation = 0; generation < generationsNo; generation++) {
                heights[to] = heights[from].map((_, loc) => {
                    const locs = [loc, ...neighborOffsets.map(offset => loc + toLoc(...offset)).filter(loc => loc >= 0 && loc < size)];
                    const total = sum(locs.map(loc => heights[from][loc]));
                    return Math.floor(total / locs.length);
                });
                [to, from] = [from, to];
            }

            const waterLine = heights[from].toSorted()[Math.floor(size * (1 - density))];
            return heights[from].map(h => h >= waterLine ? 4 : 0);
        };

        const heights = getHeights(age);
        return [...Array(height)].map((_, y) => [...Array(width)].map((_, x) => d6() + heights[toLoc(x, y)] >= 7 ? world(x, y) : null));
    };

    const getNeighbors = (originX, originY, D = 1) => {
        const offsets = Array.from({ length: 2 * D + 1 }, (_, i) => i - D);
        const product = offsets
            .flatMap(dx => offsets.map(dy => [dx, dy]))
            .map(([dx, dy]) => [originX + dx, originY + dy])
            .filter(([x, y]) => x >= 0 && x < width && y >= 0 && y < height);
        return product.map(([x, y]) => map[y][x]).filter(w => w && w !== map[originY][originX]);
    };

    const map = getMap();
    return { width, height, map, getNeighbors };
};

const drawMap = sector => {
    let lines = [];
    for (let y = 0; y < sector.height; y++) {
        let line = '';
        for (let x = 0; x < sector.width; x++) {
            const w = sector.map[y][x];
            if (!w) {
                line += ''.padStart(3);
            } else {
                const exports = sum(sector.getNeighbors(x, y).map(n => w.getCargoAvailable(n)).flatMap(c => c.cargo));
                const imports = sum(sector.getNeighbors(x, y).map(n => n.getCargoAvailable(w)).flatMap(c => c.cargo));
                const trade = imports + exports;
                if (trade === 0) {
                    line += ''.padStart(3);
                } else {
                    line += (trade / 100).toFixed(0).padStart(3);
                }
            }
        }

        lines.push(line)
    }

    return lines.join("\r\n");
};

const sandbox = () => {
    const calculateTransactionCost = (p0, n = 1) => {
        const elasticity = p0 => whenAbove(p0, [0, p0], [10, p0 / 10 + 10], [100, p0 / 100 + 20]);
        let [p1, cost] = [p0, 0];
        for (let i = 0; i < Math.abs(n); i++) {
            p1 += Math.sign(n) * elasticity(p1) / 100;
            cost += p1;
        }
    
        return [cost, p1];
    };
    
    const approximateTransactionCost = (p0, n = 1) => {
        const p1 = (p0 + 100.0) * Math.exp(n/1000) - 100.0;
        const cost = Math.abs(n * (p0 + p1 + Math.sqrt(p0 * p1)) / 3);
        return [cost, p1];
    };
    
    const approximateTransactionUnits = (p0, p1) => {
        return 1000*Math.log((p1 + 100)/(p0 + 100));
    };
    
    const ship = (designName = 'Trader') => {
        const standardDesignsTable = {
            'Trader': { buildCostMCrs: 37.08, cargoCapacity: 82, expenses: 20.46 },
            'Merchant': { buildCostMCrs: 100.035, cargoCapacity: 200, expenses: 33.17 }
        };
    
        return standardDesignsTable[designName];
    };
    
    const world = () => {
        const population = d12() - 2;
        const starportEffect = [6, 6, 6, 4, 4, 2, 2, 0, 0, 0, -4][d12() - 2];
        const environmentalEffect = [0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3][d12() - 2];
        const populationalEffect = whenBelow(population, [5, 1]) + whenAbove(population, [9, 2], [10, 4]);
        const technologicalLevel = starportEffect + environmentalEffect + populationalEffect + d6();
        const cargoCost = 4 + 0.1 * technologicalLevel;
        const getCargoAvailable = destWorld => 50*(population + (destWorld.population < 5 ? -4 : 0) + technologicalLevel - destWorld.technologicalLevel);
        const getCargoPrice = destWorld => 5 + 0.5 * (technologicalLevel - destWorld.technologicalLevel);
        return { population, technologicalLevel, cargoCost, getCargoAvailable, getCargoPrice };
    };
    
    const sector = Array.from({ length: 40 }, () => world());
};

sandbox();
