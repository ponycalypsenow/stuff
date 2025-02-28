const http = require('http');
const vm = require('vm');
const fs = require('fs');
const { URL } = require('url');

// Create a persistent sandbox (a long‐running kernel).
const sandbox = { chartData: null };
sandbox.plot = function(data) {
  // When a cell calls plot(), store the chart data in the sandbox.
  sandbox.chartData = data;
  return data;
};
vm.createContext(sandbox);

const server = http.createServer((req, res) => {
  // Only allow local connections.
  const remoteAddress = req.connection.remoteAddress;
  if (remoteAddress !== '::1' && remoteAddress !== '127.0.0.1') {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access denied');
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  
  if (req.method === 'GET') {
    if (parsedUrl.pathname === '/') {
      // Serve the notebook HTML page.
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Node.js Notebook</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #notebook-controls { margin-bottom: 15px; }
    #notebook-controls input { width: 300px; padding: 5px; }
    #notebook-controls button { margin-left: 5px; }
    .cell { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; position: relative; }
    .cell textarea { width: 100%; height: 100px; font-family: monospace; }
    .cell-output { background: #f9f9f9; padding: 10px; margin-top: 5px; white-space: pre-wrap; }
    .cell-buttons { margin-top: 5px; }
    .delete-cell { position: absolute; top: 5px; right: 5px; }
  </style>
</head>
<body>
  <div id="notebook-controls">
    <input type="text" id="filename" placeholder="Filename (e.g., notebook.json)" />
    <button id="save-notebook">Save Notebook</button>
    <button id="load-notebook">Load Notebook</button>
  </div>
  <div id="notebook"></div>
  <button id="add-cell">Add Cell</button>
  <script>
    let runCount = 1; // Global execution counter

    // Create a new cell element. Optionally pass initialCode to prefill the textarea.
    function createCell(initialCode = '') {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.innerHTML = \`
        <button class="delete-cell">Delete Cell</button>
        <textarea placeholder="Enter Node.js code here"></textarea>
        <div class="cell-buttons">
          <button class="run-cell">Run Cell</button>
        </div>
        <div class="cell-output"></div>
      \`;
      const textarea = cell.querySelector('textarea');
      textarea.value = initialCode;
      
      // Enable Tab indentation in the textarea.
      textarea.addEventListener("keydown", function(e) {
        if (e.key === "Tab") {
          e.preventDefault();
          const start = this.selectionStart;
          const end = this.selectionEnd;
          this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
          this.selectionStart = this.selectionEnd = start + 1;
        }
      });
      
      // Run the cell when the "Run Cell" button is clicked.
      cell.querySelector('.run-cell').addEventListener('click', () => {
        runCell(cell);
      });
      // Remove the cell when the "Delete Cell" button is clicked.
      cell.querySelector('.delete-cell').addEventListener('click', () => {
        cell.remove();
      });
      return cell;
    }

    // Run the code in a cell by sending it to the server.
    function runCell(cell) {
      const code = cell.querySelector('textarea').value;
      fetch('/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      })
      .then(response => response.json())
      .then(data => {
        const outputDiv = cell.querySelector('.cell-output');
        // Replace previous output with new output and run number.
        outputDiv.innerHTML = '[' + runCount + '] > ' + code + '\\n' + JSON.stringify(data.result) + '\\n';
        runCount++;
        if(data.chart) {
          // If chart data is returned, create a canvas and draw the line chart.
          const canvas = document.createElement('canvas');
          canvas.width = 500;
          canvas.height = 300;
          outputDiv.appendChild(canvas);
          drawChart(canvas, data.chart);
        }
      });
    }

    // Draw a simple line chart in the given canvas.
    function drawChart(canvas, data) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const step = canvas.width / (data.length - 1);
      const max = Math.max(...data);
      const min = Math.min(...data);
      for (let i = 0; i < data.length; i++) {
        const x = i * step;
        const y = canvas.height - ((data[i] - min) / (max - min)) * canvas.height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Save the current notebook (all cell codes) to the server.
    function saveNotebook() {
      const filename = document.getElementById('filename').value.trim();
      if (!filename) {
        alert('Please enter a filename.');
        return;
      }
      const cells = [];
      document.querySelectorAll('#notebook .cell textarea').forEach(textarea => {
        cells.push(textarea.value);
      });
      fetch('/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filename, cells: cells })
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
      });
    }

    // Load a notebook from the server and replace the current cells.
    function loadNotebook() {
      const filename = document.getElementById('filename').value.trim();
      if (!filename) {
        alert('Please enter a filename.');
        return;
      }
      fetch('/load?filename=' + encodeURIComponent(filename))
      .then(response => response.json())
      .then(data => {
        if(data.error) {
          alert(data.error);
          return;
        }
        // Clear current cells.
        const notebook = document.getElementById('notebook');
        notebook.innerHTML = '';
        // Create new cells with the loaded code.
        data.cells.forEach(code => {
          notebook.appendChild(createCell(code));
        });
      });
    }

    // Initialize notebook with one empty cell.
    const notebook = document.getElementById('notebook');
    notebook.appendChild(createCell());

    // Button to add a new cell.
    document.getElementById('add-cell').addEventListener('click', () => {
      notebook.appendChild(createCell());
    });

    // Button to save the notebook.
    document.getElementById('save-notebook').addEventListener('click', saveNotebook);
    // Button to load a notebook.
    document.getElementById('load-notebook').addEventListener('click', loadNotebook);
  </script>
</body>
</html>`);
    } else if (parsedUrl.pathname === '/load') {
      // Load a notebook file. Expect a query parameter "filename".
      const filename = parsedUrl.searchParams.get('filename');
      if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing filename parameter' }));
        return;
      }
      fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Error reading file: ' + err.message }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } else if (req.method === 'POST') {
    if (parsedUrl.pathname === '/eval') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        let code;
        try {
          code = JSON.parse(body).code;
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ result: 'Invalid JSON' }));
          return;
        }
        try {
          // Run the code in the persistent sandbox so state persists across cells.
          let result = vm.runInContext(code, sandbox);
          let responseObj = { result: result };
          if (sandbox.chartData) {
            responseObj.chart = sandbox.chartData;
            // Clear chart data after using it.
            sandbox.chartData = null;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(responseObj));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ result: e.toString() }));
        }
      });
    } else if (parsedUrl.pathname === '/save') {
      // Save a notebook. Expect JSON body with { filename: string, cells: array of strings }.
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }
        if (!data.filename || !Array.isArray(data.cells)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing filename or cells' }));
          return;
        }
        // Write the notebook (cells array) as JSON.
        fs.writeFile(data.filename, JSON.stringify({ cells: data.cells }, null, 2), 'utf8', (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error saving file: ' + err.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Notebook saved successfully' }));
          }
        });
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method not allowed');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server running at http://localhost:3000/');
});
