/**
 * ==========================================
 * AUTHENTICATION CHECK & PROTECTION
 * Panel Consensus: Block rendering until verified
 * v3.1 - Fixed race condition with retry mechanism
 * ==========================================
 */
(function() {
    'use strict';

    console.log('🔐 Auth Check Script v3.1 - Race Condition Fix');
    
    // Define protected pages and their required roles
    // Support both clean URLs (/admin) and Barbarian URLs (/admin.html)
    const PROTECTED_PAGES = {
        '/admin': 'admin',
        '/coach': 'coach', 
        '/scorekeeper-v2': 'scorekeeper',
        '/admin.html': 'admin',
        '/coach.html': 'coach', 
        '/scorekeeper-v2.html': 'scorekeeper'
    };
    
    const currentPath = window.location.pathname;
    const requiredRole = PROTECTED_PAGES[currentPath];
    
    // If not a protected page, skip auth check
    if (!requiredRole) {
        console.log('📄 Public page - no auth required');
        hideLoadingScreen();
        return;
    }
    
    console.log(`🔒 Protected page detected: ${currentPath}`);
    console.log(`🎫 Required role: ${requiredRole}`);
    
    // CRITICAL: Ensure body has checking-auth class
    document.body.classList.add('checking-auth');
    
    // Verify Firebase is loaded
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not loaded');
        redirectToLogin(requiredRole, 'Firebase not initialized');
        return;
    }
    
    // Set timeout for auth check (3 seconds max)
    const AUTH_TIMEOUT = 3000;
    let authCheckComplete = false;
    
    const authTimeout = setTimeout(() => {
        if (!authCheckComplete) {
            console.error('⏱️ Auth check timeout');
            redirectToLogin(requiredRole, 'Authentication timeout');
        }
    }, AUTH_TIMEOUT);
    
    // Firebase auth state listener
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        clearTimeout(authTimeout);
        authCheckComplete = true;
        
        // No user logged in
        if (!user) {
            console.log('❌ No authenticated user');
            redirectToLogin(requiredRole, 'Not authenticated');
            return;
        }
        
        console.log(`✅ User authenticated: ${user.email}`);
        
        try {
            // Force token refresh to ensure we have the latest
            await user.getIdToken(true);

            // Fetch user role from Firestore with retry mechanism
            const db = firebase.firestore();
            const userDoc = await fetchUserDocWithRetry(db, user.uid, 3, 150);
            
            if (!userDoc.exists) {
                console.error('❌ User document not found');
                await firebase.auth().signOut();
                redirectToLogin(requiredRole, 'User profile not found');
                return;
            }
            
            const userData = userDoc.data();
            const userRole = userData.role;
            
            console.log(`🎭 User role: ${userRole}`);
            
            // Verify role matches requirement
            if (userRole !== requiredRole) {
                console.error(`❌ Access denied. Required: ${requiredRole}, Has: ${userRole}`);
                alert(`Access Denied\n\nThis page requires ${requiredRole} privileges.\nYou are logged in as ${userRole}.`);
                await firebase.auth().signOut();
                redirectToLogin(requiredRole, 'Insufficient permissions');
                return;
            }
            
            // SUCCESS - User authenticated and authorized
            console.log('✅ Authentication and authorization successful');
            
            // Store user info globally
            window.currentUser = {
                uid: user.uid,
                email: user.email,
                role: userRole,
                displayName: userData.displayName || user.email.split('@')[0],
                teamId: userData.teamId || null,
                teamName: userData.teamName || null
            };
            
            // REVEAL PAGE CONTENT
            showAuthenticatedUI();
            
            // Dispatch event for page initialization
            document.dispatchEvent(new CustomEvent('authVerified', {
                detail: window.currentUser
            }));
            
            // Unsubscribe from listener
            unsubscribe();
            
        } catch (error) {
            console.error('❌ Authorization check failed:', error);
            redirectToLogin(requiredRole, 'Authorization error');
        }
    });
    
    /**
     * Show page content after auth verification
     */
    function showAuthenticatedUI() {
        console.log('🎨 Revealing authenticated UI');
        
        // Remove checking class, add verified class
        document.body.classList.remove('checking-auth');
        document.body.classList.add('auth-verified');
        
        // Hide loading screen after brief delay
        setTimeout(() => {
            hideLoadingScreen();
        }, 300);
    }
    
    /**
     * Hide loading screen
     */
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('authLoadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 400);
        }
    }
    
    /**
     * Redirect to login
     */
    function redirectToLogin(role, reason) {
        if (window.location.href.includes('login.html')) {
            hideLoadingScreen();
            return;
        }

        console.log(`🔀 Redirecting to login: ${reason}`);

        const returnUrl = encodeURIComponent(currentPath + window.location.search);
        const loginUrl = `/login.html?role=${role}&redirect=${returnUrl}`;

        setTimeout(() => {
            window.location.href = loginUrl;
        }, 300);
    }

    /**
     * Fetch user document with retry mechanism for race condition handling
     */
    async function fetchUserDocWithRetry(db, uid, maxRetries = 3, baseDelay = 150) {
        let lastError = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const userDoc = await db.collection('users').doc(uid).get();
                if (attempt > 0) {
                    console.log(`✅ Token propagated after ${attempt} retry(ies)`);
                }
                return userDoc;
            } catch (error) {
                lastError = error;

                if (error.code === 'permission-denied' && attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`⏳ Token propagation delay, retrying in ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                throw error;
            }
        }

        throw lastError;
    }

})();