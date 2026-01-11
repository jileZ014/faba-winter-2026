/**
 * COTB26 10U Data Reset Script
 * Resets all 10U games and standings to initial state
 */

const os = require('os');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Firebase CLI stores tokens in different locations depending on OS
const configDir = process.platform === 'win32'
    ? path.join(process.env.APPDATA || '', 'firebase')
    : path.join(os.homedir(), '.config', 'firebase');

const configPath = path.join(configDir, 'config.json');

let refreshToken = null;

try {
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.tokens && config.tokens.refresh_token) {
            refreshToken = config.tokens.refresh_token;
            console.log('Found Firebase CLI refresh token');
        }
    }
} catch (e) {
    console.log('Could not read Firebase CLI config:', e.message);
}

// Alternative: Check for configstore location
if (!refreshToken) {
    const configstorePath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    try {
        if (fs.existsSync(configstorePath)) {
            const config = JSON.parse(fs.readFileSync(configstorePath, 'utf8'));
            if (config.tokens && config.tokens.refresh_token) {
                refreshToken = config.tokens.refresh_token;
            } else if (config.user && config.user.tokens && config.user.tokens.refresh_token) {
                refreshToken = config.user.tokens.refresh_token;
            }
        }
    } catch (e) {}
}

if (!refreshToken) {
    console.error('Could not find Firebase CLI credentials. Please run: firebase login');
    process.exit(1);
}

async function getAccessToken() {
    return new Promise((resolve, reject) => {
        const data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
            client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi'
        }).toString();

        const options = {
            hostname: 'oauth2.googleapis.com',
            port: 443,
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const tokens = JSON.parse(body);
                    if (tokens.access_token) {
                        resolve(tokens.access_token);
                    } else {
                        reject(new Error('No access token in response'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function firestoreRequest(accessToken, method, path, body = null) {
    const projectId = 'faba-winter-2026';
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'firestore.googleapis.com',
            port: 443,
            path: '/v1/projects/' + projectId + '/databases/(default)/documents' + path,
            method: method,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.error?.message || 'HTTP ' + res.statusCode));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({});
                    } else {
                        reject(new Error('HTTP ' + res.statusCode + ': ' + data));
                    }
                }
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

function toFirestoreValue(value) {
    if (value === null || value === undefined) {
        return { nullValue: null };
    } else if (typeof value === 'string') {
        return { stringValue: value };
    } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
            return { integerValue: value.toString() };
        }
        return { doubleValue: value };
    } else if (typeof value === 'boolean') {
        return { booleanValue: value };
    }
    return { stringValue: String(value) };
}

async function reset10UData(accessToken) {
    console.log('\n========================================');
    console.log('COTB26 10U Data Reset');
    console.log('========================================\n');

    // Query all games
    console.log('Fetching all games...');
    const gamesQuery = {
        structuredQuery: {
            from: [{ collectionId: 'games' }],
            where: {
                fieldFilter: {
                    field: { fieldPath: 'division' },
                    op: 'EQUAL',
                    value: { stringValue: '10U (5th)' }
                }
            }
        }
    };

    const gamesResult = await firestoreRequest(accessToken, 'POST', ':runQuery', gamesQuery);

    console.log('Found ' + gamesResult.length + ' 10U games\n');

    // Reset each game
    for (const item of gamesResult) {
        if (!item.document) continue;

        const docPath = item.document.name;
        const fields = item.document.fields || {};
        const gameType = fields.gameType?.stringValue || '';
        const homeTeam = fields.homeTeamName?.stringValue || fields.homeTeam?.stringValue || 'TBD';
        const awayTeam = fields.awayTeamName?.stringValue || fields.awayTeam?.stringValue || 'TBD';
        const time = fields.time?.stringValue || '';

        console.log('Game: ' + homeTeam + ' vs ' + awayTeam + ' (' + gameType + ') @ ' + time);

        // Build update mask and fields based on game type
        let updateFields = {};
        let updateMask = [];

        if (gameType === 'Pool Play') {
            updateFields = {
                homeScore: toFirestoreValue(0),
                awayScore: toFirestoreValue(0),
                status: toFirestoreValue('scheduled')
            };
            updateMask = ['homeScore', 'awayScore', 'status'];
            console.log('  -> Reset to scheduled, 0-0');
        } else if (gameType === 'Bracket' || gameType === 'Championship') {
            updateFields = {
                homeTeam: toFirestoreValue('TBD'),
                homeTeamName: toFirestoreValue('TBD'),
                awayTeam: toFirestoreValue('TBD'),
                awayTeamName: toFirestoreValue('TBD'),
                homeScore: toFirestoreValue(0),
                awayScore: toFirestoreValue(0),
                status: toFirestoreValue('scheduled')
            };
            updateMask = ['homeTeam', 'homeTeamName', 'awayTeam', 'awayTeamName', 'homeScore', 'awayScore', 'status'];
            console.log('  -> Reset to TBD vs TBD, scheduled');
        }

        // Extract document ID from path
        const docId = docPath.split('/').pop();
        const updatePath = '/games/' + docId + '?updateMask.fieldPaths=' + updateMask.join('&updateMask.fieldPaths=');

        await firestoreRequest(accessToken, 'PATCH', updatePath, { fields: updateFields });
    }

    // Reset teams
    console.log('\nResetting 10U team standings...');
    const teamsQuery = {
        structuredQuery: {
            from: [{ collectionId: 'teams' }],
            where: {
                fieldFilter: {
                    field: { fieldPath: 'division' },
                    op: 'EQUAL',
                    value: { stringValue: '10U (5th)' }
                }
            }
        }
    };

    const teamsResult = await firestoreRequest(accessToken, 'POST', ':runQuery', teamsQuery);

    for (const item of teamsResult) {
        if (!item.document) continue;

        const docPath = item.document.name;
        const fields = item.document.fields || {};
        const teamName = fields.name?.stringValue || 'Unknown';

        const updateFields = {
            wins: toFirestoreValue(0),
            losses: toFirestoreValue(0),
            pointsFor: toFirestoreValue(0),
            pointsAgainst: toFirestoreValue(0)
        };
        const updateMask = ['wins', 'losses', 'pointsFor', 'pointsAgainst'];

        const docId = docPath.split('/').pop();
        const updatePath = '/teams/' + docId + '?updateMask.fieldPaths=' + updateMask.join('&updateMask.fieldPaths=');

        await firestoreRequest(accessToken, 'PATCH', updatePath, { fields: updateFields });
        console.log('  Reset ' + teamName + ': 0-0, PF: 0, PA: 0');
    }

    console.log('\n========================================');
    console.log('10U DATA RESET COMPLETE!');
    console.log('========================================');
}

async function main() {
    try {
        console.log('Getting access token...');
        const accessToken = await getAccessToken();
        console.log('Access token obtained!\n');
        await reset10UData(accessToken);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
