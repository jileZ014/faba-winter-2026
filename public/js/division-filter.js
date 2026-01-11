/*
==========================================
Clash of the Barbarians 2026 - DIVISION FILTERING
==========================================
Handles division-specific data filtering and display
Works with existing Firebase structure from West Valley
==========================================
*/

(function() {
    'use strict';

    console.log('🎯 Division Filter Module Loading...');

    // Division configuration - COTB26 Age-Based Divisions
    const DIVISIONS = {
        '10u': { name: '10U (5th)', displayName: '10U (5TH)', order: 1 },
        '11u': { name: '11U (5th)', displayName: '11U (5TH)', order: 2 },
        '12u': { name: '12U (6th)', displayName: '12U (6TH)', order: 3 },
        '13u': { name: '13U (7th)', displayName: '13U (7TH)', order: 4 },
        '14u': { name: '14U (8th)', displayName: '14U (8TH)', order: 5 }
    };

    /**
     * Convert URL slug to database division name
     * @param {string} slug - URL slug like 'grade-4' or 'grade-girls'
     * @returns {string} - Database division name like '4th Grade'
     */
    function slugToDivisionName(slug) {
        const mapping = {
            '10u': '10U (5th)',
            '11u': '11U (5th)',
            '12u': '12U (6th)',
            '13u': '13U (7th)',
            '14u': '14U (8th)'
        };

        const result = mapping[slug] || slug;
        console.log(`🔄 Slug conversion: '${slug}' → '${result}'`);
        return result;
    }

    // Get current page division
    function getCurrentDivision() {
        const body = document.body;
        const divisionData = body.dataset.division;
        const pageType = body.dataset.page;
        
        if (pageType === 'division' && divisionData) {
            // Convert slug to proper division name if needed
            const convertedDivision = slugToDivisionName(divisionData);
            console.log(`🎯 Division page detected: '${divisionData}' → '${convertedDivision}'`);
            return convertedDivision;
        }
        
        // Also check window.currentDivision for division pages
        if (window.currentDivision) {
            const convertedDivision = slugToDivisionName(window.currentDivision);
            console.log(`🎯 Window division detected: '${window.currentDivision}' → '${convertedDivision}'`);
            return convertedDivision;
        }
        
        // Check URL for division slug
        const path = window.location.pathname;
        const divisionMatch = path.match(/(10u|11u|12u|13u|14u)/i);
        if (divisionMatch) {
            const slug = divisionMatch[1].toLowerCase();
            const convertedDivision = slugToDivisionName(slug);
            console.log(`🎯 URL division detected: '${slug}' → '${convertedDivision}'`);
            return convertedDivision;
        }
        
        // For main page, return null (show all divisions)
        console.log('🏠 Main page detected - showing all divisions');
        return null;
    }

    // Format division display name for badges
    function formatDivisionBadge(division) {
        const config = DIVISIONS[division];
        if (!config) return division.toUpperCase();
        return config.displayName;
    }

    // ==================== SCHEDULE FILTERING ====================
    
    async function loadScheduleData(division = null) {
        const db = window.db || (window.firebase && window.firebase.firestore());
        if (!db) {
            console.error('❌ Firebase not initialized');
            return [];
        }

        try {
            // Convert division slug to proper name if needed
            const divisionName = division ? slugToDivisionName(division) : null;
            
            console.log(`📅 Loading schedule data ${divisionName ? `for ${divisionName}` : 'for all divisions'}`);
            console.log('🔍 Firebase db object:', db);
            
            let query = db.collection('games');
            console.log('🔍 Created query for games collection');
            
            // Filter by division if specified
            if (divisionName) {
                query = query.where('division', '==', divisionName);
                console.log(`🔍 Added division filter: ${divisionName}`);
            }
            
            // Get current week's games (remove orderBy to avoid index issues)
            console.log('🔍 Executing query...');
            const snapshot = await query.limit(20).get();
            console.log('🔍 Query executed, snapshot size:', snapshot.size);
            
            const games = [];
            snapshot.forEach(doc => {
                const game = { id: doc.id, ...doc.data() };
                console.log('🔍 Game data:', game);
                games.push(game);
            });

            console.log(`✅ Loaded ${games.length} games`);
            if (games.length > 0) {
                console.log('🔍 First game:', games[0]);
            }
            return games;

        } catch (error) {
            console.error('❌ Error loading schedule:', error);
            console.error('❌ Full error:', error);
            return [];
        }
    }

    function renderGameCard(game) {
        const isLive = game.status === 'live' || game.status === 'in_progress';
        const isCompleted = game.status === 'completed' || game.status === 'final';
        
        let statusDisplay = '';
        let statusClass = '';
        
        if (isLive) {
            statusClass = 'live';
            statusDisplay = `<span class="live-badge">LIVE</span>`;
        }

        const team1Score = game.score1 || '-';
        const team2Score = game.score2 || '-';
        
        let gameStatus = '';
        if (isLive) {
            gameStatus = game.quarter ? `Q${game.quarter} - ${game.timeRemaining || '0:00'} Remaining` : 'In Progress';
        } else if (isCompleted) {
            gameStatus = 'Final';
        } else {
            gameStatus = 'Scheduled';
        }

        // Format game date and time
        let gameTimeDisplay = 'TBD';
        if (game.date) {
            const gameDate = game.date.toDate ? game.date.toDate() : new Date(game.date);
            gameTimeDisplay = gameDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
            }) + ` - ${gameDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
            })} - ${game.location || 'Court TBD'}`;
        }

        return `
            <div class="game-card ${statusClass}" data-game-id="${game.id}">
                <div class="game-header">
                    <div class="game-time">${gameTimeDisplay}</div>
                    ${statusDisplay}
                </div>
                <div class="game-matchup">
                    <span class="team-name">${game.team1 || 'Team 1'}</span>
                    <span class="score">${team1Score}</span>
                </div>
                <div class="game-matchup">
                    <span class="team-name">${game.team2 || 'Team 2'}</span>
                    <span class="score">${team2Score}</span>
                </div>
                <div class="game-status">${gameStatus}</div>
                ${!getCurrentDivision() ? `<div class="game-division">${formatDivisionBadge(game.division)} Division</div>` : ''}
            </div>
        `;
    }

    async function displaySchedule(division = null) {
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (!scheduleGrid) return;

        // Show loading
        scheduleGrid.innerHTML = `
            <div class="schedule-placeholder">
                <p style="text-align: center; color: #888; font-style: italic; padding: 2rem;">
                    🏀 Loading ${division ? DIVISIONS[division]?.name : 'all'} games...
                </p>
            </div>
        `;

        const games = await loadScheduleData(division);
        
        if (games.length === 0) {
            scheduleGrid.innerHTML = `
                <div class="schedule-placeholder">
                    <p style="text-align: center; color: #888; font-style: italic; padding: 2rem;">
                        📅 No games scheduled ${division ? `for ${DIVISIONS[division]?.name}` : ''}
                    </p>
                </div>
            `;
            return;
        }

        // Render games
        const gameCards = games.map(game => renderGameCard(game)).join('');
        scheduleGrid.innerHTML = gameCards;

        // Setup real-time listeners for live games
        setupLiveGameListeners(games.filter(g => g.status === 'live' || g.status === 'in_progress'));
    }

    // ==================== STANDINGS FILTERING ====================
    
    async function loadStandingsData(division = null) {
        const db = window.db || (window.firebase && window.firebase.firestore());
        if (!db) {
            console.error('❌ Firebase not initialized');
            return [];
        }

        try {
            // Convert division slug to proper name if needed
            const divisionName = division ? slugToDivisionName(division) : null;
            
            console.log(`📊 Loading standings ${divisionName ? `for ${divisionName}` : 'for all divisions'}`);
            
            // Get all teams first
            let teamsQuery = db.collection('teams');
            if (divisionName) {
                teamsQuery = teamsQuery.where('division', '==', divisionName);
                console.log(`🔍 Added team division filter: ${divisionName}`);
            }
            
            const teamsSnapshot = await teamsQuery.get();
            
            // Use EXACT same query pattern as working Past Results function
            console.log(`📊 Using Past Results query pattern for standings...`);
            
            let query = db.collection('games');
            
            // Filter by division (exact same logic as Past Results)
            if (divisionName) {
                query = query.where('division', '==', divisionName);
                console.log(`🔍 Added division filter: ${divisionName}`);
            }
            
            // Try multiple status values to handle different game status formats
            const statusOptions = ['completed', 'final', 'finished'];
            let snapshot;
            let completedGames = [];
            
            for (const status of statusOptions) {
                console.log(`🔍 Trying status filter: ${status}`);
                const statusQuery = query.where('status', '==', status);
                snapshot = await statusQuery.get();
                
                snapshot.forEach(doc => {
                    completedGames.push(doc.data());
                });
                
                if (completedGames.length > 0) {
                    console.log(`📊 Found ${completedGames.length} games with status: ${status}`);
                    break;
                }
            }
            
            // If still no games, remove status filter and get all games for division
            if (completedGames.length === 0 && divisionName) {
                console.log(`🔍 No completed games found, trying all games for division...`);
                const allGamesQuery = db.collection('games').where('division', '==', divisionName);
                snapshot = await allGamesQuery.get();
                snapshot.forEach(doc => {
                    const game = doc.data();
                    // Accept games with any status that have scores
                    if ((game.score1 || game.homeScore) && (game.score2 || game.awayScore)) {
                        completedGames.push(game);
                    }
                });
            }

            console.log(`📊 Found ${completedGames.length} completed games for ${divisionName || 'all divisions'} using Past Results query pattern`);
            
            // Initialize team stats object
            const teamStats = {};

            // Get all teams for this division
            teamsSnapshot.forEach(doc => {
                const team = { id: doc.id, ...doc.data() };
                teamStats[team.name] = {
                    id: team.id,
                    name: team.name,
                    division: team.division,
                    wins: 0,
                    losses: 0,
                    pf: 0,    // Points For
                    pa: 0,    // Points Against
                    diff: 0   // Differential
                };
            });

            // Calculate stats from completed games
            completedGames.forEach(game => {
                const team1 = game.team1 || game.homeTeam;
                const team2 = game.team2 || game.awayTeam;
                const score1 = parseInt(game.score1 || game.homeScore || 0);
                const score2 = parseInt(game.score2 || game.awayScore || 0);

                // Update Team 1 stats
                if (teamStats[team1]) {
                    teamStats[team1].pf += score1;
                    teamStats[team1].pa += score2;
                    if (score1 > score2) {
                        teamStats[team1].wins++;
                    } else if (score1 < score2) {
                        teamStats[team1].losses++;
                    }
                }

                // Update Team 2 stats
                if (teamStats[team2]) {
                    teamStats[team2].pf += score2;
                    teamStats[team2].pa += score1;
                    if (score2 > score1) {
                        teamStats[team2].wins++;
                    } else if (score2 < score1) {
                        teamStats[team2].losses++;
                    }
                }
            });

            // Third pass: calculate differentials and percentages
            const teams = Object.values(teamStats).map(team => {
                team.diff = team.pf - team.pa;
                const totalGames = team.wins + team.losses;
                team.winPct = totalGames > 0 ? (team.wins / totalGames) : 0;
                
                // Barbarian field names for compatibility
                team.pointsFor = team.pf;
                team.pointsAgainst = team.pa;
                team.pointDiff = team.diff;
                
                return team;
            });

            // Sort by win percentage, then by point differential
            teams.sort((a, b) => {
                if (b.winPct !== a.winPct) {
                    return b.winPct - a.winPct;
                }
                return b.pointDiff - a.pointDiff;
            });

            console.log(`✅ Loaded ${teams.length} teams with calculated stats`);
            return teams;

        } catch (error) {
            console.error('❌ Error loading standings:', error);
            return [];
        }
    }

    async function displayStandings(division = null) {
        const standingsBody = document.getElementById('standingsBody') || 
                             document.getElementById('divisionStandings');
        if (!standingsBody) return;

        // Show loading
        const loadingMessage = division ? 
            `🏀 Loading ${DIVISIONS[division]?.name} standings...` :
            '🏀 Loading current standings...';
            
        standingsBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #888; font-style: italic; padding: 2rem;">
                    ${loadingMessage}
                </td>
            </tr>
        `;

        const teams = await loadStandingsData(division);
        
        if (teams.length === 0) {
            standingsBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: #888; font-style: italic; padding: 2rem;">
                        📊 No teams found ${division ? `for ${DIVISIONS[division]?.name}` : ''}
                    </td>
                </tr>
            `;
            return;
        }

        // Render teams
        const tableRows = teams.map((team, index) => {
            const rank = index + 1;
            const winPct = team.winPct.toFixed(3);
            const diffClass = team.pointDiff > 0 ? 'positive-diff' : team.pointDiff < 0 ? 'negative-diff' : '';
            const diffSign = team.pointDiff > 0 ? '+' : '';
            const pointDiff = `${diffSign}${team.pointDiff}`;
            
            // Add win streak indicator for division pages
            let streakIndicator = '';
            if (division && team.winStreak && team.winStreak >= 3) {
                streakIndicator = `<span class="streak-indicator streak-hot">🔥 ${team.winStreak}W</span>`;
            }
            
            return `
                <tr>
                    <td><span class="rank">${rank}</span></td>
                    <td class="team-name-cell" data-team="${team.name}">
                        ${team.name || 'Unnamed Team'}
                        ${streakIndicator}
                    </td>
                    ${!division ? `<td><span class="division-badge">${formatDivisionBadge(team.division)}</span></td>` : ''}
                    <td>${team.wins || 0}</td>
                    <td>${team.losses || 0}</td>
                    <td>${winPct}</td>
                    <td>${team.pointsFor || 0}</td>
                    <td>${team.pointsAgainst || 0}</td>
                    ${division ? `<td class="${diffClass}">${pointDiff}</td>` : ''}
                </tr>
            `;
        }).join('');

        standingsBody.innerHTML = tableRows;
    }

    // ==================== PLAYER LEADERBOARDS ====================
    
    async function loadPlayerStats(division = null, statType = 'points', teamFilter = null) {
        const db = window.db || (window.firebase && window.firebase.firestore());
        if (!db) {
            console.error('❌ Firebase not initialized');
            return [];
        }

        try {
            // Convert division slug to proper name if needed
            const divisionName = division ? slugToDivisionName(division) : null;
            
            console.log(`🏆 Loading ${statType} leaders ${divisionName ? `for ${divisionName}` : 'for all divisions'}${teamFilter ? ` filtered by team: ${teamFilter}` : ''}`);
            
            let query = db.collection('players');
            
            // Filter by division if specified
            if (divisionName) {
                // Assuming players have a division field, or we can filter by team.division
                query = query.where('division', '==', divisionName);
                console.log(`🔍 Added player division filter: ${divisionName}`);
            }
            
            // Filter by team if specified
            if (teamFilter) {
                query = query.where('team', '==', teamFilter);
                console.log(`🔍 Added player team filter: ${teamFilter}`);
            }
            
            const snapshot = await query.get();
            
            const players = [];
            snapshot.forEach(doc => {
                const player = { id: doc.id, ...doc.data() };
                
                // Calculate per-game stats
                const gamesPlayed = player.gamesPlayed || 1;
                player.ppg = (player.points || 0) / gamesPlayed;
                player.rpg = (player.rebounds || 0) / gamesPlayed;
                player.apg = (player.assists || 0) / gamesPlayed;
                
                players.push(player);
            });

            // Sort by the requested stat type
            let sortField = 'ppg';
            if (statType === 'rebounds') sortField = 'rpg';
            if (statType === 'assists') sortField = 'apg';
            
            players.sort((a, b) => b[sortField] - a[sortField]);
            
            console.log(`✅ Loaded ${players.length} players for ${statType}`);
            return players.slice(0, 5); // Top 5

        } catch (error) {
            console.error(`❌ Error loading ${statType} leaders:`, error);
            return [];
        }
    }

    async function displayLeaderboard(division = null, teamFilter = null) {
        const leaderboardSections = {
            ppgLeaders: 'points',
            rpgLeaders: 'rebounds', 
            apgLeaders: 'assists'
        };

        for (const [elementId, statType] of Object.entries(leaderboardSections)) {
            const container = document.getElementById(elementId);
            if (!container) continue;

            // Show loading
            container.innerHTML = `
                <div style="text-align: center; color: #888; font-style: italic; padding: 2rem;">
                    🏀 Loading leaders...
                </div>
            `;

            const players = await loadPlayerStats(division, statType, teamFilter);
            
            if (players.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: #888; font-style: italic; padding: 2rem;">
                        📊 No data available
                    </div>
                `;
                continue;
            }

            // Render player list
            const playerItems = players.map((player, index) => {
                const rank = index + 1;
                let statValue = '';
                let statLabel = '';
                
                if (statType === 'points') {
                    statValue = player.ppg.toFixed(1);
                    statLabel = 'PPG';
                } else if (statType === 'rebounds') {
                    statValue = player.rpg.toFixed(1);
                    statLabel = 'RPG';
                } else if (statType === 'assists') {
                    statValue = player.apg.toFixed(1);
                    statLabel = 'APG';
                }
                
                return `
                    <div class="leader-item">
                        <div class="leader-left">
                            <span class="leader-rank">${rank}</span>
                            <div class="leader-info">
                                <div class="leader-name">${player.name || 'Unknown Player'}</div>
                                <div class="leader-team">${player.team || 'Unknown Team'}</div>
                            </div>
                        </div>
                        <span class="leader-stat">${statValue}</span>
                    </div>
                `;
            }).join('');

            container.innerHTML = playerItems;
        }
        
        // Also try to render compact leaders if containers exist
        await displayLeaderboardCompact(division, teamFilter);
    }

    async function displayLeaderboardCompact(division = null, teamFilter = null) {
        const leaderboardSections = [
            { containerId: 'points-leaders-list', statType: 'points', statLabel: 'PPG' },
            { containerId: 'rebounds-leaders-list', statType: 'rebounds', statLabel: 'RPG' },
            { containerId: 'assists-leaders-list', statType: 'assists', statLabel: 'APG' }
        ];

        for (const section of leaderboardSections) {
            const container = document.getElementById(section.containerId);
            if (!container) continue;

            // Show loading
            container.innerHTML = '<p style="color: #94A3B8; font-size: 14px;">Loading...</p>';

            const players = await loadPlayerStats(division, section.statType, teamFilter);
            
            if (players.length === 0) {
                container.innerHTML = '<p style="color: #94A3B8; font-size: 14px;">📊 No data available</p>';
                continue;
            }

            renderLeadersCompact(players, section.containerId, section.statType, section.statLabel);
        }
    }

    function renderLeadersCompact(leaders, containerId, statName, statLabel) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }
        
        if (leaders.length === 0) {
            container.innerHTML = '<p style="color: #94A3B8; font-size: 14px;">📊 No data available</p>';
            return;
        }
        
        let html = '';
        leaders.slice(0, 5).forEach((player, index) => {
            const statValue = statName === 'ppg' || statName === 'rpg' || statName === 'apg' 
                ? player[statName].toFixed(1) 
                : player[statName];
                
            html += `
                <div class="leader-item-compact">
                    <div class="leader-rank-compact">${index + 1}</div>
                    <div class="leader-info-compact">
                        <div class="leader-name-compact">${player.name || player.playerName}</div>
                        <div class="leader-team-compact">${player.team || player.teamName}</div>
                    </div>
                    <div class="leader-stat-compact">${statValue}</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        console.log(`✅ Rendered ${leaders.length} ${statLabel} leaders in compact format`);
    }

    // ==================== TOP PERFORMERS CALCULATION ====================
    
    async function calculateTopPerformers() {
        console.log('🔥 Calculating weekend top performers...');
        
        // This is a simplified version - in a real implementation,
        // you'd query games from the current weekend and aggregate stats
        try {
            const players = await loadPlayerStats(null, 'points');
            
            if (players.length > 0) {
                const mvp = players[0];
                updatePerformerDisplay('mvp', mvp);
                
                if (players[1]) updatePerformerDisplay('topScorer', players[1]);
                if (players[2]) updatePerformerDisplay('topRebounder', players[2]); 
                if (players[3]) updatePerformerDisplay('topAssister', players[3]);
            }
            
        } catch (error) {
            console.error('❌ Error calculating top performers:', error);
        }
    }

    function updatePerformerDisplay(type, player) {
        const elements = {
            mvp: { name: 'mvpName', team: 'mvpTeam', points: 'mvpPoints', rebounds: 'mvpRebounds', assists: 'mvpAssists' },
            topScorer: { name: 'topScorerName', team: 'topScorerTeam', points: 'topScorerPoints', fg: 'topScorerFG' },
            topRebounder: { name: 'topRebounderName', team: 'topRebounderTeam', rebs: 'topRebounderRebs', orebs: 'topRebounderORebs' },
            topAssister: { name: 'topAssisterName', team: 'topAssisterTeam', assists: 'topAssisterAssists', points: 'topAssisterPoints' }
        };

        const mapping = elements[type];
        if (!mapping) return;

        // Update name and team
        const nameEl = document.getElementById(mapping.name);
        const teamEl = document.getElementById(mapping.team);
        
        if (nameEl) nameEl.textContent = player.name || 'Unknown Player';
        if (teamEl) teamEl.textContent = (player.team || 'Unknown Team') + (player.division ? ` • ${DIVISIONS[player.division]?.name}` : '');

        // Update stats based on type
        Object.entries(mapping).forEach(([key, elementId]) => {
            if (key === 'name' || key === 'team') return;
            
            const element = document.getElementById(elementId);
            if (!element) return;
            
            let value = '';
            switch (key) {
                case 'points': value = Math.round(player.ppg * (player.gamesPlayed || 1)); break;
                case 'rebounds': 
                case 'rebs': value = Math.round(player.rpg * (player.gamesPlayed || 1)); break;
                case 'assists': value = Math.round(player.apg * (player.gamesPlayed || 1)); break;
                case 'fg': value = '58%'; break; // Placeholder
                case 'orebs': value = Math.round((player.rpg || 0) * 0.4); break; // Estimate
            }
            
            element.textContent = value;
        });
    }

    // ==================== LIVE GAME UPDATES ====================
    
    function setupLiveGameListeners(liveGames) {
        if (!liveGames || liveGames.length === 0) return;
        
        console.log(`🔴 Setting up live listeners for ${liveGames.length} games`);
        
        liveGames.forEach(game => {
            const gameRef = window.db.collection('games').doc(game.id);
            
            gameRef.onSnapshot(doc => {
                if (doc.exists) {
                    const updatedGame = { id: doc.id, ...doc.data() };
                    updateLiveGameDisplay(updatedGame);
                }
            });
        });
    }

    function updateLiveGameDisplay(game) {
        const gameCard = document.querySelector(`[data-game-id="${game.id}"]`);
        if (!gameCard) return;
        
        // Update scores
        const scoreElements = gameCard.querySelectorAll('.score');
        if (scoreElements.length >= 2) {
            scoreElements[0].textContent = game.score1 || '-';
            scoreElements[1].textContent = game.score2 || '-';
        }
        
        // Update game status
        const statusElement = gameCard.querySelector('.game-status');
        if (statusElement) {
            let status = 'In Progress';
            if (game.quarter && game.timeRemaining) {
                status = `Q${game.quarter} - ${game.timeRemaining} Remaining`;
            } else if (game.status === 'completed' || game.status === 'final') {
                status = 'Final';
                gameCard.classList.remove('live');
            }
            statusElement.textContent = status;
        }
        
        console.log(`🔄 Updated live game: ${game.team1} vs ${game.team2}`);
    }

    // ==================== INITIALIZATION ====================
    
    function initializeDivisionFiltering() {
        const currentDivision = getCurrentDivision();
        const pageType = document.body.dataset.page;
        
        // Set global currentDivision for other scripts
        if (currentDivision) {
            window.currentDivision = currentDivision;
        }
        
        console.log(`🎯 Initializing division filtering for: ${pageType}${currentDivision ? ` (${currentDivision})` : ' (all divisions)'}`);
        
        // Load appropriate data based on page type
        if (pageType === 'main') {
            // Main page - show all divisions
            displaySchedule();
            displayStandings();
            calculateTopPerformers();
            
            // Update quick stats
            updateQuickStats();
            
        } else if (pageType === 'division' && currentDivision) {
            // Division page - show only specific division
            console.log(`📋 Loading division-specific data for: ${currentDivision}`);
            
            // Initialize team filter functionality
            initializeTeamFilter();
            
            // Load initial data (may be filtered if URL param exists)
            const teamFilter = getUrlParameter('team');
            if (teamFilter) {
                loadCurrentWeekGames(currentDivision, teamFilter);
                loadPastResults(currentDivision, teamFilter);
            } else {
                loadCurrentWeekGames(currentDivision);
                loadPastResults(currentDivision);
            }
            
            displaySchedule(currentDivision);
            displayStandings(currentDivision);
            displayLeaderboard(currentDivision);
        }
    }

    async function updateQuickStats() {
        try {
            // Games this week
            const gamesSnapshot = await window.db.collection('games')
                .where('date', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                .get();
            
            const gamesThisWeek = document.getElementById('gamesThisWeek');
            if (gamesThisWeek) gamesThisWeek.textContent = gamesSnapshot.size;
            
            // Active teams
            const teamsSnapshot = await window.db.collection('teams').get();
            const activeTeams = document.getElementById('activeTeams');
            if (activeTeams) activeTeams.textContent = teamsSnapshot.size;
            
            console.log('✅ Quick stats updated');
            
        } catch (error) {
            console.error('❌ Error updating quick stats:', error);
        }
    }

    async function loadPastResults(division, teamFilter = null) {
        console.log(`📚 Loading past results for ${division}${teamFilter ? ` filtered by team: ${teamFilter}` : ''}`);
        
        const db = window.db || (window.firebase && window.firebase.firestore());
        if (!db) return;

        try {
            const divisionName = division ? slugToDivisionName(division) : null;
            
            let query = db.collection('games');
            
            // Filter by division
            if (divisionName) {
                query = query.where('division', '==', divisionName);
            }
            
            // Filter by team if specified
            if (teamFilter) {
                query = query.where('teams', 'array-contains', teamFilter);
            }
            
            // Only completed games
            query = query.where('status', '==', 'completed')
                        .orderBy('date', 'desc')
                        .limit(10);
            
            const snapshot = await query.get();
            const games = [];
            snapshot.forEach(doc => {
                games.push({ id: doc.id, ...doc.data() });
            });
            
            displayPastResultsSection(games);
            
        } catch (error) {
            console.error('❌ Error loading past results:', error);
        }
    }

    async function loadCurrentWeekGames(division, teamFilter = null) {
        console.log(`📅 Loading current week games for ${division}${teamFilter ? ` filtered by team: ${teamFilter}` : ''}`);
        
        const db = window.db || (window.firebase && window.firebase.firestore());
        if (!db) return;

        try {
            const divisionName = division ? slugToDivisionName(division) : null;
            
            // Calculate current week number (assuming season starts on a specific date)
            const currentDate = new Date();
            const currentWeekNumber = getCurrentWeekNumber();
            
            let query = db.collection('games');
            
            // Filter by division
            if (divisionName) {
                query = query.where('division', '==', divisionName);
            }
            
            // Filter by team if specified
            if (teamFilter) {
                query = query.where('teams', 'array-contains', teamFilter);
            }
            
            // Try to get current week's games first
            let weekQuery = query.where('status', 'in', ['scheduled', 'live']);
            
            // Add week filter if available, with fallback for games without week numbers
            if (currentWeekNumber) {
                weekQuery = weekQuery.where('week', '==', currentWeekNumber);
            }
            
            let snapshot = await weekQuery.orderBy('date', 'asc').limit(10).get();
            let games = [];
            snapshot.forEach(doc => {
                games.push({ id: doc.id, ...doc.data() });
            });
            
            // Fallback: if no games found with week number, get upcoming games by date
            if (games.length === 0) {
                console.log('📅 No games found for current week, falling back to upcoming games');
                const startOfWeek = getStartOfWeek(currentDate);
                const endOfWeek = getEndOfWeek(currentDate);
                
                let fallbackQuery = db.collection('games');
                if (divisionName) {
                    fallbackQuery = fallbackQuery.where('division', '==', divisionName);
                }
                if (teamFilter) {
                    fallbackQuery = fallbackQuery.where('teams', 'array-contains', teamFilter);
                }
                
                fallbackQuery = fallbackQuery.where('status', 'in', ['scheduled', 'live'])
                                           .where('date', '>=', startOfWeek)
                                           .where('date', '<=', endOfWeek)
                                           .orderBy('date', 'asc')
                                           .limit(10);
                
                try {
                    snapshot = await fallbackQuery.get();
                    games = [];
                    snapshot.forEach(doc => {
                        games.push({ id: doc.id, ...doc.data() });
                    });
                } catch (fallbackError) {
                    console.log('📅 Date range query failed, getting next upcoming games');
                    // Final fallback: just get next upcoming games
                    let finalQuery = db.collection('games');
                    if (divisionName) {
                        finalQuery = finalQuery.where('division', '==', divisionName);
                    }
                    if (teamFilter) {
                        finalQuery = finalQuery.where('teams', 'array-contains', teamFilter);
                    }
                    finalQuery = finalQuery.where('status', 'in', ['scheduled', 'live'])
                                         .orderBy('date', 'asc')
                                         .limit(5);
                    
                    const finalSnapshot = await finalQuery.get();
                    games = [];
                    finalSnapshot.forEach(doc => {
                        games.push({ id: doc.id, ...doc.data() });
                    });
                }
            }
            
            displayCurrentWeekGames(games);
            
        } catch (error) {
            console.error('❌ Error loading current week games:', error);
            // Show fallback message
            displayCurrentWeekGames([]);
        }
    }
    
    function getCurrentWeekNumber() {
        // Calculate week number based on season start date
        const seasonStart = new Date('2026-01-01'); // Adjust to actual season start
        const currentDate = new Date();
        const diffTime = currentDate - seasonStart;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    }
    
    function getStartOfWeek(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }
    
    function getEndOfWeek(date) {
        const end = new Date(date);
        const day = end.getDay();
        const diff = end.getDate() + (6 - day) + (day === 0 ? 0 : 1);
        end.setDate(diff);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    function displayPastResultsSection(games) {
        const pastResults = document.getElementById('pastResults');
        if (!pastResults) return;
        
        if (games.length === 0) {
            pastResults.innerHTML = '<p style="text-align: center; color: #888; font-style: italic; padding: 2rem;">📊 No past results found</p>';
            return;
        }
        
        const gameCards = games.map(game => renderGameCard(game)).join('');
        pastResults.innerHTML = `<div class="games-grid">${gameCards}</div>`;
    }

    function displayCurrentWeekGames(games) {
        const thisWeekGames = document.getElementById('thisWeekGames');
        if (!thisWeekGames) return;
        
        if (games.length === 0) {
            thisWeekGames.innerHTML = '<p style="text-align: center; color: #888; font-style: italic; padding: 2rem;">📅 No games scheduled this week</p>';
            return;
        }
        
        const gameCards = games.map(game => renderGameCard(game)).join('');
        thisWeekGames.innerHTML = `<div class="games-grid">${gameCards}</div>`;
    }

    // ==================== TEAM FILTERING FUNCTIONALITY ====================
    
    let currentTeamFilter = null;
    
    function getUrlParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    function setUrlParameter(param, value) {
        const url = new URL(window.location.href);
        if (value) {
            url.searchParams.set(param, value);
        } else {
            url.searchParams.delete(param);
        }
        window.history.replaceState({}, '', url);
    }
    
    function initializeTeamFilter() {
        console.log('🎯 Initializing team filter...');
        
        // Check for team parameter in URL
        const teamParam = getUrlParameter('team');
        if (teamParam) {
            console.log(`🔗 Found team parameter in URL: ${teamParam}`);
            applyTeamFilter(decodeURIComponent(teamParam), false);
        }
        
        // Add click handlers to team names in standings
        setupTeamClickHandlers();
        
        // Setup clear filter button
        setupClearFilterButton();
    }
    
    function setupTeamClickHandlers() {
        console.log('👆 Setting up team click handlers...');
        
        // Wait for standings to load, then add click handlers
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const standingsTable = document.querySelector('.standings-table tbody');
                    if (standingsTable && standingsTable.children.length > 0) {
                        // Check if we have actual team rows (not just loading message)
                        const firstRow = standingsTable.children[0];
                        if (!firstRow.innerHTML.includes('Loading')) {
                            addTeamClickEvents();
                            observer.disconnect();
                        }
                    }
                }
            });
        });
        
        const standingsContainer = document.getElementById('standingsBody');
        if (standingsContainer) {
            observer.observe(standingsContainer, { childList: true, subtree: true });
        }
        
        // Also try to add immediately if standings already loaded
        setTimeout(() => addTeamClickEvents(), 2000);
    }
    
    function addTeamClickEvents() {
        const standingsRows = document.querySelectorAll('.standings-table tbody tr');
        console.log(`👆 Adding click events to ${standingsRows.length} team rows`);
        
        standingsRows.forEach((row, index) => {
            const teamCell = row.children[1]; // Team name is in the second column
            if (teamCell && !teamCell.innerHTML.includes('Loading')) {
                const teamName = teamCell.textContent.trim();
                
                if (teamName && teamName !== 'Unnamed Team') {
                    // Add data attribute for team name
                    row.setAttribute('data-team-name', teamName);
                    
                    // Make team name clickable
                    const teamNameSpan = teamCell.querySelector('.team-name') || teamCell;
                    teamNameSpan.classList.add('team-name');
                    teamNameSpan.style.cursor = 'pointer';
                    
                    // Add click handler
                    row.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log(`🎯 Team clicked: ${teamName}`);
                        applyTeamFilter(teamName, true);
                    });
                    
                    console.log(`✅ Added click handler for team: ${teamName}`);
                }
            }
        });
    }
    
    function applyTeamFilter(teamName, updateUrl = true) {
        console.log(`🔽 Applying team filter: ${teamName}`);
        
        currentTeamFilter = teamName;
        
        // Update URL if requested
        if (updateUrl) {
            setUrlParameter('team', teamName);
        }
        
        // Show filter banner
        showFilterBanner(teamName);
        
        // Apply visual states to standings table
        appBarbarian SportstandingsFilterVisuals(teamName);
        
        // Reload data with team filter
        const currentDivision = getCurrentDivision();
        if (currentDivision) {
            loadCurrentWeekGames(currentDivision, teamName);
            loadPastResults(currentDivision, teamName);
            displayLeaderboard(currentDivision, teamName);
        }
        
        console.log(`✅ Team filter applied: ${teamName}`);
    }
    
    function showFilterBanner(teamName) {
        const filterBanner = document.getElementById('filterBanner');
        const filterTeamName = document.getElementById('filterTeamName');
        
        if (filterBanner && filterTeamName) {
            filterTeamName.textContent = teamName;
            filterBanner.style.display = 'flex';
            console.log(`📊 Filter banner shown for: ${teamName}`);
        }
    }
    
    function hideFilterBanner() {
        const filterBanner = document.getElementById('filterBanner');
        if (filterBanner) {
            filterBanner.style.display = 'none';
            console.log('📊 Filter banner hidden');
        }
    }
    
    function appBarbarian SportstandingsFilterVisuals(selectedTeam) {
        const standingsRows = document.querySelectorAll('.standings-table tbody tr');
        
        // Add team-filter-active class to body
        document.body.classList.add('team-filter-active');
        
        standingsRows.forEach(row => {
            const teamName = row.getAttribute('data-team-name');
            
            if (teamName === selectedTeam) {
                row.classList.add('selected-team');
                console.log(`✅ Selected team row: ${teamName}`);
            } else {
                row.classList.remove('selected-team');
            }
        });
    }
    
    function clearTeamFilter() {
        console.log('🧹 Clearing team filter...');
        
        currentTeamFilter = null;
        
        // Update URL
        setUrlParameter('team', null);
        
        // Hide filter banner
        hideFilterBanner();
        
        // Remove visual states
        document.body.classList.remove('team-filter-active');
        
        document.querySelectorAll('.standings-table tbody tr').forEach(row => {
            row.classList.remove('selected-team');
        });
        
        // Reload data without filter
        const currentDivision = getCurrentDivision();
        if (currentDivision) {
            loadCurrentWeekGames(currentDivision);
            loadPastResults(currentDivision);
            displayLeaderboard(currentDivision);
        }
        
        console.log('✅ Team filter cleared');
    }
    
    function setupClearFilterButton() {
        const clearFilterBtn = document.getElementById('clearFilter');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', clearTeamFilter);
            console.log('🧹 Clear filter button setup complete');
        }
    }

    // ==================== PUBLIC API ====================
    
    // Expose functions for external use
    window.BarbarianDivisionFilter = {
        initialize: initializeDivisionFiltering,
        displaySchedule,
        displayStandings,
        displayLeaderboard,
        getCurrentDivision,
        DIVISIONS
    };

    // Robust Firebase initialization
    let initAttempts = 0;
    const maxAttempts = 20; // 10 seconds max
    
    function initializeWhenReady() {
        initAttempts++;
        
        // Check if Firebase is ready
        if (window.firebase && window.firebase.firestore && (window.db || firebase.apps.length > 0)) {
            if (!window.db) {
                window.db = firebase.firestore();
            }
            console.log(`🔥 Firebase ready (attempt ${initAttempts}), initializing division filtering...`);
            initializeDivisionFiltering();
            return;
        }
        
        // If Firebase scripts are loaded but not initialized, try to initialize
        if (window.firebase && window.firebase.firestore && !window.db) {
            try {
                const firebaseConfig = {
                    apiKey: "AIzaSyCj6-5BP9S1z2quiMkCExssDZHHeiaZKsI",
                    authDomain: "cotb26.firebaseapp.com",
                    projectId: "cotb26",
                    storageBucket: "cotb26.firebasestorage.app",
                    messagingSenderId: "118067786266",
                    appId: "1:118067786266:web:e0eb37eaf9492181e757a3"
                };
                
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                window.db = firebase.firestore();
                console.log(`🔥 Firebase initialized by division filter (attempt ${initAttempts})`);
                initializeDivisionFiltering();
                return;
            } catch (error) {
                console.error(`❌ Failed to initialize Firebase in division filter (attempt ${initAttempts}):`, error);
            }
        }
        
        // Keep trying every 500ms for up to 10 seconds
        if (initAttempts < maxAttempts) {
            console.log(`⏳ Waiting for Firebase... (attempt ${initAttempts}/${maxAttempts})`);
            setTimeout(initializeWhenReady, 500);
        } else {
            console.error('❌ Failed to initialize Firebase after maximum attempts');
        }
    }

    // Start initialization check
    setTimeout(initializeWhenReady, 2000); // Wait 2 seconds initially

    console.log('✅ Division Filter Module Loaded');

})();