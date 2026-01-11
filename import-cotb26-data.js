/**
 * COTB26 Data Import Script
 * Run with: node import-cotb26-data.js
 *
 * This script imports the real tournament data for Clash of the Barbarians 2026
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
// Make sure you're logged in with: firebase login
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'faba-winter-2026'
});

const db = admin.firestore();

// ============================================
// TEAMS DATA - 18 Teams
// ============================================
const teams = [
    // 10U (5th) Division - 3 teams
    { name: "Wolves", division: "10U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "ReZ Fire", division: "10U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Rug Rats", division: "10U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },

    // 11U (5th) Division - 3 teams
    { name: "Star Status", division: "11U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "ReZ Fire", division: "11U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Wolves", division: "11U (5th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },

    // 12U (6th) Division - 4 teams
    { name: "WBA", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Tigers", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Flight 12's", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Bomb Squad", division: "12U (6th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },

    // 13U (7th) Division - 3 teams
    { name: "WBA", division: "13U (7th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Barbarians", division: "13U (7th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Flight 13's", division: "13U (7th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },

    // 14U (8th) Division - 5 teams
    { name: "Flight 14's", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Mind over Matter", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "WBA", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Warriors", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 },
    { name: "Tigers", division: "14U (8th)", wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 }
];

// ============================================
// GAMES DATA - 23 Games
// ============================================
const tournamentDate = new Date('2026-01-10T00:00:00');

const games = [
    // Court 1 - Tillman Middle School (4309 E Belleview St, Phoenix, AZ 85008)
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

    // Court 2 - Griffith Elementary (4505 E Palm Ln, Phoenix, AZ 85007)
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

async function importData() {
    console.log('Starting COTB26 data import...\n');

    // Import Teams
    console.log('Importing 18 teams...');
    for (const team of teams) {
        const docRef = await db.collection('teams').add({
            ...team,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  Added team: ${team.name} (${team.division}) - ID: ${docRef.id}`);
    }
    console.log('Teams import complete!\n');

    // Import Games
    console.log('Importing 23 games...');
    for (const game of games) {
        const docRef = await db.collection('games').add({
            ...game,
            homeTeamName: game.homeTeam,
            awayTeamName: game.awayTeam,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  Added game ${game.gameNumber}: ${game.homeTeam} vs ${game.awayTeam} (${game.division}) - ID: ${docRef.id}`);
    }
    console.log('Games import complete!\n');

    console.log('========================================');
    console.log('COTB26 Data Import Complete!');
    console.log('========================================');
    console.log(`Total Teams: ${teams.length}`);
    console.log(`Total Games: ${games.length}`);
    console.log('========================================');

    process.exit(0);
}

importData().catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
});
