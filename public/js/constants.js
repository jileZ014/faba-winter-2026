// FABA Winter 2026 - Application Constants

// Season Configuration
window.SEASON_CONFIG = {
    NAME: 'FABA Winter 2026',
    FULL_NAME: 'Filipino American Basketball Arizona Winter 2026',
    START_DATE: '2026-01-11',
    END_DATE: '2026-04-05',
    PLAYOFFS_START: '2026-03-01',
    TOTAL_WEEKS: 9,
    VENUE: {
        name: 'Compass Sports Performance Gym',
        address: '255 W. Warner Rd, Chandler AZ 85225'
    }
};

// Division Configuration
window.DIVISIONS = [
    { id: 'open', name: 'Open', displayName: 'Open Division', order: 1 },
    { id: '40plus', name: '40+', displayName: '40+ Division', order: 2 }
];

// Week Schedule
window.WEEKS = [
    { week: 1, date: '2026-01-11', label: 'January 11, 2026' },
    { week: 2, date: '2026-01-18', label: 'January 18, 2026' },
    { week: 3, date: '2026-01-25', label: 'January 25, 2026' },
    { week: 4, date: '2026-02-01', label: 'February 1, 2026' },
    { week: 5, date: '2026-02-08', label: 'February 8, 2026' },
    { week: 6, date: '2026-02-15', label: 'February 15, 2026' },
    { week: 7, date: '2026-02-22', label: 'February 22, 2026' },
    { week: 8, date: '2026-03-01', label: 'March 1, 2026 - PLAYOFFS', isPlayoff: true },
    { week: 9, date: '2026-03-08', label: 'March 8, 2026 - FINALS', isPlayoff: true }
];

// League Settings
window.LEAGUE_SETTINGS = {
    POINTS_FOR_WIN: 1,
    POINTS_FOR_LOSS: 0,
    POINTS_FOR_TIE: 0,
    GAMES_PER_WEEK: 12,
    PLAYOFF_TEAMS: 4,
    ROSTER_MIN: 8,
    ROSTER_MAX: 15
};

// Court Locations
window.COURTS = [
    { id: 'ct-1', name: 'CT-1', venue: 'Compass Sports Performance Gym' },
    { id: 'ct-2', name: 'CT-2', venue: 'Compass Sports Performance Gym' }
];

// Game Status
window.GAME_STATUS = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    FINAL: 'final',
    CANCELLED: 'cancelled',
    POSTPONED: 'postponed'
};

// Firestore Base Path
window.FABA_BASE = 'faba-leagues/winter-2026';

// Open Division Teams (9 teams)
window.OPEN_TEAMS = [
    'Hoop Squad',
    'Shift Team',
    'The Introduction Runs',
    'Valley Hoopers',
    'Playhouse',
    'Yauckey Buckets',
    'Makulit',
    'Jaballers',
    'Team Unknown'
];

// 40+ Division Teams (15 teams)
window.PLUS40_TEAMS = [
    'Freedom Waters',
    'Wolves',
    'Takuza',
    'Hoop Squad',
    'AZ Flight',
    'TKSI',
    'Playhouse',
    'Motown',
    'Hoopaholic',
    'Digong',
    'Dream Capture',
    'Call Xtina Now.com',
    'Goutstar',
    'Cebu Chorizo',
    'FABA O.G'
];
