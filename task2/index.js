const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

async function initDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, '[]');
    }
}

async function readUsers() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeUsers(users) {
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

async function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        if (req.method === 'GET' && req.url === '/users') {
            const users = await readUsers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
            return;
        }

        if (req.method === 'POST' && req.url === '/users') {
            const users = await readUsers();
            const newUser = await parseBody(req);
            
            if (!newUser.name || !newUser.email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Name and email are required' }));
                return;
            }

            newUser.id = Date.now().toString();
            users.push(newUser);
            await writeUsers(users);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
            return;
        }

        if (req.method === 'DELETE' && req.url.startsWith('/users/')) {
            const id = req.url.split('/')[2];
            const users = await readUsers();
            const userIndex = users.findIndex(user => user.id === id);

            if (userIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User not found' }));
                return;
            }

            users.splice(userIndex, 1);
            await writeUsers(users);

            res.writeHead(204);
            res.end();
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));

    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
});

initDataFile()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    });