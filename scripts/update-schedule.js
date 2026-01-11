/**
 * COTB26 Schedule Update Script
 * - Add Flight 10's team
 * - Update 9:30 AM game
 * - Update 12:30 PM game type
 * - Add 2:00 PM Championship
 * - Shift 12U games +45 minutes
 */

const https = require('https');
const os = require('os');
const path = require('path');
const fs = require('fs');

const PROJECT_ID = 'faba-winter-2026';

// Get Firebase CLI refresh token
const configstorePath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
const config = JSON.parse(fs.readFileSync(configstorePath, 'utf8'));
const refreshToken = config.tokens?.refresh_token || config.user?.tokens?.refresh_token;

if (!refreshToken) {
    console.error('No Firebase CLI credentials found. Run: firebase login');
    process.exit(1);
}

// Get access token
function getAccessToken() {
    return new Promise((resolve, reject) => {
        const data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
            client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi'
        }).toString();

        const req = https.request({
            hostname: 'oauth2.googleapis.com',
            port: 443,
            path: '/token',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const tokens = JSON.parse(body);
                resolve(tokens.access_token);
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

// Firestore REST API helpers
function firestoreGet(accessToken, path) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'firestore.googleapis.com',
            port: 443,
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
    });
}

function firestoreCreate(accessToken, collection, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ fields: toFirestoreFields(data) });
        const req = https.request({
            hostname: 'firestore.googleapis.com',
            port: 443,
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function firestoreUpdate(accessToken, docPath, data, updateMask) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ fields: toFirestoreFields(data) });
        const maskParam = updateMask.map(f => `updateMask.fieldPaths=${f}`).join('&');
        const req = https.request({
            hostname: 'firestore.googleapis.com',
            port: 443,
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents${docPath}?${maskParam}`,
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function toFirestoreFields(obj) {
    const fields = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            fields[key] = { nullValue: null };
        } else if (typeof value === 'string') {
            fields[key] = { stringValue: value };
        } else if (typeof value === 'number') {
            fields[key] = Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
        } else if (typeof value === 'boolean') {
            fields[key] = { booleanValue: value };
        } else if (value instanceof Date) {
            fields[key] = { timestampValue: value.toISOString() };
        }
    }
    return fields;
}

async function main() {
    console.log('========================================');
    console.log('COTB26 Schedule Update');
    console.log('========================================\n');

    const accessToken = await getAccessToken();
    console.log('✓ Authenticated with Firebase\n');

    // 1. Add Flight 10's team
    console.log('1. Adding Flight 10\'s team...');
    try {
        await firestoreCreate(accessToken, 'teams', {
            name: "Flight 10's",
            division: "10U (5th)",  // Match existing 10U teams
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            createdAt: new Date()
        });
        console.log('   ✓ Added Flight 10\'s to 10U (5th) division\n');
    } catch (error) {
        console.error('   ✗ Error adding team:', error.message, '\n');
    }

    // 2. Get all games to find the ones we need to update
    console.log('2. Fetching current games...');
    const gamesResult = await firestoreGet(accessToken, '/games?pageSize=100');
    const games = gamesResult.documents || [];
    console.log(`   Found ${games.length} games\n`);

    // Find games to update
    let game930 = null;  // 9:30 AM 10U game
    let game1230 = null; // 12:30 PM 10U game
    let games12U = [];   // All 12U games on Tillman

    for (const game of games) {
        const time = game.fields?.time?.stringValue;
        const division = game.fields?.division?.stringValue;
        const court = game.fields?.court?.stringValue;

        if (time === '9:30 AM' && division === '10U (5th)' && court?.includes('Tillman')) {
            game930 = game;
        }
        if (time === '12:30 PM' && division === '10U (5th)' && court?.includes('Tillman')) {
            game1230 = game;
        }
        if (division === '12U (6th)' && court?.includes('Tillman')) {
            games12U.push(game);
        }
    }

    // 3. Update 9:30 AM game: Flight 10's vs Rug Rats
    console.log('3. Updating 9:30 AM game...');
    if (game930) {
        const docPath = '/' + game930.name.split('/documents/')[1];
        await firestoreUpdate(accessToken, docPath, {
            homeTeam: "Flight 10's",
            homeTeamName: "Flight 10's",
            awayTeam: "Rug Rats",
            awayTeamName: "Rug Rats"
        }, ['homeTeam', 'homeTeamName', 'awayTeam', 'awayTeamName']);
        console.log('   ✓ Changed to Flight 10\'s vs Rug Rats\n');
    } else {
        console.log('   ✗ Could not find 9:30 AM 10U game\n');
    }

    // 4. Update 12:30 PM game type to Bracket
    console.log('4. Updating 12:30 PM game type...');
    if (game1230) {
        const docPath = '/' + game1230.name.split('/documents/')[1];
        await firestoreUpdate(accessToken, docPath, {
            gameType: "Bracket"
        }, ['gameType']);
        console.log('   ✓ Changed to Bracket type\n');
    } else {
        console.log('   ✗ Could not find 12:30 PM 10U game\n');
    }

    // 5. Add new 10U Championship at 2:00 PM
    console.log('5. Adding 2:00 PM 10U Championship...');
    try {
        await firestoreCreate(accessToken, 'games', {
            gameNumber: 24,
            time: "2:00 PM",
            court: "Court 1 - Tillman",
            division: "10U (5th)",
            gameType: "Championship",
            homeTeam: "TBD",
            awayTeam: "TBD",
            homeTeamName: "TBD",
            awayTeamName: "TBD",
            homeScore: 0,
            awayScore: 0,
            status: "scheduled",
            scheduledFor: new Date('2026-01-10T14:00:00'),
            createdAt: new Date()
        });
        console.log('   ✓ Added 10U Championship at 2:00 PM\n');
    } catch (error) {
        console.error('   ✗ Error adding game:', error.message, '\n');
    }

    // 6. Shift 12U games +45 minutes
    console.log('6. Shifting 12U games +45 minutes...');
    const timeShifts = {
        '2:00 PM': '2:45 PM',
        '2:45 PM': '3:30 PM',
        '3:30 PM': '4:15 PM',
        '4:15 PM': '5:00 PM',
        '5:00 PM': '5:45 PM'
    };
    const scheduledForShifts = {
        '2:00 PM': new Date('2026-01-10T14:45:00'),
        '2:45 PM': new Date('2026-01-10T15:30:00'),
        '3:30 PM': new Date('2026-01-10T16:15:00'),
        '4:15 PM': new Date('2026-01-10T17:00:00'),
        '5:00 PM': new Date('2026-01-10T17:45:00')
    };

    for (const game of games12U) {
        const oldTime = game.fields?.time?.stringValue;
        const newTime = timeShifts[oldTime];
        if (newTime) {
            const docPath = '/' + game.name.split('/documents/')[1];
            await firestoreUpdate(accessToken, docPath, {
                time: newTime,
                scheduledFor: scheduledForShifts[oldTime]
            }, ['time', 'scheduledFor']);
            console.log(`   ✓ ${oldTime} → ${newTime}`);
        }
    }

    console.log('\n========================================');
    console.log('SCHEDULE UPDATE COMPLETE!');
    console.log('========================================');
    console.log('Changes made:');
    console.log('  • Added Flight 10\'s to 10U division');
    console.log('  • 9:30 AM: Flight 10\'s vs Rug Rats');
    console.log('  • 12:30 PM: Changed to Bracket type');
    console.log('  • 2:00 PM: Added 10U Championship');
    console.log('  • 12U games shifted +45 minutes');
    console.log('========================================');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
