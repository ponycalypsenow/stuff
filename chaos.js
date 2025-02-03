// ---- notes ---------------------------------------------------------------------------------------------------------------------------------------

/*
    Useful equations:
        Linear demand: x = c + bp + dm
        Log-linear demand: log(x) = log (c) + blog(p) + dlog(m)
        Semi-log demand: log(x) = c + bp + dm

        Exponential: dN/dt = r0N
        Logistic: dN/dt = r0N(1 - N/k)
        Lotka-Volterra: dN/dt = r0N - aNP, dP/dt = -dP + xaNP

        Exponential: Nt+1 = l0Nt
        Quadratic map: Nt+1 = l0Nt(1 - Nt/k)
        Ricker: Nt+1 = l0Ntexp(-bNt)
        Gompertz: Nt+1 = l0Nt^O
        Beverton-Holt: Nt+1 = l0Nt/(1 + bNt)
        Depensation: Nt+1 = l0Nt^2/(1 + bNt^2)
        Theta-Ricker: Nt+1 = l0Ntexp(-bNt^O)

        l0 = exp[r0] intristic rate of population increase, k carrying capacity, b positive constant, O exponent

        Constant: c
        Linear: aN
        Hyperbolic: aN/(1 + ahN)
        Exponential (Ivlev): c(1 - exp(-N/a))
        Sigmoid: cN^2/(d^2 + N^2)
        Sigmoid (mechanistic): bN^2/(1 + gN + bhN^2)
        O-sigmoid: cN^O/(d^O + N^O)
        Predator interference (mechanistic): aN/(1 + awP)
        Predator interference (phenom.): aNP^-O
        Beddington: aN/(1 + awP + ahN)
        Hyperbolic ratio depdendent: cN/(dP + N)
        Linear ratio dependent: cN/P

        N prey density, P predator density, c maximum killing rate, a predator searching rate, h handling time w waste time, b maximum searching rate, g search rate saturation with prey density, d half-saturation constant, O exponent

    NumPy:
        import numpy as np
        from numpy.lib.stride_tricks import sliding_window_view
        import matplotlib.pyplot as plt
        from scipy.optimize import minimize

        time = np.datetime64(datetime.strptime(c['time'][:26], "%Y-%m-%dT%H:%M:%S.%f"))

        a = np.array([(1, 2), (3,4)], dtype={'names': ['a', 'b'], 'formats': [np.float32, np.float32]})
        b = np.array([(5,), (6,)], dtype=[('c', np.float32)])
        c = np.array(np.zeros(a.shape), np.dtype(a.dtype.descr + b.dtype.descr))
        c[:][list(a.dtype.names)], c[:][list(b.dtype.names)] = a[:][list(a.dtype.names)], b[:][list(b.dtype.names)]
        np.array([x for x in range(10)]).shape
        np.array([1,2,3]).dtype
        np.array([[1,2,3]], dtype=[('a', np.int64), ('b', np.int64), ('c', np.int64)]).dtype.names
        np.arange(0, 10, 1).T
        len(np.ones(3).flatten())
        np.linspace(0, 1, 10).astype(np.float32).round(2)
        np.array([1,2,3,4,5,6]).reshape((-1, 3))

        np.concatenate([[1,2,3],[4,5,6]])
        np.stack([[1,2,3],[4,5,6]], axis=0)
        np.atleast_2d([1])

        np.sort([1,5,4,3,2])
        np.argmax([1,2,3,4,3,2])
        np.bincount([1,1,2,2,2])
        np.array(np.unique(np.array([1,2,3,1]), return_counts=True)).T
        np.sign([1,-1,-3,-1, 0])
        np.where(np.array([1,2,3]) >= 2, 1, 0)

        np.random.random([2, 3])
        np.random.randint(0, 2, (2, 3))
        np.random.choice([1,2,3])
        np.random.shuffle([1,2,3])
        np.random.standard_normal(10)
        np.random.binomial(100, 0.5, 10)

        np.allclose([1,2],[1,2])
        np.linalg.matrix_rank([[0, 1], [1, 0]])
        np.linalg.lstsq([[0.5, 0], [0, 1]], [2, 3], rcond=-1)[0]
        np.linalg.solve([[0.5, 0], [0, 1]], [2, 3])
        r = np.polyfit([0,1,2], [1, 2, 3], deg=1, full=True) # potentially useful for clusters
        np.polyval(r[0], [1])
        minimize(lambda x: x[0], np.ones(1), bounds=[(0, None)], constraints=[{'type': 'eq', 'fun': lambda x: x - 2}])

        np.dot([1,2,3], [4,5,6])
        np.var(np.array([1,2,3]))
        np.std(np.array([1,2,3]))
        np.cov([1,2,3], aweights=[1,2,3], ddof=0)
        np.corrcoef([1,2,3,4],[1,2,1,2])
        np.mean(sliding_window_view(np.array([1,2,3,4,5]), 3), axis=0)
        np.diff(np.array([1,2,3]), n = 1)
        np.roll(np.array([1,2,3]),-1)[:-1]
        np.sum(np.array([1,2,3]))
        np.cumsum(np.array([1,2,3]))
        np.median(np.array([1,2,3]))
        np.max([1,2,3])
        np.min([1,2,3])
        np.sqrt([1,2,3])
        np.log([1,2,3])
        np.exp([1,2,3])

        fig, ax = plt.subplots(2, 1, figsize=(16, 5), gridspec_kw={'height_ratios': [2, 1]}, sharex=True)
        ax[0].set_ylabel('some numbers')
        ax[0].plot([1,2,3,4], '--', lw=0.5, label='sample data', color='#ff00ff')
        ax[0].fill_between([0, 1, 2, 3], [0, 0, 0, 0], [1, 2, 3, 4], color='green', alpha=0.125)
        ax[0].vlines([0, 1, 2, 3], 0, 7, colors=['#dddddd'])
        ax[0].legend()
        ax[1].plot([4,5,6,7], '^', ms=11)
        ax[1].tick_params(labelrotation=90)
        plt.show()

    Sympy:
        from sympy import *
        init_printing()
        x, y, a, b, c, d = symbols("x y a b c d") #integer=True, real=True, positive=True
        gn = Function("gn")(x)
        fn = (c*x + d + gn)/(a*x + b + sympify(3.14))
        fn.args[0]
        #fn.simplify().expand().factor().collect(x).apart().together().cancel()
        fn.subs({x: 1}).evalf()
        lambdify(x, fn.subs({gn: 1}), "numpy")(1)
        gn.diff(x, x).integrate((x, 0, 1))
        cos(x).series(x, n=3).removeO()
        ((cos(x + a) - cos(x))/a).limit(a, 0)
        Sum(1/(x**2), (x, 1, oo)).doit()
        Product(x, (x, 1, 7))
        solve(x**2 + 2*x - 3)
        eq1 = x + 2 * y - 1
        eq2 = x - y + 1
        solve([eq1, eq2], [x, y], dict=True)
        t, k, T0, T_a = symbols("t, k, T_0, T_a")
        T = Function("T")
        ode = T(t).diff(t) + k*(T(t) - T_a)
        ode_sol = dsolve(Eq(ode, 0))
        ode_sol.rhs
        C_eq = ode_sol.subs(t, 0).subs({T(0): T0})
        C_sol = solve(C_eq)
        ode_sol.subs(C_sol[0])

    Linux:
        startx /usr/bin/i3
        find, which, type, whereis
        pwd
        sort, unique, tee
        free
        touch
        ls
        chmod, chown
        grep
        head, tail
        less, more
        adduser
        chpasswd
        cp
        rm
        mv
        mkdir
        rmdir
        cat
        clear
        cd
        echo
        diff
        shutdown
        top, ps, htop, free
        sudo
        fg, bg, pandoc, jq, csvtool
        append & to command, to run it in background
        fg %1 moves it forward
        ctrl+z, then bg moves it into background
        jobs, kill

    Vi:
        h j k l - cursor
        w b - word
        i - insert text, I - at the beginning of the line
        o - next line, O - above
        a - append after char, A - append at the end of the liine
        x - delete a character
        r - replace a character
        dd - delete a line
        R - overwrite text
        p, P - put text before after
        :wq! - write, quit, force
        c2w, 2cw - change 2 words
        c change, d delete, y yank
        C change the whole line, D delete the whole line
        w - word forward, b - back, e - end of word
        H, M, L - top of the screen
        {}, next paragraph, prev paragraph
        ^ beginning, $ end
        /forwad
        ?backward
        n, N repeat last search
        fchar forward to char, Fchar backward, ;last search
        % matching (), {}, []
        :5,30d deletes lines t through 30
        6yy, yanks six lines
        n. - repeat the last command n times
        J join the next line
        u undo last single change, U restore current line
        ~ case
        "ayy - yank line into buffer a
        "ap - puts contents of buffer into a line
        :5,10 co $ - copies lines 5-10 to end of file, m moves, d deletes
        :%s/old/new/gc - substitution, also can ^,., .,$, :& repeats
        :r reads file, :!ls executes command, :set shows commands
        :n move to file2, :rew rewind back to file1, :e! restore
        <> indent, unindent
        G - goto, mc marker ,c go to marker
        ^D, ^U - scrolls down up, ^E expose down ^Y up, ^F ^B

    Docker:
        docker image build --build-arg <arg> -t <tag> --target <stage> <path>
        docker image history <image>:<tag>
        docker image inspect <image>:<tag>
        docker image ls
        docker image pull <image>:<tag>
        docker image rm <image_id>
        docker container create --name="awesome-service" -p 6379:6379 <image> [command]
        docker container exec -it <container_id> /bin/bash
        docker container export <container_id> -o <file>.tar
        docker container inspect <container_name>
        docker container kill <container_id>
        docker container logs [ -f ] <container_name>
        docker container ls [ -a ] [ --filter ancestor=<image>:<tag> ] [ -f label=<key>=<value> ]
        docker container diff <container>
        docker container top <container_name>
        docker container start <container_id>
        docker container stop <container_id>
        docker container rm <container_id>
        docker container run --rm --mount source=<volume>,target=/app <image>:<tag> <command> --device nvidia.com/gpu=all
        docker container run --rm -ti --mount type=bind,target=/mnt/session_data,source=/data <image>:<tag> /bin/bash
        docker container run --rm -d --name <name> -l deployer=<name> -l tester=<name> <image>:<tag> <command>
        docker container run --rm -d -t <image> /bin/bash
        docker container run --rm -it --init <image>:<tag> sh -c "ps -ef"
        docker container run --rm -it --privileged --pid=host <image> nsenter -t 1 -m -u -n -i sh
        docker container run --rm -ti --hostname="mycontainer.example.com" <image>:<tag> /bin/bash
        docker container run --rm -ti -v /mnt/session_data:/data:ro <image>:<tag> /bin/bash
        docker container run --rm <image>:22.04 /bin/cat /etc/passwd
        docker container run -ti <image> [command]
        docker container run --rm -d -p 8080:8080 --env <VAR>=<value> --publish mode=ingress,published=8080,target=8080 <image>:<tag> [command]
        docker volume create my-data
        docker volume ls
        exit
        hostname -f
        id 7
        lsof -p 22983
        netstat -anp
        ps -ef
        strace -p 23032
*/


// ---- utils ---------------------------------------------------------------------------------------------------------------------------------------

const parseHTML = html => {
    const removeHtmlComments = html => html.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ');
    const parseElement = tag => ({ tag: tag.startsWith('/') ? tag.slice(1) : tag, children: [], textContent: '' });
    let [stack, root, currentElement] = [[], null, null];
    removeHtmlComments(html).split(/(<[^>]*>)/).forEach((token) => {
        if (token.startsWith('<')) {
            const tag = token.slice(1, -1);
            const isClosingTag = tag.startsWith('/');
            const element = parseElement(isClosingTag ? tag.slice(1) : tag);
            root = root ?? element;
            currentElement && currentElement.children.push(element);
            if (!isClosingTag) {
                stack.push(element);
                currentElement = element;
            } else {
                stack.pop();
                currentElement = stack.at(-1) ?? null;
            }
        } else if (currentElement) {
            currentElement.textContent += token;
        }
    });

    return root;
};

const sprintf = (format, ...args) => {
    const typeMap = {
        's': arg => arg,
        'i': arg => arg.toString(),
        'f': (arg, precision = 2) => parseFloat(arg).toFixed(precision)
    };

    let argIndex = 0;
    return format.replace(/%(-?\d+)?(\.\d+)?([sif])/g, (_, width, precision, type) => {
        let arg = args[argIndex++];
        let formatted = typeMap[type](arg, precision ? parseInt(precision.slice(1)) : undefined);
        width = width ? parseInt(width) : 0;
        return width < 0 ? formatted.padEnd(Math.abs(width)) : formatted.padStart(width);
    });
};


// ---- assets --------------------------------------------------------------------------------------------------------------------------------------

const loadAsset = (path = './BTC.1d.json') => {
    return JSON.parse(fs.readFileSync(path)).map((row, i) => parseFloat(row[4]));
};

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


// ---- sdl -----------------------------------------------------------------------------------------------------------------------------------------

const SDL = (width = 400, height = 200) => {
    const PALETTE = [
        0x000000, 0xFFFFFF, 0x68372B, 0x70A4B2, 0x6F3D86, 0x588D43, 0x352879, 0xB8C76F, 0x6F4F25, 0x433900, 0x9A6759, 0x444444, 0x6C6C6C, 0x9AD284, 0x6C5EB5, 0x959595
    ];

    const FONT = [
        "0018666618623c060c300000000000003c183c3c067e3c7e3c3c00000e00703c3c187c3c787e7e3c663c1e666063663c7c3c7c3c7e66666366667e3c003c08002000000000000000000000000000000000000000000000000000000c183000",
        "001866663e66660c1818661800000003661866660e6066666666000018001866663c66666c60606666180c6c60777666666666661866666366660630600c1c001000600006000e006018066038000000000000001800000000000018181800",
        "001866ff600c3c18300c3c18000000066e3806061e7c600c66661818307e0c066e6666606660606066180c78607f7e6666666660186666633c660c30300c3600083c603c063c183e6000006018667c3c7c3e7c3e7e66666366667e18181800",
        "001800663c183800300cff7e007e000c76180c1c66067c183c3e00006000060c6e7e7c606678786e7e180c70606b7e667c667c3c1866666b183c1830180c630000067c603e663e667c38066c187f6666666666601866666b3c660c30180c39",
        "000000ff06306700300c3c1800000018661830067f06661866060000307e0c18606666606660606666180c7860636e66606678061866667f3c1830300c0c4100003e6660667e186666180678187f66666666603c1866667f1866181818184e",
        "000000667c666600181866181800183066186066066666186666181818001800626666666c60606666186c6c60636666603c6c6618663c7766186030060c0000006666606660183e6618066c186b66667c3e600618663c3e3c3e3018181800",
        "0018006618463f000c300000180018603c7e7e3c063c3c183c3c00180e0070183c667c3c787e603c663c38667e63663c600e663c183c186366187e3c033c0000003e7c3c3e3c1806663c06663c63663c6006607c0e3e1836660c7e0c183000",
        "000000000000000000000000300000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000000000000ff000000000000007c00003c0000000000600600000000000000780000180000"
    ];

    const SDL_INIT_EVERYTHING = 0xf231;
    const SDL_WINDOWPOS_UNDEFINED = 0x1fff0000;
    const SDL_WINDOW_OPENGL = 0x00000002;
    const SDL_WINDOW_RESIZABLE = 0x00000020;
    const SDL_WINDOW_MAXIMIZED = 0x00000080;
    const SDL_RENDERER_ACCELERATED = 0x00000002;
    const SDL_RENDERER_PRESENTVSYNC = 0x00000004;
    const SDL_RENDERER_TARGETTEXTURE = 0x00000008;
    const SDL_PIXELFORMAT_RGBA8888 = 0x16462004;
    const SDL_TEXTUREACCESS_TARGET = 2;
    const SDL_QUIT = 0x100;
    const SDL_KEYDOWN = 0x300;
    const SDL_KEYUP = 0x301;
    const SDL_MOUSEMOTION = 0x400;
    const SDL_MOUSEBUTTONDOWN = 0x401;
    const SDL_MOUSEBUTTONUP = 0x402;
    const SDL_BUTTON_LEFT = 1;
    const SDL_BUTTON_RIGHT = 3;

    const SDL_KeyboardEvent = koffi.struct('SDL_KeyboardEvent', {
        timestamp: 'uint32',
        windowID: 'uint32',
        state: 'uint8',
        repeat: 'uint8',
        padding2: 'uint8',
        padding3: 'uint8',
        keysym: 'uint32'
    });

    const SDL_MouseMotionEvent = koffi.struct('SDL_MouseMotionEvent', {
        timestamp: 'uint32',
        windowID: 'uint32',
        which: 'uint32',
        state: 'uint32',
        x: 'int32',
        y: 'int32',
        xrel: 'int32',
        yrel: 'int32'
    });

    const SDL_MouseButtonEvent = koffi.struct('SDL_MouseButtonEvent', {
        timestamp: 'uint32',
        windowID: 'uint32',
        which: 'uint32',
        button: 'uint8',
        state: 'uint8',
        clicks: 'uint8',
        padding1: 'uint8',
        x: 'int32',
        y: 'int32'
    });

    const SDL_Event = koffi.struct('SDL_Event', {
        type: 'uint32',
        raw: koffi.array('uint8', 56 - 4)
    });

    const SDL_Rect = koffi.struct('SDL_Rect', {
        x: 'int',
        y: 'int',
        w: 'int',
        h: 'int'
    });

    const SDL_PollEvent = sdl2.func('__stdcall', 'SDL_PollEvent', 'int', ['_Out_ SDL_Event *']);
    const SDL_SetMainReady = sdl2.func('__stdcall', 'SDL_SetMainReady', 'void', []);
    const SDL_Init = sdl2.func('__stdcall', 'SDL_Init', 'int', ['uint32']);
    const SDL_CreateWindow = sdl2.func('__stdcall', 'SDL_CreateWindow', 'void *', ['str', 'int', 'int', 'int', 'int', 'uint32']);
    const SDL_CreateRenderer = sdl2.func('__stdcall', 'SDL_CreateRenderer', 'void *', ['void *', 'int', 'uint32']);
    const SDL_CreateTexture = sdl2.func('__stdcall', 'SDL_CreateTexture', 'void *', ['void *', 'uint32', 'int', 'int', 'int']);
    const SDL_RenderSetLogicalSize = sdl2.func('__stdcall', 'SDL_RenderSetLogicalSize', 'int', ['void *', 'int', 'int']);
    const SDL_DestroyTexture = sdl2.func('__stdcall', 'SDL_DestroyTexture', 'void', ['void *']);
    const SDL_DestroyRenderer = sdl2.func('__stdcall', 'SDL_DestroyRenderer', 'void', ['void *']);
    const SDL_DestroyWindow = sdl2.func('__stdcall', 'SDL_DestroyWindow', 'void', ['void *']);
    const SDL_Quit = sdl2.func('__stdcall', 'SDL_Quit', 'void', []);
    const SDL_RenderCopyEx = sdl2.func('__stdcall', 'SDL_RenderCopyEx', 'int', ['void *', 'void *', 'void *', 'void *', 'double', 'void *', 'int']);
    const SDL_RenderPresent = sdl2.func('__stdcall', 'SDL_RenderPresent', 'void', ['void *']);
    const SDL_SetWindowTitle = sdl2.func('__stdcall', 'SDL_SetWindowTitle', 'void', ['void *', 'str']);
    const SDL_SetRenderTarget = sdl2.func('__stdcall', 'SDL_SetRenderTarget', 'int', ['void *', 'void *']);
    const SDL_SetRenderDrawColor = sdl2.func('__stdcall', 'SDL_SetRenderDrawColor', 'int', ['void *', 'uint8', 'uint8', 'uint8', 'uint8']);
    const SDL_RenderClear = sdl2.func('__stdcall', 'SDL_RenderClear', 'int', ['void *']);
    const SDL_RenderDrawPoint = sdl2.func('__stdcall', 'SDL_RenderDrawPoint', 'int', ['void *', 'int', 'int']);
    const SDL_RenderDrawLine = sdl2.func('__stdcall', 'SDL_RenderDrawLine', 'int', ['void *', 'int', 'int', 'int', 'int']);
    const SDL_RenderFillRect = sdl2.func('__stdcall', 'SDL_RenderFillRect', 'int', ['void *', 'SDL_Rect *']);

    let [window, renderer, texture, palette, font] = [null, null, null, null, null];
    const parsePalette = () => PALETTE.map(integerToRGB);
    const parseFont = () => FONT.flatMap(l => l.match(/.{2}/g).map(pair => integerToBytes(nibblesToInteger(parseInt(pair[0], 16), parseInt(pair[1], 16)))).flat());
    const integerToRGB = (rgb) => [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255];
    const nibblesToInteger = (high, low) => ((high << 4) | low) & 255;
    const integerToBytes = (i) => [...i.toString(2).padStart(8, '0')].map(Number);
    const events = {
        width: width, height: height,
        keyboard: {},
        mouse: { x: 0, y: 0, left: false, right: false },
        quit: false,
        stop: () => {
            events.quit = true;
        },
        title: (title) => {
            SDL_SetWindowTitle(window, title);
        },
        key: (code) => {
            return events.keyboard[code];
        },
        clear: (p = 0) => {
            const [r, g, b] = palette[p];
            SDL_SetRenderDrawColor(renderer, r, g, b, 255);
            SDL_RenderClear(renderer);
        },
        pixel: (x, y, p = 7) => {
            const [r, g, b] = palette[p];
            SDL_SetRenderDrawColor(renderer, r, g, b, 255);
            SDL_RenderDrawPoint(renderer, x, y);
        },
        line: (x0, y0, x1, y1, p = 7) => {
            const [r, g, b] = palette[p];
            SDL_SetRenderDrawColor(renderer, r, g, b, 255);
            SDL_RenderDrawLine(renderer, x0, y0, x1, y1);
        },
        rect: (x, y, w, h, p = 7) => {
            const [r, g, b] = palette[p];
            SDL_SetRenderDrawColor(renderer, r, g, b, 255);
            const rect = new SDL_Rect({ x, y, w, h });
            SDL_RenderFillRect(renderer, rect);
        },
        print: (text, sx = 0, sy = 0, p = 7, flip = false) => {
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                for (let dx = 0; dx < 8; dx++) {
                    for (let dy = 0; dy < 8; dy++) {
                        if (font[4 * FONT[0].length * dy + 8 * (char.charCodeAt(0) - 32) + dx]) {
                            events.pixel(8 * i + dx + sx, (flip ? 8 - dy : dy) + sy, p);
                        }
                    }
                }
            }
        }
    };

    const init = () => {
        SDL_SetMainReady();
        SDL_Init(SDL_INIT_EVERYTHING);
        window = SDL_CreateWindow("sdl2", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, width, height, SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE | SDL_WINDOW_MAXIMIZED);
        renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC | SDL_RENDERER_TARGETTEXTURE);
        SDL_RenderSetLogicalSize(renderer, width, height);
        texture = SDL_CreateTexture(renderer, SDL_PIXELFORMAT_RGBA8888, SDL_TEXTUREACCESS_TARGET, width, height);
        palette = parsePalette();
        font = parseFont();
    };

    const shut = () => {
        SDL_DestroyTexture(texture);
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        SDL_Quit();
    };

    function* run() {
        init();
        while (!events.quit) {
            const event = {};
            while (SDL_PollEvent(event)) {
                if (event.type === SDL_QUIT) {
                    events.quit = true;
                } else if ([SDL_KEYDOWN, SDL_KEYUP].includes(event.type)) {
                    const key = koffi.decode(event.raw, SDL_KeyboardEvent);
                    if (!key.repeat) {
                        events.keyboard[key.keysym] = event.type === SDL_KEYDOWN;
                    }
                } else if (event.type === SDL_MOUSEMOTION) {
                    const motion = koffi.decode(event.raw, SDL_MouseMotionEvent);
                    events.mouse.x = motion.x;
                    events.mouse.y = motion.y;
                } else if ([SDL_MOUSEBUTTONDOWN, SDL_MOUSEBUTTONUP].includes(event.type)) {
                    const button = koffi.decode(event.raw, SDL_MouseButtonEvent);
                    if (button.button === SDL_BUTTON_LEFT) {
                        events.mouse.left = event.type === SDL_MOUSEBUTTONDOWN;
                    } else if (button.button === SDL_BUTTON_RIGHT) {
                        events.mouse.right = event.type === SDL_MOUSEBUTTONDOWN;
                    }
                }
            }

            SDL_SetRenderTarget(renderer, texture);
            yield events;
            SDL_SetRenderTarget(renderer, null);
            SDL_RenderCopyEx(renderer, texture, null, null, 0, null, 0);
            SDL_RenderPresent(renderer);
        }

        shut();
    }

    return run();
};


// ---- expressions ---------------------------------------------------------------------------------------------------------------------------------

const Expr = (val, params = {}, stepFn = () => { }) => {
    return {
        val,
        grad: 0,
        args: params?.args ?? [],
        op: params?.op ?? null,
        step() {
            stepFn(this);
        }
    };
};

const Val = val => Expr(val);

const Const = val => Expr(val, { op: 'const' });

class Op {
    static operatorMap = { '+': Op.add, '-': Op.sub, '*': Op.mul, '/': Op.div, '^': Op.pow, 'exp': Op.exp, 'ln': Op.ln, 'relu': Op.relu };

    static add(a, b) {
        return Expr(a.val + b.val, { args: [a, b], op: '+' }, out => {
            a.grad += 1 * out.grad;
            b.grad += 1 * out.grad;
        });
    }

    static sub(a, b) {
        return Expr(a.val - b.val, { args: [a, b], op: '-' }, out => {
            a.grad += 1 * out.grad;
            b.grad += -1 * out.grad;
        });
    }

    static mul(a, b) {
        return Expr(a.val * b.val, { args: [a, b], op: '*' }, out => {
            a.grad += b.val * out.grad;
            b.grad += a.val * out.grad;
        });
    }

    static div(a, b) {
        return Expr(a.val / b.val, { args: [a, b], op: '/' }, out => {
            a.grad += (1 / b.val) * out.grad;
            b.grad += (-a.val / (b.val ** 2)) * out.grad;
        });
    }

    static pow(a, x) {
        return Expr(a.val ** x.val, { args: [a, x], op: '^' }, out => {
            a.grad += x.val * a.val ** (x.val - 1) * out.grad
        });
    }

    static exp(a) {
        return Expr(Math.exp(a.val), { args: [a], op: 'exp' }, out => {
            a.grad += out.val * out.grad;
        });
    }

    static ln(a) {
        return Expr(Math.log(a.val), { args: [a], op: 'ln' }, out => {
            a.grad += (1.0 / out.val) * out.grad;
        });
    }

    static relu(a) {
        return Expr(a.val > 0 ? a.val : 0, { args: [a], op: 'relu' }, out => {
            a.grad += (out.val > 0 ? 1 : 0) * out.grad;
        });
    }
};

const Trace = expr => {
    let [steps, visited] = [[], new Set()];
    const traceRec = step => {
        if (visited.has(step))
            return;
        visited.add(step);
        for (const arg of step.args)
            traceRec(arg);
        steps.unshift(step);
    };

    traceRec(expr);
    let moments = Array(steps.filter(s => s.op !== 'const').length).fill(0);
    return {
        steps,
        vals: steps.filter(s => s.op === null).reverse(),
        forward() {
            for (const step of [...this.steps].reverse()) {
                step.val = (step.op in Op.operatorMap)
                    ? Op.operatorMap[step.op](...step.args).val
                    : step.val;
                step.grad = (step === expr) ? 1 : 0;
            }

            return this;
        },
        backward(lr = 0.01, decay = 0.9) {
            for (const step of this.steps)
                step.step();
            for (const [i, step] of this.steps.filter(s => s.op !== 'const').entries()) {
                moments[i] = decay * moments[i] + (1 - decay) * step.grad ** 2;
                step.val -= lr * step.grad / (Math.sqrt(moments[i]) + Number.EPSILON);
            }

            return this;
        },
        minimize(n = 20) {
            const evalExpr = x => {
                for (let i = 0; i < x.length; i++)
                    this.vals[i].val = x[i];
                return this.forward().steps[0].val;
            };

            minimize(x => evalExpr(x), this.vals.map(v => v.val), n);
            return this;
        }
    };
};

const parseExpr = (input, ...inputArgs) => {
    const precedence = op => Object.keys(Op.operatorMap).indexOf(op);
    const addspaces = str => str.replace(/([()+\-*/^]|exp|ln|relu)/g, ' $1 ');
    let [expr, ops, tokens] = [[], [], addspaces(input).trim().split(/\s+/)];
    while (tokens.length > 0) {
        const token = tokens.shift();
        if (token in Op.operatorMap) {
            while (ops.length > 0 && precedence(ops.at(-1)) >= precedence(token))
                expr.push(ops.pop());
            ops.push(token);
        } else if (token === '(') {
            ops.push(token);
        } else if (token === ')') {
            while (ops.length > 0 && ops.at(-1) !== '(')
                expr.push(ops.pop());
            ops.pop();
        } else {
            expr.push(token);
        }
    }

    while (ops.length > 0)
        expr.push(ops.pop());
    let stack = [];
    for (const token of expr) {
        if (token in Op.operatorMap) {
            if (precedence(token) <= precedence('^')) {
                stack.push(Op.operatorMap[token](...[stack.pop(), stack.pop()].reverse()));
            } else {
                stack.push(Op.operatorMap[token](stack.pop()));
            }
        } else if (!isNaN(token)) {
            stack.push(Const(parseFloat(token)));
        } else if (token.startsWith("$")) {
            stack.push(inputArgs[parseInt(token.substring(1)) - 1]);
        }
    }

    return stack[0];
};


// ---- chart ---------------------------------------------------------------------------------------------------------------------------------------

const chart = (data, vars, dataInterval = undefined) => {
    const [CHART_WIDTH, XLABEL_WIDTH, DASH_INTERVAL, DOT_INTERVAL] = [105, 8, 10, 15];
    const calcY = (val, low, high) => Math.round((CHART_WIDTH) * (val - low) / (high - low));
    const replaceCharAt = (str, index, char) => str.substring(0, index) + char + str.substring(index + 1);
    const yScale = () => {
        const numericFmt = d => {
            const [formatted, magnitude] = Object.entries({ 1e9: 'B', 1e6: 'M', 1e3: 'T' }).reduce(([d, magnitude], [threshold, label]) =>
                Math.abs(d) >= threshold ? [d / threshold, label] : [d, magnitude], [d, '']);
            return Number(formatted.toFixed(3)) + magnitude;
        };

        const yScale = [];
        for (const v of vars) {
            let scale = ' '.repeat(XLABEL_WIDTH - 2) + v.symbol + ' ';
            const step = (v.high - v.low) / Math.floor(CHART_WIDTH / DOT_INTERVAL);
            for (let label = v.low; label < v.high + 1; label += step)
                scale += numericFmt(label).padEnd(label >= v.high ? 0 : DOT_INTERVAL);
            yScale.push(scale);
        }

        return yScale.join('\n');
    };

    for (let v of vars) {
        const vals = data.map(tick => tick[v.name]);
        v.low = v.low ?? Math.min(...vals);
        v.high = v.high ?? Math.max(...vals);
    }

    const lines = [];
    for (const [index, tick] of data.entries()) {
        if (dataInterval && index % dataInterval !== 0)
            continue;
        let [line, xLabel] = [' '.repeat(CHART_WIDTH), ' '.repeat(XLABEL_WIDTH)];
        for (let i = 0; i < CHART_WIDTH + 1; i += DOT_INTERVAL)
            line = replaceCharAt(line, i, '.');
        if (lines.length % DASH_INTERVAL === 0) {
            for (let i = 0; i < CHART_WIDTH + 1; i += 2)
                line = replaceCharAt(line, i, '-');
            xLabel = tick.time.toFixed(0).padStart(XLABEL_WIDTH - 1) + '.';
        }

        for (const v of vars) {
            const y = calcY(tick[v.name], v.low, v.high);
            if (y >= 0 && y < CHART_WIDTH + 1)
                line = replaceCharAt(line, y, v.symbol);
        }

        lines.push(xLabel + line);
    }

    return vars.map(v => v.name + '=' + v.symbol).join(',') + '\n\n' + yScale() + '\n' + lines.join('\n');
};


// ---- ranking -------------------------------------------------------------------------------------------------------------------------------------

const getRatings = matches => {
    const multiplyMatrixVector = (A, x) => {
        const resultVector = Array(A.length).fill(0);
        for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < A.length; j++) {
                resultVector[i] += A[j][i] * x[j];
            }
        }

        return resultVector;
    };

    const transposeMatrix = A => A[0].map((_, colIndex) => A.map(row => row[colIndex]));
    const inverseVector = x => x.map(val => 1 / val);
    const normalizeVector = x => {
        const sum = x.reduce((a, b) => a + b, 0);
        return x.map(value => value / sum);
    };

    const gaussSolve = (A, y) => {
        const n = y.length;
        for (let i = 0; i < n; i++) {
            let factor = A[i][i];
            for (let j = i; j < n; j++)
                A[i][j] /= factor;
            y[i] /= factor;
            for (let k = i + 1; k < n; k++) {
                factor = A[k][i];
                for (let j = i; j < n; j++)
                    A[k][j] -= factor * A[i][j];
                y[k] -= factor * y[i];
            }
        }

        const x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            x[i] = y[i];
            for (let j = i + 1; j < n; j++)
                x[i] -= A[i][j] * x[j];
        }

        return x;
    };

    const teams = [...new Set(matches.flatMap(m => [m.homeName, m.awayName]))].toSorted();
    const getIndex = team => teams.indexOf(team);
    const getMassey = () => {
        const createMasseyMatrix = () => {
            const [masseyMatrix, goalDiffs] = [Array.from({ length: teams.length }, () => Array(teams.length).fill(0)), Array(teams.length).fill(0)];
            matches.forEach(({ homeName, homeGoals, awayName, awayGoals }) => {
                const [homeIndex, awayIndex, goalDiff] = [getIndex(homeName), getIndex(awayName), homeGoals - awayGoals];
                masseyMatrix[homeIndex][homeIndex]++, masseyMatrix[awayIndex][awayIndex]++;
                masseyMatrix[homeIndex][awayIndex]--, masseyMatrix[awayIndex][homeIndex]--;
                goalDiffs[homeIndex] += goalDiff, goalDiffs[awayIndex] -= goalDiff;
            });

            masseyMatrix[teams.length - 1].fill(1);
            goalDiffs[teams.length - 1] = 0;
            return { masseyMatrix, goalDiffs };
        };

        const { masseyMatrix, goalDiffs } = createMasseyMatrix();
        return gaussSolve(masseyMatrix, goalDiffs);
    };

    const getColley = () => {
        const createColleyMatrix = matches => {
            const [colleyMatrix, results] = [
                Array.from({ length: teams.length }, (_, i) => Array.from({ length: teams.length }, (_, j) => i === j ? 2 : 0)),
                Array(teams.length).fill(1)
            ];
            matches.forEach(({ homeName, homeGoals, awayName, awayGoals }) => {
                const [homeIndex, awayIndex, result] = [getIndex(homeName), getIndex(awayName), Math.sign(homeGoals - awayGoals)];
                colleyMatrix[homeIndex][homeIndex]++, colleyMatrix[awayIndex][awayIndex]++;
                colleyMatrix[homeIndex][awayIndex]--, colleyMatrix[awayIndex][homeIndex]--;
                if (result === 1) {
                    results[homeIndex] += 0.5, results[awayIndex] -= 0.5;
                } else if (result === -1) {
                    results[homeIndex] -= 0.5, results[awayIndex] += 0.5;
                }
            });

            return { colleyMatrix, results };
        };

        const { colleyMatrix, results } = createColleyMatrix(matches);
        return gaussSolve(colleyMatrix, results);
    };

    const getMarkov = () => {
        const createMarkovMatrix = () => {
            const votesMatrix = Array.from({ length: teams.length }, () => Array(teams.length).fill(0));
            matches.forEach(({ homeName, homeGoals, awayName, awayGoals }) => {
                const [homeIndex, awayIndex, result] = [getIndex(homeName), getIndex(awayName), homeGoals - awayGoals];
                if (result > 0) {
                    votesMatrix[awayIndex][homeIndex] += 1;
                } else if (result < 0) {
                    votesMatrix[homeIndex][awayIndex] += 1;
                }
            });

            const stochasticMatrix = votesMatrix.map(row => {
                const rowSum = row.reduce((a, b) => a + b, 0);
                return rowSum > 0 ? row.map(vote => vote / rowSum) : Array(teams.length).fill(1 / teams.length);
            });

            return stochasticMatrix;
        };

        const powerIteration = (A, iterations = 20) => {
            let rankingVector = Array(A.length).fill(1 / A.length);
            for (let i = 0; i < iterations; i++) {
                rankingVector = normalizeVector(multiplyMatrixVector(A, rankingVector));
            }

            return rankingVector;
        };

        return powerIteration(createMarkovMatrix());
    };

    const getOffenseDefense = () => {
        const createOffenseDefenseMatrix = () => {
            const stochasticMatrix = Array.from({ length: teams.length }, () => Array(teams.length).fill(0));
            matches.forEach(({ homeName, homeGoals, awayName, awayGoals }) => {
                const [homeIndex, awayIndex] = [getIndex(homeName), getIndex(awayName)];
                stochasticMatrix[homeIndex][awayIndex] += homeGoals, stochasticMatrix[awayIndex][homeIndex] += awayGoals;
            });

            return stochasticMatrix;
        };

        const powerIteration = (A, iterations = 20) => {
            let [defense, offense] = [Array(A.length).fill(1), Array(A.length).fill(1)];
            for (let i = 0; i < iterations; i++) {
                offense = multiplyMatrixVector(transposeMatrix(A), inverseVector(defense));
                defense = multiplyMatrixVector(A, inverseVector(offense));
            }

            return offense.map((o, i) => o / defense[i]);
        };

        return powerIteration(createOffenseDefenseMatrix());
    };

    const getElo = (initialRating = 1500, K = 32, KS = 400) => {
        const ratings = Array(teams.length).fill(initialRating);
        const getExpectedScore = (ratingA, ratingB) => 1 / (1 + Math.pow(10, (ratingB - ratingA) / KS));
        const getActualScore = (goalsA, goalsB) => goalsA > goalsB ? 1 : (goalsA === goalsB ? 0.5 : 0);
        matches.forEach(({ homeName, homeGoals, awayName, awayGoals }) => {
            const [homeIndex, awayIndex] = [getIndex(homeName), getIndex(awayName)];
            const [homeRating, awayRating] = [ratings[homeIndex], ratings[awayIndex]];
            const [expectedHome, expectedAway] = [getExpectedScore(homeRating, awayRating), getExpectedScore(awayRating, homeRating)];
            const [actualHome, actualAway] = [getActualScore(homeGoals, awayGoals), getActualScore(awayGoals, homeGoals)];
            ratings[homeIndex] = homeRating + K * (actualHome - expectedHome), ratings[awayIndex] = awayRating + K * (actualAway - expectedAway);
        });

        return ratings.map(x => x - initialRating);
    };

    const ratings = {
        'massey': getMassey(),
        'colley': getColley(),
        'markov': getMarkov(),
        'od': getOffenseDefense(),
        'elo': getElo(),
    };

    return { teams, ...ratings };
};


// ---- rols ----------------------------------------------------------------------------------------------------------------------------------------

const ROLS = (featuresNo, lambda = 1, halflife = 14) => {
    const beta = Math.exp(Math.log(0.5) / halflife);
    let weights = Array(featuresNo).fill(0);
    let p = Array.from({ length: featuresNo }, (_, i) => Array.from({ length: featuresNo }, (_, j) => i === j ? lambda : 0));
    const predict = x => {
        return x.reduce((sum, xi, i) => sum + weights[i] * xi, 0);
    };

    const update = (x, y) => {
        const err = y - predict(x);
        let px = Array(weights.length).fill(0);
        for (let i = 0; i < weights.length; i++)
            for (let j = 0; j < weights.length; j++)
                px[i] += p[i][j] * x[j];
        const xpx = weights.reduce((sum, _, i) => sum + x[i] * px[i], 0);
        const k = px.map(p => p / (beta + xpx));
        weights = weights.map((w, i) => w + k[i] * err);
        for (let i = 0; i < weights.length; i++)
            for (let j = 0; j < weights.length; j++)
                p[i][j] = (p[i][j] - k[i] * px[j]) / beta;
    };

    return { predict, update };
};


// ---- fret ----------------------------------------------------------------------------------------------------------------------------------------

const fret = (data, horizon = 7) => {
	let n = data.length;
	const getLayers = () => {
		const distances = Array.from({ length: n + 2 }, (_, i) => Array.from({ length: n + 2 }, (_, j) => i > 0 && j > 0 && i <= n && j <= n
			? Math.abs(data[i - 1] - data[j - 1]) : NaN
		));
		const layers = Array.from({ length: n - 2 }, (_, i) => Array.from({ length: n - 2 }, (_, j) => {
			const weights = [1, 2, 4, 128, 0, 8, 64, 32, 16], offsets = [0, 1, 2];
			const window = offsets.flatMap(dj => offsets.map(di => distances[i + di + 1][j + dj + 1]));
			return weights.reduce((sum, weight, index) =>
				sum + weight * (window[index] >= window[4] ? 1 : 0), 0
			);
		}));
		return layers.map(row => row.map(val => {
			const thresholds = [42.5, 85.5, 127.5, 170.5, 212.5];
			const index = thresholds.findIndex(thresh => val <= thresh);
			return index !== -1 ? index + 1 : thresholds.length + 1;
		}));
	};
	
	const getArchetypes = layers => {
		const thresholds = Array.from({ length: 40 }, (_, i) => 0.61 + 0.01 * i);
		const prior = layers.slice(0, layers.length - 1);
		const similarities = prior.map(row => row.reduce((sum, val, index) =>
			sum + (val === layers[layers.length - 1][index] ? 1 : 0), 0) / row.length
		);
		const similaritiesByThreshold = thresholds.map(threshold => similarities.map((val, index) => val >= threshold
			? index : -1
		).filter(index => index !== -1));
		const filteredByIndex = similaritiesByThreshold.map(indices => indices.filter(index => index < n - horizon - 3));
		const filteredByLength = filteredByIndex.filter(indices => indices.length >= 3);
		const archetypes = filteredByLength.at(-1);
		if (!archetypes) {
			throw new Error("No suitable archetypes found.");
		} else {
			return archetypes;
		}
	};
	
	const getForecast = archetypes => {
		return Array.from({ length: horizon }, (_, index) => archetypes.reduce((sum, archetype) =>
			sum + (data[archetype + index + 3] ?? 0), 0) / archetypes.length
		);
	};

	const layers = getLayers();
	const archetypes = getArchetypes(layers);
	return getForecast(archetypes);	
};


// ---- gbt -----------------------------------------------------------------------------------------------------------------------------------------

const GBT = (params = {}) => {
    const tree = params => {
        const nodes = Array(2 ** (params.maxDepth + 1) - 1).fill(null);
        const build = (samples, grad, shrinkageRate, depth = 0, id = 0) => {
            const splitGain = (G, H, Gl, Hl) => {
                const calcTerm = (g, h) => (g ** 2) / (h + 1);
                return calcTerm(Gl, Hl) + calcTerm(G - Gl, H - Hl) - calcTerm(G, H);
            };

            const leafWeight = g => g.reduce((a, b) => a + b, 0) / (2 * g.length + 1);
            if (depth >= params.maxDepth) {
                nodes[id] = { weight: leafWeight(grad) * shrinkageRate };
                return;
            }

            const G = grad.reduce((a, b) => a + b, 0);
            const H = 2 * grad.length;
            let best = { gain: 0 };
            samples[0].forEach((_, featureId) => {
                let Gl = 0, Hl = 0;
                const sortedSamples = samples.map((s, idx) => [s[featureId], idx]).sort((a, b) => a[0] - b[0]);
                sortedSamples.forEach(([_, sampleId], j) => {
                    Gl += grad[sampleId];
                    Hl += 2;
                    const currentGain = splitGain(G, H, Gl, Hl);
                    if (currentGain > best.gain) {
                        best = {
                            gain: currentGain,
                            featureId,
                            value: samples[sampleId][featureId],
                            lSampleIds: sortedSamples.slice(0, j + 1).map(s => s[1]),
                            rSampleIds: sortedSamples.slice(j + 1).map(s => s[1])
                        };
                    }
                });
            });

            if (best.gain < params.minSplitGain) {
                nodes[id] = { weight: leafWeight(grad) * shrinkageRate };
            } else {
                nodes[id] = { splitFeatureId: best.featureId, splitValue: best.value };
                build(samples.filter((_, idx) => best.lSampleIds.includes(idx)), grad.filter((_, idx) => best.lSampleIds.includes(idx)), shrinkageRate, depth + 1, 2 * id + 1);
                build(samples.filter((_, idx) => best.rSampleIds.includes(idx)), grad.filter((_, idx) => best.rSampleIds.includes(idx)), shrinkageRate, depth + 1, 2 * id + 2);
            }
        };

        const predict = (x, id = 0) => {
            if (2 * id + 1 >= nodes.length || (!nodes[2 * id + 1] && !nodes[2 * id + 2])) {
                return nodes[id].weight;
            } else {
                return x[nodes[id].splitFeatureId] <= nodes[id].splitValue
                    ? predict(x, 2 * id + 1)
                    : predict(x, 2 * id + 2);
            }
        };

        return { build, predict };
    }

    params = { minSplitGain: 0.1, maxDepth: 4, learningRate: 0.3, ...params };
    let trees = [];
    const train = (X, y, numBoostRound = 20, evalSet = null, earlyStoppingRounds = 5) => {
        const forward = X => {
            if (trees.length === 0) return null;
            return X.map(x => predict(x));
        };

        const gradient = (y, predictions) => {
            if (!predictions) {
                predictions = y.map(() => Math.random() * (Math.max(...y) - Math.min(...y)) + Math.min(...y));
            }

            return y.map((yi, i) => 2 * (yi - predictions[i]));
        };

        const loss = (X, y) => {
            const errors = X.map((x, i) => y[i] - predict(x));
            return errors.reduce((a, b) => a + b ** 2, 0) / errors.length;
        };

        let bestEvalLoss = Number.MAX_SAFE_INTEGER, bestRound = null;
        for (let round = 0; round < numBoostRound; round++) {
            const roundStartTime = Date.now();
            const grad = gradient(y, forward(X));
            const roundTree = tree(params);
            roundTree.build(X, grad, round > 0 ? params.learningRate : 1);
            trees.push(roundTree);

            const trainLoss = loss(X, y);
            const evalLoss = evalSet ? loss(evalSet[0], evalSet[1]) : null;
            console.log(`Round ${round}, Train's L2: ${trainLoss}, Eval's L2: ${evalLoss || '-'}, Elapsed: ${(Date.now() - roundStartTime) / 1000} secs`);
            if (evalLoss !== null && evalLoss < bestEvalLoss) {
                bestEvalLoss = evalLoss;
                bestRound = round;
            }

            if (round - bestRound >= earlyStoppingRounds) {
                break;
            }
        }

        if (bestRound !== null) {
            trees = trees.slice(0, bestRound + 1);
        }
    };

    const predict = x => trees.reduce((sum, tree) => sum + tree.predict(x), 0);
    return { train, predict };
};


// ---- minimize ------------------------------------------------------------------------------------------------------------------------------------

const minimize = (f, x, n = 20) => {
    const replace = (array, index, value) => [...array.slice(0, index), value, ...array.slice(index + 1)];
    const linear = (f, a = -100, c = 100, tol = 0.01) => {
        const split = (a, c) => a + ((Math.sqrt(5) - 1) / 2) * (c - a);
        let b = split(a, c);
        let fb = f(b);
        while (Math.abs(a - c) > tol) {
            const x = split(a, b);
            const fx = f(x);
            if (fx < fb)
                [b, fb, c] = [x, fx, b];
            else
                [a, c] = [c, x];
        }

        return b;
    }

    for (let generation = 0; generation < n; generation++) {
        for (let i of Array.from({ length: x.length }, (_, i) => [Math.random(), i]).sort(([a], [b]) => a - b).map(([_, i]) => i))
            x = replace(x, i, linear(xi => f(replace(x, i, xi))));
    }

    return x;
}

// ---- harmony -------------------------------------------------------------------------------------------------------------------------------------

const harmony = (f, x, options = {}) => {
    const {
        generationsNo = 3000,
        crossoverRatio = 0.9,
        mutationRatio = 0.3,
        poolSize = 30,
        gamma = 0.01
    } = options;
    const random = (low = 0, high = 1) => (high - low) * Math.random() + low;
    const creator = () => x.map(x => random(x - 4, x + 4));
    const mutator = g => g.map(x => x + random(-gamma, gamma));
    const sanitize = e => isNaN(e)? Number.MAX_SAFE_INTEGER : e;
    let pool = Array.from({ length: poolSize }, creator);
    let errors = pool.map(f).map(sanitize);
    const getWorstIndex = () => errors.indexOf(Math.max(...errors));
    const getRandomIndex = () => Math.floor(random() * pool.length);
    for (let i = 0; i < generationsNo; i++) {
        let candidate = creator();
        for (let j = 0; j < candidate.length; j++) {
            if (random() < crossoverRatio) {
                candidate[j] = pool[getRandomIndex()][j];
                if (random() < mutationRatio) {
                    candidate[j] = mutator(candidate)[j];
                }
            }
        }

        let candidateError = sanitize(f(candidate));
        const worstIndex = getWorstIndex();
        if (errors[worstIndex] > candidateError) {
            pool[worstIndex] = candidate;
            errors[worstIndex] = candidateError;
        }
    }

    return pool[errors.indexOf(Math.min(...errors))];
};

// ---- table ---------------------------------------------------------------------------------------------------------------------------------------

const normalDistribution = (length, mean, stdDev) => {
    return Array.from({ length: length }, (_, i) => (i - mean) / stdDev).map(x => {
        return Math.exp(-0.5 * x ** 2) / (stdDev * Math.sqrt(2 * Math.PI));
    });
};

const poissonDistribution = (length, lambda) => {
    const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);
    return Array.from({ length }, (_, k) => (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k));
};

const rescale = (table, min = 0, max = 1) => {
    const [minValue, maxValue] = [Math.min(...table), Math.max(...table)];
    return table.map(value => min + (max - min) * (value - minValue) / (maxValue - minValue));
};

const normalize = (table, targetSum = 1) => {
    const sum = table.reduce((acc, value) => acc + value, 0);
    return table.map(value => (value / sum) * targetSum);
};

const table = (index, values, start, end) => {
    const normal = Math.min(1, Math.max(0, (index - start) / (end - start))) * (values.length - 1);
    const lowerIndex = Math.floor(normal);
    return values[lowerIndex] + (normal - lowerIndex) * (values[Math.min(lowerIndex + 1, values.length - 1)] - values[lowerIndex]);
};


// ---- dynamo --------------------------------------------------------------------------------------------------------------------------------------

const smooth = (tickFn, factor) => {
    let k = undefined;
    return (dt = 1, t) => {
        k = factor * tickFn(dt, t) + (1 - factor) * (k ?? tickFn(dt, t));
        return k;
    }
};

const Dynamo = () => {
    return {
        levels: [], rates: [],
        level(initVal, tickFn, name = undefined) { // depends on j
            return this.levels[this.levels.length] = { j: initVal, k: initVal, name, tickFn };
        },
        rate(tickFn, name = undefined) { // depends on k
            return this.rates[this.rates.length] = { jk: 0, name, tickFn };
        },
        tick(dt = 1, t) {
            this.levels.forEach(l => l.k = l.tickFn(dt, t));
            this.rates.map(r => r.tickFn()).forEach((kl, index) => this.rates[index].jk = kl);
            this.levels.forEach(l => l.j = l.k);
            return this.levels.filter(l => l.name).reduce((acc, l) => ({ ...acc, [l.name]: l.k }), {});
        },
        run(generationsNo = 20, dt = 1) {
            const ticks = Array.from({ length: generationsNo }, (_, i) => ({ time: i, ...this.tick(dt, i * dt) }));
            return Object.assign(ticks, {
                chart(vars, dataInterval = undefined) {
                    return chart(ticks, vars, dataInterval);
                },
                rmse(data, target) {
                    return Math.sqrt(ticks.map(t => Math.pow(t[data] - t[target], 2) / ticks.length).reduce((sum, err) => sum + err, 0));
                }
            });
        },
        external(array, name = undefined) {
            return Object.assign(this.level(array[0], (_, t) => table(t, array, 0, array.length), name), {
                length: array.length
            });
        },
    };
};
