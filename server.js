const express = require('express');
const app = express();
const {
    metacall_inspect,
} = require('metacall');
const fs = require('fs');
const path = require('path');

// Initialize scripts from file
const load = new Promise((resolve, reject) => {
    const scriptsPath = path.join(__dirname, 'scripts');

    fs.readdir(scriptsPath, (err, files) => {
        if (err) {
            reject(err);
        }

        // All functions will be stored here
        let functions = {};

        files.forEach(file => {
            try {
                console.log('Loading...', file);
                // This imports the scripts (Python, Ruby, C#...)
                const handle = require(path.join(scriptsPath, file));
                functions = { ...functions, ...handle };
            } catch (ex) {
                reject(ex);
            }
        });

        resolve(functions);
    });
});

// Start the server
const start = (functions) => {
    app.use(express.json());

    app.get('/inspect', (req, res) => {
        res.send(metacall_inspect());
    });

    app.post('/call/:name', (req, res) => {
        if (!req.params.name) {
            return res.status(400).send('A function name is required in the path; i.e: /call/sum.');
        }

        if (!Array.isArray(req.body)) {
            return res.status(401).send('Invalid function parameters, the request body must be an array; i.e [3, 5].');
        }

        if (!(req.params.name && functions[req.params.name])) {
            return res.status(404).send(`Function ${req.params.name} not found.`);
        }

        res.send(JSON.stringify(functions[req.params.name](...req.body)));
    });

    return app.listen(3051, () => {
        console.log('Server listening...');
    });
};

module.exports = (() => {
    let server = null;

    // Load scripts and start the server
    load.then((functions) => { server = start(functions); }).catch(console.error);

    // Export a close function to gracefully exit from the server
    return {
        close: () => { console.log('Closing server...'); server && server.close(); },
    };
})();
