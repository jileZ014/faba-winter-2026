// FABA Winter 2026 - Application Configuration
// Filipino American Basketball Association

const APP_CONFIG = {
    // Application Info
    name: 'FABA Winter 2026',
    fullName: 'Filipino American Basketball Association Winter 2026',
    version: '1.0.0',
    build: new Date().toISOString().split('T')[0].replace(/-/g, ''),

    // Environment Settings
    environment: 'development', // development | staging | production
    debug: true,

    // UI Configuration
    ui: {
        theme: 'faba-red-gold',
        toastDuration: 4000,
        animationDuration: 300,
        autoSaveInterval: 30000, // 30 seconds
        refreshInterval: 60000, // 1 minute
    },

    // Basketball Configuration
    league: {
        divisions: ['Open', '38+'],
        maxFouls: 5,
        maxPlayers: 15,
        gameLength: 40, // minutes
        periods: 4,
        periodLength: 10, // minutes
        overtimeLength: 5 // minutes
    },

    // Feature Flags
    features: {
        enablePWA: true,
        enableOfflineMode: true,
        enablePushNotifications: false,
        enableRealTimeSync: true,
        enableAdvancedStats: true,
        enableTeamPhotos: true,
        enablePlayerPhotos: false,
        enableWeekSelector: true,
        enableDivisionTabs: true
    },

    // Storage Configuration
    storage: {
        useLocalStorage: true,
        useIndexedDB: true,
        cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
        maxCacheSize: 50 * 1024 * 1024 // 50MB
    },

    // SEO Configuration
    seo: {
        title: 'FABA Winter 2026 - Filipino American Basketball Association',
        description: 'Filipino American Basketball Association Winter 2026 League - 8-week basketball season featuring Open and 38+ divisions at Compass Sports Performance Gym in Chandler, AZ.',
        keywords: 'FABA, Filipino basketball, Arizona basketball league, adult basketball, Chandler AZ, basketball tournament',
        author: 'FABA',
        ogImage: '/images/faba-logo.png'
    },

    // Social Media
    social: {
        website: 'https://faba-winter-2026.netlify.app',
        facebook: '',
        instagram: '',
        twitter: ''
    },

    // Contact Information
    contact: {
        email: 'info@faba.org',
        phone: '',
        address: 'Compass Sports Performance Gym, 255 W. Warner Rd, Chandler AZ 85225'
    },

    // Venue Configuration
    venue: {
        name: 'Compass Sports Performance Gym',
        address: '255 W. Warner Rd, Chandler AZ 85225',
        courts: ['CT-1', 'CT-2']
    },

    // Development Tools
    dev: {
        enableConsoleLogging: true,
        enablePerformanceLogging: false,
        enableErrorReporting: false
    }
};

// Environment-specific overrides
if (typeof window !== 'undefined') {
    // Browser environment

    // LOCAL DEVELOPMENT
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        APP_CONFIG.environment = 'development';
        APP_CONFIG.debug = true;
        console.log('Running in development mode');
    }

    // NETLIFY PRODUCTION
    else if (window.location.hostname.includes('netlify.app') ||
             window.location.hostname.includes('gametriq.com')) {
        APP_CONFIG.environment = 'production';
        APP_CONFIG.debug = false;
        APP_CONFIG.features.enableRealTimeSync = true;
        console.log('Running on Netlify Production');
    }

    // OTHER ENVIRONMENTS
    else {
        APP_CONFIG.environment = 'production';
        APP_CONFIG.debug = false;
    }
}

// Validation function
APP_CONFIG.validate = function() {
    const required = ['name', 'version'];
    const missing = [];

    required.forEach(key => {
        const keys = key.split('.');
        let value = this;
        for (const k of keys) {
            value = value?.[k];
        }
        if (!value) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    return true;
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = APP_CONFIG;
} else if (typeof window !== 'undefined') {
    // Browser
    window.APP_CONFIG = APP_CONFIG;
}

console.log(`🏀 ${APP_CONFIG.name} v${APP_CONFIG.version} - ${APP_CONFIG.environment} mode`);
