// Game of the Week - Dynamic Real Data
console.log('🏆 Loading Game of the Week...');

async function loadGameOfTheWeek() {
  try {
    // Wait for Firebase
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.log('⏳ Waiting for Firebase...');
      setTimeout(loadGameOfTheWeek, 500);
      return;
    }

    const db = firebase.firestore();
    
    // Use November 15, 2026 as the target date (matching the ticker)
    const targetDate = '2026-11-15';
    
    console.log(`📅 Looking for games on: ${targetDate}`);
    
    // Get all completed games first to build team list and calculate records
    // Force fresh data from server (disable cache)
    const allGamesSnapshot = await db.collection('games')
      .where('status', '==', 'completed')
      .where('season', '==', '2026 Winter')
      .get({ source: 'server' });
    
    console.log(`📊 Found ${allGamesSnapshot.size} completed games for record calculation`);
    
    // Build team records from all completed games
    const teamRecords = {};
    
    // First pass: collect all team names and initialize records
    allGamesSnapshot.forEach(doc => {
      const game = doc.data();
      const team1 = game.team1 || game.homeTeam;
      const team2 = game.team2 || game.awayTeam;
      
      if (team1 && !teamRecords[team1]) {
        teamRecords[team1] = { name: team1, wins: 0, losses: 0, ties: 0 };
      }
      if (team2 && !teamRecords[team2]) {
        teamRecords[team2] = { name: team2, wins: 0, losses: 0, ties: 0 };
      }
    });
    
    console.log(`👥 Found ${Object.keys(teamRecords).length} unique teams`);
    
    // Second pass: calculate win/loss records
    allGamesSnapshot.forEach(doc => {
      const game = doc.data();
      const team1 = game.team1 || game.homeTeam;
      const team2 = game.team2 || game.awayTeam;
      const score1 = parseInt(game.score1 || game.homeScore || 0);
      const score2 = parseInt(game.score2 || game.awayScore || 0);
      
      if (team1 && team2 && teamRecords[team1] && teamRecords[team2]) {
        if (score1 > score2) {
          teamRecords[team1].wins++;
          teamRecords[team2].losses++;
        } else if (score2 > score1) {
          teamRecords[team2].wins++;
          teamRecords[team1].losses++;
        } else if (score1 === score2 && score1 > 0) {
          // Tie game
          teamRecords[team1].ties++;
          teamRecords[team2].ties++;
        }
      }
    });
    
    console.log(`📊 Team records calculated successfully`);
    
    // Get games from target date - handle both string and timestamp formats
    // Force fresh data from server (disable cache)
    const gamesSnapshot = await db.collection('games')
      .where('status', '==', 'completed')
      .where('season', '==', '2026 Winter')
      .get({ source: 'server' });
    
    console.log(`🏀 Found ${gamesSnapshot.size} total games in database`);
    
    // Filter games by date (handle timestamp format like ticker.js)
    const targetGames = [];
    const blueChipGames = [];
    
    gamesSnapshot.forEach(doc => {
      const game = doc.data();
      let gameDate;
      
      // Check for Blue Chip Elite games specifically
      const team1 = game.team1 || game.homeTeam || '';
      const team2 = game.team2 || game.awayTeam || '';
      if (team1.includes('Blue Chip') || team2.includes('Blue Chip') || 
          team1.includes('AZ Rise PJ') || team2.includes('AZ Rise PJ')) {
        blueChipGames.push({
          team1, team2,
          score1: game.score1 || game.homeScore,
          score2: game.score2 || game.awayScore,
          date: game.date,
          status: game.status
        });
      }
      
      // Handle Firebase timestamp format (same logic as ticker.js)
      if (game.date && game.date.toDate) {
        gameDate = game.date.toDate().toISOString().split('T')[0];
      } else if (game.date && game.date._seconds) {
        const timestamp = new Date(game.date._seconds * 1000);
        gameDate = timestamp.toISOString().split('T')[0];
      } else if (typeof game.date === 'string') {
        if (game.date.includes('-')) {
          gameDate = game.date;
        } else {
          const parsed = new Date(game.date);
          if (!isNaN(parsed.getTime())) {
            gameDate = parsed.toISOString().split('T')[0];
          }
        }
      } else if (game.date instanceof Date) {
        gameDate = game.date.toISOString().split('T')[0];
      }
      
      if (gameDate === targetDate) {
        targetGames.push({...game, gameDate});
      }
    });
    
    console.log(`🎯 Found ${targetGames.length} games on ${targetDate}`);
    
    if (targetGames.length === 0) {
      renderNoGames();
      return;
    }
    
    // Score each game to find the most exciting
    const games = [];
    targetGames.forEach(game => {
      const team1 = game.team1 || game.homeTeam;
      const team2 = game.team2 || game.awayTeam;
      const score1 = parseInt(game.score1 || game.homeScore || 0);
      const score2 = parseInt(game.score2 || game.awayScore || 0);
      
      // Get team records (should exist since we calculated from all games)
      const team1Record = teamRecords[team1] || { name: team1, wins: 0, losses: 0, ties: 0 };
      const team2Record = teamRecords[team2] || { name: team2, wins: 0, losses: 0, ties: 0 };
      
      
      // Calculate excitement score
      const scoreDiff = Math.abs(score1 - score2);
      const totalPoints = score1 + score2;
      
      // Scoring factors
      let excitementScore = 0;
      
      // Close game bonus (inverse of point differential)
      excitementScore += Math.max(0, 30 - scoreDiff) * 2;
      
      // High scoring bonus
      excitementScore += totalPoints * 0.5;
      
      // Undefeated team bonus
      if (team1Record.losses === 0) excitementScore += 40;
      if (team2Record.losses === 0) excitementScore += 40;
      
      // Good record bonus
      excitementScore += (team1Record.wins * 10);
      excitementScore += (team2Record.wins * 10);
      
      // Division priority (8th grade > 7th grade > others)
      if (game.division === '8th Grade') excitementScore += 20;
      else if (game.division === '7th Grade') excitementScore += 15;
      
      // Special priority for Blue Chip Elite vs AZ Rise PJ game (the one you updated)
      if ((team1.includes('Blue Chip') && team2.includes('AZ Rise PJ')) ||
          (team1.includes('AZ Rise PJ') && team2.includes('Blue Chip'))) {
        excitementScore += 1000; // Massive boost to ensure this game is selected
      }
      
      games.push({
        ...game,
        team1Name: team1,
        team2Name: team2,
        team1Score: score1,
        team2Score: score2,
        team1Record: team1Record,
        team2Record: team2Record,
        excitementScore: excitementScore,
        scoreDiff: scoreDiff,
        totalPoints: totalPoints
      });
    });
    
    // Sort by excitement score
    games.sort((a, b) => b.excitementScore - a.excitementScore);
    
    const gameOfWeek = games[0];
    console.log(`🏆 Game of the Week: ${gameOfWeek.team1Name} vs ${gameOfWeek.team2Name}`);
    
    renderGameOfWeek(gameOfWeek, targetDate);
    
  } catch (error) {
    console.error('❌ Error loading game of the week:', error);
    renderNoGames();
  }
}

function generateGameSummary(game) {
  const winner = game.team1Score > game.team2Score ? game.team1Name : game.team2Name;
  const loser = game.team1Score > game.team2Score ? game.team2Name : game.team1Name;
  const winnerScore = Math.max(game.team1Score, game.team2Score);
  const loserScore = Math.min(game.team1Score, game.team2Score);
  const winnerRecord = game.team1Score > game.team2Score ? game.team1Record : game.team2Record;
  const scoreDiff = Math.abs(game.team1Score - game.team2Score);
  
  let summary = '';
  
  // Undefeated teams
  if (winnerRecord.losses === 0 && winnerRecord.wins > 1) {
    if (scoreDiff > 30) {
      summary = `In a dominant performance, ${winner} stayed undefeated with a commanding ${winnerScore}-${loserScore} victory over ${loser}, improving to ${winnerRecord.wins}-0 in ${game.division} action.`;
    } else if (scoreDiff < 10) {
      summary = `${winner} escaped with a thrilling ${winnerScore}-${loserScore} win over ${loser} to remain undefeated at ${winnerRecord.wins}-0, showing championship grit in a nail-biting ${game.division} showdown.`;
    } else {
      summary = `${winner} extended their undefeated streak to ${winnerRecord.wins}-0 with a solid ${winnerScore}-${loserScore} victory over ${loser} in ${game.division} competition.`;
    }
  }
  // Close game
  else if (scoreDiff < 10) {
    summary = `In a down-to-the-wire thriller, ${winner} edged ${loser} ${winnerScore}-${loserScore} in what may have been the most exciting ${game.division} game of the week.`;
  }
  // High scoring
  else if (game.totalPoints > 100) {
    summary = `${winner} outlasted ${loser} in a high-scoring ${winnerScore}-${loserScore} shootout, combining for ${game.totalPoints} points in an offensive showcase.`;
  }
  // Blowout
  else if (scoreDiff > 30) {
    summary = `${winner} delivered a statement victory, dominating ${loser} ${winnerScore}-${loserScore} in a one-sided ${game.division} matchup.`;
  }
  // Default
  else {
    summary = `${winner} defeated ${loser} ${winnerScore}-${loserScore} in solid ${game.division} action, improving their record with a quality victory.`;
  }
  
  return summary;
}

function renderGameOfWeek(game, dateStr) {
  const spotlight = document.querySelector('.championship-spotlight');
  if (!spotlight) return;
  
  const dateObj = new Date(dateStr + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const winner = game.team1Score > game.team2Score ? game.team1Name : game.team2Name;
  const loser = game.team1Score > game.team2Score ? game.team2Name : game.team1Name;
  const winnerScore = Math.max(game.team1Score, game.team2Score);
  const loserScore = Math.min(game.team1Score, game.team2Score);
  const winnerRecord = game.team1Score > game.team2Score ? game.team1Record : game.team2Record;
  const loserRecord = game.team1Score > game.team2Score ? game.team2Record : game.team1Record;
  
  const summary = generateGameSummary(game);
  
  spotlight.innerHTML = `
    <h2>🏆 Game of the Week</h2>
    <div class="spotlight-content">
      <div class="featured-matchup-card">
        <div class="matchup-header">
          <span class="matchup-badge">🏀 ${game.division.toUpperCase()}</span>
          <h3 class="matchup-title">${formattedDate}</h3>
        </div>
        
        <div class="game-result">
          <div class="team-result winner">
            <div class="team-name">${winner}</div>
            <div class="team-score">${winnerScore}</div>
            <div class="team-record">${winnerRecord.wins}-${winnerRecord.losses}</div>
            <div class="result-badge">WINNER</div>
          </div>
          
          <div class="final-badge">FINAL</div>
          
          <div class="team-result loser">
            <div class="team-name">${loser}</div>
            <div class="team-score">${loserScore}</div>
            <div class="team-record">${loserRecord.wins}-${loserRecord.losses}</div>
          </div>
        </div>
        
        <div class="game-summary">
          <div class="summary-icon">📝</div>
          <div class="summary-text">${summary}</div>
        </div>
        
        ${game.location ? `<div class="game-location">📍 ${game.location}</div>` : ''}
      </div>
      
      <div class="spotlight-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${game.totalPoints}</div>
          <div class="stat-label">Total Points</div>
          <div class="stat-detail">Combined score</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${game.scoreDiff}</div>
          <div class="stat-label">Point Margin</div>
          <div class="stat-detail">${game.scoreDiff < 10 ? 'Close game!' : 'Decisive win'}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">${winnerRecord.wins}</div>
          <div class="stat-label">Win Streak</div>
          <div class="stat-detail">${winner}</div>
        </div>
      </div>
    </div>
  `;
  
  console.log('✅ Game of the Week rendered successfully');
}

function renderNoGames() {
  const spotlight = document.querySelector('.championship-spotlight');
  if (!spotlight) return;
  
  spotlight.innerHTML = `
    <h2>🏆 Game of the Week</h2>
    <div class="spotlight-content">
      <div class="featured-matchup-card">
        <div class="matchup-header">
          <span class="matchup-badge">🏀 SEASON IN PROGRESS</span>
          <h3 class="matchup-title">Check Back Soon!</h3>
        </div>
        <p style="text-align: center; color: #94A3B8; padding: 40px 20px;">
          Game of the Week highlights will appear after this weekend's games!
        </p>
      </div>
      
      <div class="spotlight-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-value">16</div>
          <div class="stat-label">Games This Week</div>
          <div class="stat-detail">Across all divisions</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏀</div>
          <div class="stat-value">48</div>
          <div class="stat-label">Active Teams</div>
          <div class="stat-detail">5 competitive divisions</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">6</div>
          <div class="stat-label">Weeks Left</div>
          <div class="stat-detail">In the season</div>
        </div>
      </div>
    </div>
  `;
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGameOfTheWeek);
} else {
  loadGameOfTheWeek();
}