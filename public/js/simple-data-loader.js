// Simple Data Loader for Clash of the Barbarians 2026
console.log('🚀 Simple Data Loader Starting...');

async function loadData() {
    try {
        console.log('🔄 Attempting to load data...');
        
        // Get Firebase instance
        const db = window.db || firebase.firestore();
        if (!db) {
            console.error('❌ Firebase not available');
            return;
        }

        // Load teams for standings
        console.log('📊 Loading teams...');
        const teamsSnapshot = await db.collection('teams').limit(10).get();
        
        if (teamsSnapshot.size > 0) {
            const standingsBody = document.getElementById('standingsBody');
            if (standingsBody) {
                let html = '';
                let rank = 1;
                
                teamsSnapshot.forEach(doc => {
                    const team = doc.data();
                    const winPct = team.gamesPlayed > 0 ? (team.wins / team.gamesPlayed).toFixed(3) : '0.000';
                    
                    html += `
                        <tr>
                            <td>${rank}</td>
                            <td>${team.name}</td>
                            <td><span class="division-badge">${team.division}</span></td>
                            <td>${team.wins || 0}</td>
                            <td>${team.losses || 0}</td>
                            <td>${winPct}</td>
                            <td>${team.pointsFor || 0}</td>
                            <td>${team.pointsAgainst || 0}</td>
                        </tr>
                    `;
                    rank++;
                });
                
                standingsBody.innerHTML = html;
                console.log('✅ Standings loaded successfully');
            }
        }

        // Load games for schedule
        console.log('📅 Loading games...');
        const gamesSnapshot = await db.collection('games').limit(10).get();
        
        if (gamesSnapshot.size > 0) {
            const scheduleGrid = document.getElementById('scheduleGrid');
            if (scheduleGrid) {
                let html = '';
                
                gamesSnapshot.forEach(doc => {
                    const game = doc.data();
                    const gameDate = game.date?.toDate ? game.date.toDate() : new Date(game.date);
                    const dateStr = gameDate.toLocaleDateString();
                    
                    html += `
                        <div class="game-card">
                            <div class="game-header">
                                <div class="game-time">${dateStr} - ${game.time} - ${game.location}</div>
                                <div class="game-division">${game.division}</div>
                            </div>
                            <div class="game-matchup">
                                <span class="team-name">${game.team1}</span>
                                <span class="score">${game.score1}</span>
                            </div>
                            <div class="game-matchup">
                                <span class="team-name">${game.team2}</span>
                                <span class="score">${game.score2}</span>
                            </div>
                            <div class="game-status">${game.status === 'completed' ? 'Final' : 'Scheduled'}</div>
                        </div>
                    `;
                });
                
                scheduleGrid.innerHTML = html;
                console.log('✅ Schedule loaded successfully');
            }
        }

        // Update quick stats
        const gamesThisWeek = document.getElementById('gamesThisWeek');
        const activeTeams = document.getElementById('activeTeams');
        
        if (gamesThisWeek) gamesThisWeek.textContent = gamesSnapshot.size;
        if (activeTeams) activeTeams.textContent = teamsSnapshot.size;

    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Initialize after a delay
setTimeout(() => {
    console.log('🎯 Checking Firebase availability...');
    if (window.firebase) {
        console.log('🔥 Firebase available, loading data...');
        loadData();
    } else {
        console.error('❌ Firebase not available after timeout');
    }
}, 3000);

console.log('✅ Simple Data Loader Loaded');