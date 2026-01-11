// West Valley Basketball League - Final Solution
// NO IIFE, NO DOMContentLoaded - Direct execution

console.log('Basketball app loading...');

// Initialize immediately
var loginBtn = document.getElementById('loginBtn');
var loginModal = document.getElementById('loginModal');
var closeBtn = document.getElementById('closeLogin');

// Login button handler
if(loginBtn) {
    loginBtn.onclick = function(e) {
        e.preventDefault();
        console.log('Opening modal');
        if(loginModal) {
            loginModal.classList.remove('hidden');
            loginModal.style.cssText = 'display: flex !important; visibility: visible !important;';
        }
    };
    console.log('Login button ready');
}

// Close button handler
if(closeBtn) {
    closeBtn.onclick = function() {
        if(loginModal) {
            loginModal.classList.add('hidden');
            loginModal.style.cssText = 'display: none !important;';
        }
    };
}

// Role selection handlers
document.querySelectorAll('.role-card').forEach(function(card) {
    card.onclick = function() {
        var role = this.getAttribute('data-role');
        console.log('Role selected: ' + role);
        
        // Close modal
        if(loginModal) {
            loginModal.classList.add('hidden');
            loginModal.style.cssText = 'display: none !important;';
        }
        
        // Hide ALL pages with forced inline styles
        document.querySelectorAll('.page').forEach(function(p) {
            p.classList.remove('active');
            p.style.cssText = 'display: none !important;';
        });
        
        // Determine target
        var pageId = null;
        var url = null;
        
        switch(role) {
            case 'admin':
                pageId = 'adminPage';
                url = '/admin';
                break;
            case 'coach':
                pageId = 'coachPage';
                url = '/coach';
                break;
            case 'scorekeeper':
                pageId = 'gameSelectionPage';
                url = '/scorekeeper';
                break;
        }
        
        // Show target page with FORCED inline styles
        if(pageId) {
            var targetPage = document.getElementById(pageId);
            if(targetPage) {
                targetPage.classList.add('active');
                // Force display with maximum specificity inline styles
                targetPage.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 1 !important; min-height: 100vh !important;';
                window.history.pushState({}, '', url);
                console.log('Displayed: ' + pageId);
            } else {
                console.error('Page not found: ' + pageId);
            }
        }
    };
});

// Back button handlers
['backFromAdmin', 'backFromCoach', 'backFromGameSelection', 'backFromScorekeeper'].forEach(function(id) {
    var btn = document.getElementById(id);
    if(btn) {
        btn.onclick = function() {
            console.log('Back button clicked');
            // Hide all
            document.querySelectorAll('.page').forEach(function(p) {
                p.classList.remove('active');
                p.style.cssText = 'display: none !important;';
            });
            // Show home
            var home = document.getElementById('publicPage');
            if(home) {
                home.classList.add('active');
                home.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
            }
            window.history.pushState({}, '', '/');
        };
    }
});

// Ensure public page is visible initially
var publicPage = document.getElementById('publicPage');
if(publicPage) {
    publicPage.classList.add('active');
    publicPage.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
}

// Global scroll function
window.scrollToSection = function(id) {
    var el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior: 'smooth'});
};

console.log('Basketball app ready!');