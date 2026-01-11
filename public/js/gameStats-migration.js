// gameStats Migration Script
// Purpose: Create missing gameStats subcollections for historical games
// Author: Claude Code
// Date: 2026-01-20

console.log('🔧 GameStats Migration Script Loaded');

class GameStatsMigration {
    constructor(db) {
        this.db = db;
        this.migrationStats = {
            gamesProcessed: 0,
            gamesWithExistingStats: 0,
            gamesNeedingMigration: 0,
            playersCreated: 0,
            errors: []
        };
    }

    async runMigration() {
        console.log('🚀 Starting gameStats migration...');
        
        try {
            // Get all games
            const gamesSnapshot = await this.db.collection('games').get();
            console.log(`📊 Found ${gamesSnapshot.size} total games to check`);

            // Process each game
            for (const gameDoc of gamesSnapshot.docs) {
                await this.processGame(gameDoc);
            }

            // Print final report
            this.printMigrationReport();
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            this.migrationStats.errors.push(`Migration failed: ${error.message}`);
        }
    }

    async processGame(gameDoc) {
        const gameId = gameDoc.id;
        const gameData = gameDoc.data();
        
        this.migrationStats.gamesProcessed++;
        console.log(`\n🎯 Processing Game ${this.migrationStats.gamesProcessed}: ${gameId}`);
        console.log(`   ${gameData.homeTeamName || 'Home'} vs ${gameData.awayTeamName || 'Away'}`);

        try {
            // Check if gameStats subcollection already exists
            const gameStatsSnapshot = await this.db
                .collection('games')
                .doc(gameId)
                .collection('gameStats')
                .get();

            if (!gameStatsSnapshot.empty) {
                console.log(`   ✅ Already has ${gameStatsSnapshot.size} gameStats entries`);
                this.migrationStats.gamesWithExistingStats++;
                return;
            }

            console.log(`   ⚠️ Missing gameStats subcollection - creating...`);
            this.migrationStats.gamesNeedingMigration++;

            // Get players from both teams
            const players = await this.getGamePlayers(gameData);
            
            if (players.length === 0) {
                console.log(`   ⚠️ No players found for this game`);
                this.migrationStats.errors.push(`Game ${gameId}: No players found`);
                return;
            }

            // Create gameStats entries for each player
            await this.createGameStatsForPlayers(gameId, gameData, players);

        } catch (error) {
            console.error(`   ❌ Error processing game ${gameId}:`, error);
            this.migrationStats.errors.push(`Game ${gameId}: ${error.message}`);
        }
    }

    async getGamePlayers(gameData) {
        const players = [];

        try {
            // Method 1: Get players from team rosters
            if (gameData.homeTeam && gameData.awayTeam) {
                // Get home team players
                if (gameData.homeTeam.id) {
                    const homeTeamDoc = await this.db.collection('teams').doc(gameData.homeTeam.id).get();
                    if (homeTeamDoc.exists) {
                        const homeTeamData = homeTeamDoc.data();
                        if (homeTeamData.players) {
                            homeTeamData.players.forEach(player => {
                                players.push({
                                    ...player,
                                    teamId: gameData.homeTeam.id,
                                    isHomeTeam: true
                                });
                            });
                        }
                    }
                }

                // Get away team players
                if (gameData.awayTeam.id) {
                    const awayTeamDoc = await this.db.collection('teams').doc(gameData.awayTeam.id).get();
                    if (awayTeamDoc.exists) {
                        const awayTeamData = awayTeamDoc.data();
                        if (awayTeamData.players) {
                            awayTeamData.players.forEach(player => {
                                players.push({
                                    ...player,
                                    teamId: gameData.awayTeam.id,
                                    isHomeTeam: false
                                });
                            });
                        }
                    }
                }
            }

            // Method 2: Try to get players from division if teams method failed
            if (players.length === 0 && gameData.division) {
                console.log(`   🔍 No team players found, searching by division: ${gameData.division}`);
                const playersSnapshot = await this.db
                    .collection('players')
                    .where('division', '==', gameData.division)
                    .get();

                playersSnapshot.docs.forEach(doc => {
                    const playerData = doc.data();
                    players.push({
                        id: doc.id,
                        name: playerData.name || 'Unknown Player',
                        number: playerData.number || 0,
                        teamId: playerData.teamId || 'unknown',
                        division: gameData.division,
                        isHomeTeam: Math.random() > 0.5 // Random assignment if we can't determine
                    });
                });
            }

            console.log(`   👥 Found ${players.length} players for migration`);
            return players;

        } catch (error) {
            console.error(`   ❌ Error getting players:`, error);
            return [];
        }
    }

    async createGameStatsForPlayers(gameId, gameData, players) {
        console.log(`   💾 Creating gameStats for ${players.length} players...`);

        const batch = this.db.batch();
        let playersCreated = 0;

        for (const player of players) {
            try {
                const gameStatsRef = this.db
                    .collection('games')
                    .doc(gameId)
                    .collection('gameStats')
                    .doc(player.id);

                // Create default stats structure
                const statsData = {
                    gameId: gameId,
                    playerId: player.id,
                    playerName: player.name || 'Unknown Player',
                    jerseyNumber: player.number || 0,
                    division: player.division || gameData.division || 'unknown',
                    teamId: player.teamId || 'unknown',
                    // Default stats (0 for historical games where we don't have data)
                    pts: 0,  // points
                    reb: 0,  // rebounds  
                    ast: 0,  // assists
                    stl: 0,  // steals
                    blk: 0,  // blocks
                    fls: 0,  // fouls
                    // Migration metadata
                    migratedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    migrationNote: 'Historical game - stats initialized to 0'
                };

                batch.set(gameStatsRef, statsData);
                playersCreated++;

            } catch (error) {
                console.error(`   ❌ Error creating stats for player ${player.name}:`, error);
                this.migrationStats.errors.push(`Player ${player.name} in game ${gameId}: ${error.message}`);
            }
        }

        // Commit the batch
        if (playersCreated > 0) {
            await batch.commit();
            console.log(`   ✅ Created gameStats for ${playersCreated} players`);
            this.migrationStats.playersCreated += playersCreated;
        } else {
            console.log(`   ⚠️ No players created for this game`);
        }
    }

    printMigrationReport() {
        console.log('\n📋 =================================');
        console.log('📋 GAMESTATS MIGRATION REPORT');
        console.log('📋 =================================');
        console.log(`📊 Games Processed: ${this.migrationStats.gamesProcessed}`);
        console.log(`✅ Games with Existing Stats: ${this.migrationStats.gamesWithExistingStats}`);
        console.log(`🔧 Games Needing Migration: ${this.migrationStats.gamesNeedingMigration}`);
        console.log(`👥 Player Stats Created: ${this.migrationStats.playersCreated}`);
        console.log(`❌ Errors: ${this.migrationStats.errors.length}`);
        
        if (this.migrationStats.errors.length > 0) {
            console.log('\n❌ Error Details:');
            this.migrationStats.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        console.log('\n🎉 Migration Complete!');
        
        // Store migration report in Firestore for admin review
        this.saveMigrationReport();
    }

    async saveMigrationReport() {
        try {
            await this.db.collection('admin').doc('gameStatsMigration').set({
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                stats: this.migrationStats,
                status: 'completed'
            });
            console.log('📄 Migration report saved to Firestore at admin/gameStatsMigration');
        } catch (error) {
            console.error('❌ Failed to save migration report:', error);
        }
    }
}

// Export for use in other files
window.GameStatsMigration = GameStatsMigration;

// Auto-run migration function (can be called from console)
window.runGameStatsMigration = async function() {
    if (!window.db) {
        console.error('❌ Firebase database not available. Make sure Firebase is initialized.');
        return;
    }
    
    const migration = new GameStatsMigration(window.db);
    await migration.runMigration();
};

console.log('✅ GameStats Migration Script Ready!');
console.log('💡 To run migration, call: runGameStatsMigration()');