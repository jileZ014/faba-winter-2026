const os = require('os');
const path = require('path');
const fs = require('fs');
const https = require('https');

const configDir = process.platform === 'win32'
    ? path.join(process.env.APPDATA || '', 'firebase')
    : path.join(os.homedir(), '.config', 'firebase');
const configPath = path.join(configDir, 'config.json');
let refreshToken = null;
try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    refreshToken = config.tokens && config.tokens.refresh_token;
} catch (e) {}

async function getToken() {
    return new Promise((resolve, reject) => {
        const data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
            client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi'
        }).toString();
        const req = https.request({
            hostname: 'oauth2.googleapis.com', port: 443, path: '/token', method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body).access_token));
        });
        req.write(data);
        req.end();
    });
}

async function verify() {
    const token = await getToken();
    const query = { structuredQuery: { from: [{ collectionId: 'games' }], where: { fieldFilter: { field: { fieldPath: 'division' }, op: 'EQUAL', value: { stringValue: '10U (5th)' } } } } };

    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'firestore.googleapis.com', port: 443,
            path: '/v1/projects/faba-winter-2026/databases/(default)/documents:runQuery',
            method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const result = JSON.parse(data);
                console.log('\n=== 10U GAMES VERIFICATION ===\n');
                console.log('Found ' + result.length + ' results');
                for (const item of result) {
                    if (!item.document) {
                        console.log('Skipping item without document');
                        continue;
                    }
                    const f = item.document.fields;
                    const type = f.gameType ? f.gameType.stringValue : '';
                    const home = f.homeTeamName ? f.homeTeamName.stringValue : 'TBD';
                    const away = f.awayTeamName ? f.awayTeamName.stringValue : 'TBD';
                    const hs = f.homeScore ? (f.homeScore.integerValue || '0') : '0';
                    const as = f.awayScore ? (f.awayScore.integerValue || '0') : '0';
                    const status = f.status ? f.status.stringValue : '';
                    const time = f.time ? f.time.stringValue : '';
                    console.log(time + ' | ' + type + ': ' + home + ' ' + hs + ' - ' + away + ' ' + as + ' [' + status + ']');
                }
                resolve();
            });
        });
        req.write(JSON.stringify(query));
        req.end();
    });
}
verify();
