// ticker.js - COTB26 Tournament Ticker v4.0
// Updated to show scores for completed games (status = 'final')

console.log('🎯 COTB26 Tournament Ticker v4.0 loading...');

// Detect current page division for filtering
function getCurrentDivisionForTicker() {
  // Check URL for COTB26 division slug (10u, 11u, 12u, 13u, 14u)
  const path = window.location.pathname;
  const divisionMatch = path.match(/(10u|11u|12u|13u|14u)\.html/i);

  if (!divisionMatch) {
    console.log('🏠 TICKER: Main page detected - showing all divisions');
    return null; // Home page - show all games
  }

  // Map URL slug to Firebase division names for COTB26
  const divisionMapping = {
    '10u': '10U (5th)',
    '11u': '11U (5th)',
    '12u': '12U (6th)',
    '13u': '13U (7th)',
    '14u': '14U (8th)'
  };

  const slug = divisionMatch[1].toLowerCase();
  const division = divisionMapping[slug];
  console.log(`🎯 TICKER: Division page detected: '${slug}' → '${division}'`);
  return division;
}

// Get most recent Saturday
function getMostRecentSaturday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // If today is Saturday (6), use today. Otherwise, get previous Saturday.
  const daysToSubtract = dayOfWeek === 6 ? 0 : (dayOfWeek + 1);
  const saturday = new Date(today);
  saturday.setDate(today.getDate() - daysToSubtract);
  saturday.setHours(0, 0, 0, 0);
  
  return saturday;
}

// Format date for Firebase query (YYYY-MM-DD)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initialize ticker
async function initializeTicker() {
  console.log('🎯 Initializing ticker...');
  
  const tickerTrack = document.querySelector('.ticker-track');
  if (!tickerTrack) {
    console.log('❌ No .ticker-track element found');
    return;
  }

  // Wait for Firebase
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    console.log('⏳ Waiting for Firebase...');
    setTimeout(initializeTicker, 500);
    return;
  }

  try {
    // TOURNAMENT MODE: Get ALL games ordered by scheduledFor time
    console.log(`🎯 TICKER: Loading tournament schedule (all games)`);

    // Get all games from Firebase ordered by time
    const gamesRef = firebase.firestore().collection('games');
    const snapshot = await gamesRef.orderBy('scheduledFor', 'asc').get();
    
    if (snapshot.size === 0) {
      console.log(`❌ TICKER: No games found in database`);
      tickerTrack.innerHTML = '<span>🏀 Tournament Schedule Coming Soon! | January 10, 2026 | 25 Games | 5 Divisions</span>';
      return;
    }

    const allGames = [];
    
    snapshot.forEach(doc => {
      const game = doc.data();
      allGames.push(game);
    });

    console.log(`🎯 TICKER: Found ${allGames.length} total games in tournament`);

    // Filter games by current division
    const currentDivision = getCurrentDivisionForTicker();
    
    const filteredGames = currentDivision 
      ? allGames.filter(game => game.division === currentDivision)
      : allGames; // Home page shows all games

    console.log(`🎯 TICKER: Showing ${filteredGames.length} games for "${currentDivision || 'all divisions'}"`);

    if (filteredGames.length === 0) {
      const message = currentDivision 
        ? `<span>🏀 No ${currentDivision} games scheduled • Tournament: January 10, 2026</span>`
        : '<span>🏀 Tournament Schedule Coming Soon! | January 10, 2026 | 25 Games | 5 Divisions</span>';
      tickerTrack.innerHTML = message;
      return;
    }

    // Build ticker HTML from filtered games
    let tickerHTML = '';
    filteredGames.forEach((game, index) => {
      // Handle different field naming conventions and extract team names properly
      const team1 = typeof game.homeTeam === 'object' 
        ? (game.homeTeam?.name || game.homeTeamName || 'TBD') 
        : (game.homeTeam || game.team1 || game.homeTeamName || 'TBD');
      const team2 = typeof game.awayTeam === 'object' 
        ? (game.awayTeam?.name || game.awayTeamName || 'TBD') 
        : (game.awayTeam || game.team2 || game.awayTeamName || 'TBD');
      const division = game.division || 'Unknown Division';
      const status = game.status || 'scheduled';
      
      // Format time from scheduledFor
      let gameTime = '8:00 AM';
      if (game.scheduledFor && game.scheduledFor.toDate) {
        const date = game.scheduledFor.toDate();
        gameTime = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      // Format court info
      const court = game.court || 'Court 1';

      // Get short division name for all formats
      const shortDiv = division.match(/^(\d+U)/i)?.[1] || division.split(' ')[0];

      if (status === 'scheduled') {
        // Show as upcoming: "8:00 AM | Court 1 | 10U: Team A vs Team B"
        tickerHTML += `<span>${gameTime} | ${court} | ${shortDiv}: ${team1} vs ${team2}</span>`;
      } else if (status === 'in-progress' || status === 'live') {
        // Show live score: "🔴 LIVE | 10U: Team A 24 - Team B 18"
        const score1 = game.score1 || game.homeScore || 0;
        const score2 = game.score2 || game.awayScore || 0;
        tickerHTML += `<span class="ticker-live">🔴 LIVE | ${shortDiv}: ${team1} ${score1} - ${team2} ${score2}</span>`;
      } else if (status === 'completed' || status === 'final') {
        // Show final: "FINAL | 10U: Team A 45 - Team B 38"
        const score1 = game.score1 || game.homeScore || 0;
        const score2 = game.score2 || game.awayScore || 0;
        tickerHTML += `<span class="ticker-final">FINAL | ${shortDiv}: ${team1} ${score1} - ${team2} ${score2}</span>`;
      }
      
      // Add separator except after last item
      if (index < filteredGames.length - 1) {
        tickerHTML += '<span class="ticker-separator">•</span>';
      }
    });

    // Duplicate for seamless loop
    tickerTrack.innerHTML = tickerHTML + tickerHTML;
    console.log(`✅ Ticker initialized with ${filteredGames.length} filtered game(s) for ${currentDivision || 'all divisions'}`);

  } catch (error) {
    console.error('❌ Ticker error:', error);
    tickerTrack.innerHTML = '<span>🏀 Loading game results...</span>';
  }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTicker);
} else {
  initializeTicker();
}