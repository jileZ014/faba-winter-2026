/**
 * COTB26 Data Import Script
 * Uses firebase-tools programmatically with CLI authentication
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Get the refresh token from Firebase CLI config
const os = require('os');
const path = require('path');
const fs = require('fs');

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
                console.log('Found Firebase CLI refresh token (configstore)');
            } else if (config.user && config.user.tokens && config.user.tokens.refresh_token) {
                refreshToken = config.user.tokens.refresh_token;
                console.log('Found Firebase CLI refresh token (user.tokens)');
            }
        }
    } catch (e) {
        console.log('Could not read configstore:', e.message);
    }
}

// Windows-specific path
if (!refreshToken && process.platform === 'win32') {
    const windowsPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    try {
        if (fs.existsSync(windowsPath)) {
            const config = JSON.parse(fs.readFileSync(windowsPath, 'utf8'));
            refreshToken = config?.tokens?.refresh_token || config?.user?.tokens?.refresh_token;
            if (refreshToken) {
                console.log('Found Firebase CLI refresh token (Windows)');
            }
        }
    } catch (e) {
        // Ignore
    }
}

if (!refreshToken) {
    console.error('Could not find Firebase CLI credentials.');
    console.error('Please run: firebase login');
    process.exit(1);
}

// Initialize Firebase Admin with refresh token
const { GoogleAuth } = require('google-auth-library');

async function initializeWithRefreshToken() {
    // Use REST API approach with the refresh token
    const https = require('https');

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

// Teams data
const teams = [
    { name: "Wolves", division: "10U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "ReZ Fire", division: "10U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Rug Rats", division: "10U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Star Status", division: "11U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "ReZ Fire", division: "11U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Wolves", division: "11U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "WBA", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Tigers", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Flight 12's", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Bomb Squad", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "WBA", division: "13U (7th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Barbarians", division: "13U (7th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Flight 13's", division: "13U (7th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Flight 14's", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Mind over Matter", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "WBA", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Warriors", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Tigers", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 }
];

// Games data
const games = [
    { gameNumber: 1, time: "8:00 AM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Pool Play", homeTeam: "Wolves", awayTeam: "ReZ Fire", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:00:00') },
    { gameNumber: 2, time: "8:45 AM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Pool Play", homeTeam: "Star Status", awayTeam: "ReZ Fire", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:45:00') },
    { gameNumber: 3, time: "9:30 AM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Pool Play", homeTeam: "ReZ Fire", awayTeam: "Rug Rats", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T09:30:00') },
    { gameNumber: 4, time: "10:15 AM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Pool Play", homeTeam: "Star Status", awayTeam: "Wolves", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T10:15:00') },
    { gameNumber: 5, time: "11:00 AM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:00:00') },
    { gameNumber: 6, time: "11:45 AM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:45:00') },
    { gameNumber: 7, time: "12:30 PM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T12:30:00') },
    { gameNumber: 8, time: "1:15 PM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T13:15:00') },
    { gameNumber: 9, time: "2:00 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Tigers", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:00:00') },
    { gameNumber: 10, time: "2:45 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Pool Play", homeTeam: "Flight 12's", awayTeam: "Bomb Squad", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:45:00') },
    { gameNumber: 11, time: "3:30 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T15:30:00') },
    { gameNumber: 12, time: "4:15 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T16:15:00') },
    { gameNumber: 13, time: "5:00 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T17:00:00') },
    { gameNumber: 14, time: "8:00 AM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Pool Play", homeTeam: "Flight 14's", awayTeam: "Mind over Matter", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:00:00') },
    { gameNumber: 15, time: "8:45 AM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Barbarians", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:45:00') },
    { gameNumber: 16, time: "9:30 AM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Warriors", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T09:30:00') },
    { gameNumber: 17, time: "10:15 AM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Flight 13's", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T10:15:00') },
    { gameNumber: 18, time: "11:00 AM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Pool Play", homeTeam: "Tigers", awayTeam: "Warriors", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:00:00') },
    { gameNumber: 19, time: "11:45 AM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:45:00') },
    { gameNumber: 20, time: "12:30 PM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T12:30:00') },
    { gameNumber: 21, time: "1:15 PM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T13:15:00') },
    { gameNumber: 22, time: "2:00 PM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:00:00') },
    { gameNumber: 23, time: "2:45 PM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:45:00') }
];

async function importWithREST(accessToken) {
    const https = require('https');
    const projectId = 'faba-winter-2026';

    console.log('\n========================================');
    console.log('COTB26 Data Import Starting...');
    console.log('========================================\n');

    // Helper function to make Firestore REST API calls
    function firestoreRequest(method, path, body = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'firestore.googleapis.com',
                port: 443,
                path: `/v1/projects/${projectId}/databases/(default)/documents${path}`,
                method: method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
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
                            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
                        }
                    } catch (e) {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({});
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
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

    // Convert JS value to Firestore value format
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
        } else if (value instanceof Date) {
            return { timestampValue: value.toISOString() };
        } else if (Array.isArray(value)) {
            return { arrayValue: { values: value.map(toFirestoreValue) } };
        } else if (typeof value === 'object') {
            const fields = {};
            for (const [k, v] of Object.entries(value)) {
                fields[k] = toFirestoreValue(v);
            }
            return { mapValue: { fields } };
        }
        return { stringValue: String(value) };
    }

    // Create a document
    async function createDocument(collection, data) {
        const fields = {};
        for (const [key, value] of Object.entries(data)) {
            fields[key] = toFirestoreValue(value);
        }
        // Add createdAt timestamp
        fields.createdAt = { timestampValue: new Date().toISOString() };

        const result = await firestoreRequest('POST', `/${collection}`, { fields });
        return result;
    }

    // Import teams
    console.log('Importing 18 teams...');
    let teamCount = 0;
    for (const team of teams) {
        try {
            await createDocument('teams', team);
            teamCount++;
            console.log(`  ✓ ${team.name} (${team.division})`);
        } catch (error) {
            console.error(`  ✗ Failed to add ${team.name}: ${error.message}`);
        }
    }
    console.log(`\nTeams imported: ${teamCount}/${teams.length}\n`);

    // Import games
    console.log('Importing 23 games...');
    let gameCount = 0;
    for (const game of games) {
        try {
            const gameData = {
                ...game,
                homeTeamName: game.homeTeam,
                awayTeamName: game.awayTeam
            };
            await createDocument('games', gameData);
            gameCount++;
            console.log(`  ✓ Game ${game.gameNumber}: ${game.homeTeam} vs ${game.awayTeam} @ ${game.time}`);
        } catch (error) {
            console.error(`  ✗ Failed to add game ${game.gameNumber}: ${error.message}`);
        }
    }
    console.log(`\nGames imported: ${gameCount}/${games.length}\n`);

    console.log('========================================');
    console.log('IMPORT COMPLETE!');
    console.log('========================================');
    console.log(`Total Teams: ${teamCount}`);
    console.log(`Total Games: ${gameCount}`);
    console.log('========================================');
}

// Main
async function main() {
    try {
        console.log('Getting access token from Firebase CLI credentials...');
        const accessToken = await initializeWithRefreshToken();
        console.log('Access token obtained successfully!\n');
        await importWithREST(accessToken);
    } catch (error) {
        console.error('Import failed:', error.message);
        process.exit(1);
    }
}

main();
