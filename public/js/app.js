// West Valley Basketball League - Simple Working Version

// Staff Login Modal Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    
    // Get elements
    var loginBtn = document.getElementById('loginBtn');
    var loginModal = document.getElementById('loginModal');
    var closeBtn = document.getElementById('closeLogin');
    
    // Open modal when Staff Login clicked
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Opening staff login modal');
            if (loginModal) {
                loginModal.classList.remove('hidden');
                loginModal.style.display = 'flex';
            }
        });
    }
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            console.log('Closing modal');
            if (loginModal) {
                loginModal.classList.add('hidden');
                loginModal.style.display = 'none';
            }
        });
    }
    
    // Role card selection - Navigate to actual HTML files
    var roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var role = this.getAttribute('data-role');
            console.log('Role selected:', role);
            
            // Navigate to the appropriate HTML file
            switch(role) {
                case 'admin':
                    window.location.href = '/admin.html';
                    break;
                case 'coach':
                    // Create coach.html or show message
                    alert('Coach dashboard coming soon! Please create coach.html');
                    break;
                case 'scorekeeper':
                    // Create scorekeeper.html or show message
                    alert('Scorekeeper dashboard coming soon! Please create scorekeeper.html');
                    break;
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            if (loginModal) {
                loginModal.classList.add('hidden');
                loginModal.style.display = 'none';
            }
        }
    });
    
    // Public page navigation (View Standings, See Schedule buttons)
    window.scrollToSection = function(sectionId) {
        var section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    // Division tabs on standings
    var divisionTabs = document.querySelectorAll('.division-tab');
    divisionTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Remove active from all tabs
            divisionTabs.forEach(function(t) {
                t.classList.remove('active');
            });
            // Add active to clicked tab
            this.classList.add('active');
            // Here you would load the division data
            console.log('Loading division:', this.getAttribute('data-division'));
        });
    });
});