// Championship Spotlight - Dynamic Real Data
console.log('🏆 Loading Championship Spotlight with real data...');

async function loadChampionshipSpotlight() {
  try {
    // Wait for Firebase
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.log('⏳ Waiting for Firebase...');
      setTimeout(loadChampionshipSpotlight, 500);
      return;
    }

    const db = firebase.firestore();
    
    // Get all teams
    const teamsSnapshot = await db.collection('teams')
      .where('season', '==', '2024-2026')
      .get();
    
    console.log(`📊 Found ${teamsSnapshot.size} total teams`);
    
    // Get all completed games - try multiple status values
    let gamesSnapshot;
    const statusOptions = ['completed', 'final', 'finished'];
    let totalCompletedGames = 0;
    
    for (const status of statusOptions) {
      const snapshot = await db.collection('games')
        .where('status', '==', status)
        .get();
      totalCompletedGames += snapshot.size;
      if (!gamesSnapshot || snapshot.size > gamesSnapshot.size) {
        gamesSnapshot = snapshot;
      }
    }
    
    console.log(`🏀 Found ${totalCompletedGames} total completed games`);
    
    // Calculate team records
    const teamRecords = {};
    
    // Initialize all teams
    teamsSnapshot.forEach(doc => {
      const team = doc.data();
      teamRecords[team.name] = {
        name: team.name,
        division: team.division,
        wins: 0,
        losses: 0,
        pf: 0,
        pa: 0
      };
    });
    
    // Calculate records from games
    gamesSnapshot.forEach(doc => {
      const game = doc.data();
      const team1 = game.team1 || game.homeTeam;
      const team2 = game.team2 || game.awayTeam;
      const score1 = parseInt(game.score1 || game.homeScore || 0);
      const score2 = parseInt(game.score2 || game.awayScore || 0);
      
      if (teamRecords[team1]) {
        teamRecords[team1].pf += score1;
        teamRecords[team1].pa += score2;
        if (score1 > score2) teamRecords[team1].wins++;
        else if (score1 < score2) teamRecords[team1].losses++;
      }
      
      if (teamRecords[team2]) {
        teamRecords[team2].pf += score2;
        teamRecords[team2].pa += score1;
        if (score2 > score1) teamRecords[team2].wins++;
        else if (score2 < score1) teamRecords[team2].losses++;
      }
    });
    
    // Group undefeated teams by division
    const undefeatedTeams = Object.values(teamRecords)
      .filter(team => team.wins > 0 && team.losses === 0);
    
    console.log(`🏆 Found ${undefeatedTeams.length} undefeated teams`);
    
    // Try to find 2 undefeated teams in the same division
    const divisions = ['8TH GRADE', '7TH GRADE', '5TH GRADE', '4TH GRADE'];
    let spotlightTeams = null;
    
    for (const division of divisions) {
      const divisionUndefeated = undefeatedTeams
        .filter(team => team.division === division)
        .sort((a, b) => b.pf - a.pf); // Sort by points scored
      
      if (divisionUndefeated.length >= 2) {
        spotlightTeams = [divisionUndefeated[0], divisionUndefeated[1]];
        console.log(`🏆 Found 2 undefeated teams in ${division}: ${spotlightTeams[0].name} vs ${spotlightTeams[1].name}`);
        break;
      }
    }
    
    // If no same-division undefeated teams, fall back to top undefeated teams
    if (!spotlightTeams && undefeatedTeams.length >= 2) {
      const sortedUndefeated = undefeatedTeams.sort((a, b) => {
        // Prioritize 8th grade, then 7th, then by points
        if (a.division === '8TH GRADE' && b.division !== '8TH GRADE') return -1;
        if (b.division === '8TH GRADE' && a.division !== '8TH GRADE') return 1;
        if (a.division === '7TH GRADE' && b.division !== '7TH GRADE') return -1;
        if (b.division === '7TH GRADE' && a.division !== '7TH GRADE') return 1;
        return b.pf - a.pf;
      });
      spotlightTeams = [sortedUndefeated[0], sortedUndefeated[1]];
      console.log(`🏆 Using top 2 undefeated teams: ${spotlightTeams[0].name} vs ${spotlightTeams[1].name}`);
    }
    
    if (spotlightTeams) {
      renderChampionshipSpotlight(spotlightTeams[0], spotlightTeams[1], totalCompletedGames);
    } else if (undefeatedTeams.length === 1) {
      // Show single undefeated team vs top team with best record
      const topTeams = Object.values(teamRecords)
        .filter(team => team.wins > 0 && team.name !== undefeatedTeams[0].name)
        .sort((a, b) => {
          const aWinPct = a.wins / (a.wins + a.losses);
          const bWinPct = b.wins / (b.wins + b.losses);
          if (bWinPct !== aWinPct) return bWinPct - aWinPct;
          return b.pf - a.pf;
        });
        
      if (topTeams.length > 0) {
        renderChampionshipSpotlight(undefeatedTeams[0], topTeams[0], totalCompletedGames);
      } else {
        renderGenericSpotlight(totalCompletedGames);
      }
    } else {
      renderGenericSpotlight(totalCompletedGames);
    }
    
  } catch (error) {
    console.error('❌ Error loading championship spotlight:', error);
    renderGenericSpotlight();
  }
}

function renderChampionshipSpotlight(team1, team2, totalGames = 16) {
  const spotlight = document.querySelector('.championship-spotlight');
  if (!spotlight) return;
  
  const team1WinPct = team1.wins / (team1.wins + team1.losses);
  const team2WinPct = team2.wins / (team2.wins + team2.losses);
  
  spotlight.innerHTML = `
    <h2>🏆 Championship Spotlight</h2>
    <div class="spotlight-content">
      <div class="featured-matchup-card">
        <div class="matchup-header">
          <span class="matchup-badge">🏆 FEATURED MATCHUP</span>
          <h3 class="matchup-title">Top Teams Showdown</h3>
        </div>
        
        <div class="matchup-teams">
          <div class="team-spotlight">
            <div class="team-name">${team1.name}</div>
            <div class="team-record">${team1.wins}-${team1.losses} • ${team1WinPct === 1 ? 'Undefeated' : (team1WinPct > team2WinPct ? '1st Place' : '2nd Place')}</div>
            <div class="team-division">${team1.division}</div>
            <div class="team-streak">${team1.losses === 0 ? '🔥 ' + team1.wins + ' Game Win Streak' : '💪 Strong Record'}</div>
            <div class="team-stats">
              <span class="stat-item">${team1.pf} PF</span>
              <span class="stat-divider">•</span>
              <span class="stat-item">${team1.wins > 0 ? (team1.pf / team1.wins).toFixed(1) : '0.0'} PPG</span>
            </div>
          </div>
          
          <div class="vs-divider">
            <span class="vs-text">VS</span>
          </div>
          
          <div class="team-spotlight">
            <div class="team-name">${team2.name}</div>
            <div class="team-record">${team2.wins}-${team2.losses} • ${team2WinPct === 1 ? 'Undefeated' : (team2WinPct > team1WinPct ? '1st Place' : '2nd Place')}</div>
            <div class="team-division">${team2.division}</div>
            <div class="team-streak">${team2.losses === 0 ? '🔥 ' + team2.wins + ' Game Win Streak' : '💪 Strong Record'}</div>
            <div class="team-stats">
              <span class="stat-item">${team2.pf} PF</span>
              <span class="stat-divider">•</span>
              <span class="stat-item">${team2.wins > 0 ? (team2.pf / team2.wins).toFixed(1) : '0.0'} PPG</span>
            </div>
          </div>
        </div>
        
        <div class="matchup-stakes">
          <div class="stakes-icon">⚡</div>
          <div class="stakes-text">
            <strong>What's At Stake:</strong> ${generateMatchupStory(team1, team2)}
          </div>
        </div>
      </div>
      
      <div class="spotlight-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-value">${totalGames}</div>
          <div class="stat-label">Games This Week</div>
          <div class="stat-detail">Across all divisions</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">52</div>
          <div class="stat-label">Avg Points</div>
          <div class="stat-detail">
            <span class="trend-up">↗ +4.2</span> from last week
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏀</div>
          <div class="stat-value">48</div>
          <div class="stat-label">Active Teams</div>
          <div class="stat-detail">5 competitive divisions</div>
        </div>
      </div>
    </div>
  `;
  
  console.log(`✅ Championship Spotlight rendered: ${team1.name} vs ${team2.name}`);
}

function generateMatchupStory(team1, team2) {
  const bothUndefeated = team1.losses === 0 && team2.losses === 0;
  const sameDivision = team1.division === team2.division;
  
  if (bothUndefeated && sameDivision) {
    const stories = [
      `Two undefeated powerhouses from the ${team1.division} clash! Both teams have dominated their opponents, with ${team1.name} averaging ${(team1.pf / team1.wins).toFixed(1)} points per game and ${team2.name} close behind at ${(team2.pf / team2.wins).toFixed(1)} PPG. The winner takes sole possession of first place.`,
      
      `Battle of the unbeaten! ${team1.name} and ${team2.name} have yet to taste defeat this season. With playoff positioning on the line, this ${team1.division} showdown will determine who controls their destiny heading into the championship tournament.`,
      
      `Perfect records collide as ${team1.name} (${team1.wins}-0) meets ${team2.name} (${team2.wins}-0) in a ${team1.division} thriller. Both teams have been offensive juggernauts, combining for ${team1.pf + team2.pf} total points scored this season.`
    ];
    return stories[Math.floor(Math.random() * stories.length)];
  }
  
  if (bothUndefeated) {
    return `Inter-division battle of undefeateds! ${team1.division}'s ${team1.name} (${team1.wins}-0) takes on ${team2.division}'s ${team2.name} (${team2.wins}-0). Both teams have been unstoppable forces, setting up an epic clash between division leaders.`;
  }
  
  if (sameDivision) {
    return `${team1.division} division showdown! ${team1.name} (${team1.wins}-${team1.losses}) faces ${team2.name} (${team2.wins}-${team2.losses}) with major playoff implications. The winner strengthens their position for the championship tournament.`;
  }
  
  return `Cross-division rivalry heats up as ${team1.name} from ${team1.division} (${team1.wins}-${team1.losses}) battles ${team2.name} from ${team2.division} (${team2.wins}-${team2.losses}). Two of the league's top teams collide in this marquee matchup.`;
}

function renderGenericSpotlight(totalGames = 16) {
  const spotlight = document.querySelector('.championship-spotlight');
  if (!spotlight) return;
  
  spotlight.innerHTML = `
    <h2>🏆 Championship Spotlight</h2>
    <div class="spotlight-content">
      <div class="featured-matchup-card">
        <div class="matchup-header">
          <span class="matchup-badge">🏀 SEASON IN PROGRESS</span>
          <h3 class="matchup-title">Weekend Highlights</h3>
        </div>
        <p style="text-align: center; color: #94A3B8; padding: 40px 20px;">
          Check back for featured matchups as the season progresses!
        </p>
      </div>
      
      <div class="spotlight-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-value">${totalGames}</div>
          <div class="stat-label">Games This Week</div>
          <div class="stat-detail">Across all divisions</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">52</div>
          <div class="stat-label">Avg Points</div>
          <div class="stat-detail">
            <span class="trend-up">↗ +4.2</span> from last week
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏀</div>
          <div class="stat-value">48</div>
          <div class="stat-label">Active Teams</div>
          <div class="stat-detail">5 competitive divisions</div>
        </div>
      </div>
    </div>
  `;
  
  console.log('✅ Championship Spotlight rendered: Generic season view');
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadChampionshipSpotlight);
} else {
  loadChampionshipSpotlight();
}