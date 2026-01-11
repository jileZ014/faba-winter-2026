/**
 * COTB26 Data Import Script
 * Uses Firebase Admin SDK with Application Default Credentials
 *
 * Prerequisites:
 * 1. Run: npm install firebase-admin
 * 2. Run: gcloud auth application-default login (or set GOOGLE_APPLICATION_CREDENTIALS)
 * 3. Run: node scripts/import-data.js
 */

const admin = require('firebase-admin');

// Initialize with application default credentials
admin.initializeApp({
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
const games = [
    // Court 1 - Tillman Middle School
    { gameNumber: 1, time: "8:00 AM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Pool Play", homeTeam: "Wolves", awayTeam: "ReZ Fire", homeTeamName: "Wolves", awayTeamName: "ReZ Fire", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:00:00') },
    { gameNumber: 2, time: "8:45 AM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Pool Play", homeTeam: "Star Status", awayTeam: "ReZ Fire", homeTeamName: "Star Status", awayTeamName: "ReZ Fire", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:45:00') },
    { gameNumber: 3, time: "9:30 AM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Pool Play", homeTeam: "ReZ Fire", awayTeam: "Rug Rats", homeTeamName: "ReZ Fire", awayTeamName: "Rug Rats", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T09:30:00') },
    { gameNumber: 4, time: "10:15 AM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Pool Play", homeTeam: "Star Status", awayTeam: "Wolves", homeTeamName: "Star Status", awayTeamName: "Wolves", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T10:15:00') },
    { gameNumber: 5, time: "11:00 AM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:00:00') },
    { gameNumber: 6, time: "11:45 AM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:45:00') },
    { gameNumber: 7, time: "12:30 PM", court: "Court 1 - Tillman", division: "10U (5th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T12:30:00') },
    { gameNumber: 8, time: "1:15 PM", court: "Court 1 - Tillman", division: "11U (5th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T13:15:00') },
    { gameNumber: 9, time: "2:00 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Tigers", homeTeamName: "WBA", awayTeamName: "Tigers", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:00:00') },
    { gameNumber: 10, time: "2:45 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Pool Play", homeTeam: "Flight 12's", awayTeam: "Bomb Squad", homeTeamName: "Flight 12's", awayTeamName: "Bomb Squad", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:45:00') },
    { gameNumber: 11, time: "3:30 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T15:30:00') },
    { gameNumber: 12, time: "4:15 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T16:15:00') },
    { gameNumber: 13, time: "5:00 PM", court: "Court 1 - Tillman", division: "12U (6th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T17:00:00') },

    // Court 2 - Griffith Elementary
    { gameNumber: 14, time: "8:00 AM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Pool Play", homeTeam: "Flight 14's", awayTeam: "Mind over Matter", homeTeamName: "Flight 14's", awayTeamName: "Mind over Matter", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:00:00') },
    { gameNumber: 15, time: "8:45 AM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Barbarians", homeTeamName: "WBA", awayTeamName: "Barbarians", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T08:45:00') },
    { gameNumber: 16, time: "9:30 AM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Warriors", homeTeamName: "WBA", awayTeamName: "Warriors", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T09:30:00') },
    { gameNumber: 17, time: "10:15 AM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Pool Play", homeTeam: "WBA", awayTeam: "Flight 13's", homeTeamName: "WBA", awayTeamName: "Flight 13's", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T10:15:00') },
    { gameNumber: 18, time: "11:00 AM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Pool Play", homeTeam: "Tigers", awayTeam: "Warriors", homeTeamName: "Tigers", awayTeamName: "Warriors", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:00:00') },
    { gameNumber: 19, time: "11:45 AM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T11:45:00') },
    { gameNumber: 20, time: "12:30 PM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T12:30:00') },
    { gameNumber: 21, time: "1:15 PM", court: "Court 2 - Griffith", division: "13U (7th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T13:15:00') },
    { gameNumber: 22, time: "2:00 PM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Bracket", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:00:00') },
    { gameNumber: 23, time: "2:45 PM", court: "Court 2 - Griffith", division: "14U (8th)", gameType: "Championship", homeTeam: "TBD", awayTeam: "TBD", homeTeamName: "TBD", awayTeamName: "TBD", homeScore: 0, awayScore: 0, status: "scheduled", scheduledFor: new Date('2026-01-10T14:45:00') }
];

async function importData() {
    console.log('========================================');
    console.log('COTB26 Data Import Starting...');
    console.log('========================================\n');

    // Import Teams
    console.log('Importing 18 teams...');
    let teamCount = 0;
    for (const team of teams) {
        try {
            const docRef = await db.collection('teams').add({
                ...team,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            teamCount++;
            console.log(`  ✓ ${team.name} (${team.division})`);
        } catch (error) {
            console.error(`  ✗ Failed to add ${team.name}: ${error.message}`);
        }
    }
    console.log(`\nTeams imported: ${teamCount}/${teams.length}\n`);

    // Import Games
    console.log('Importing 23 games...');
    let gameCount = 0;
    for (const game of games) {
        try {
            const docRef = await db.collection('games').add({
                ...game,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
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

    process.exit(0);
}

importData().catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
});
