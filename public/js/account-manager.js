// === ACCOUNT MANAGER SYSTEM ===
// === Created by: Dr. Emily Chen (Auth & Security Architect) ===
// === Validated by: Marcus Rodriguez (Process Engineer) ===

class AccountManager {
    constructor() {
        this.emailDomain = '@azflight.basketball';
    }

    // Generate unique username
    generateUsername(fullName, teamName) {
        const firstName = fullName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const teamAbbr = teamName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toLowerCase();
        const random = Math.floor(Math.random() * 100);
        return `${firstName}.${teamAbbr}${random}`;
    }

    // Create coach account with username/password
    async createCoachAccount(teamId, coachData) {
        try {
            const currentAdmin = firebase.auth().currentUser;
            if (!currentAdmin) throw new Error('Admin must be authenticated');
            
            const username = coachData.username || this.generateUsername(coachData.name, coachData.teamName);
            const email = username + this.emailDomain;
            const tempPassword = 'TempPass123!';
            
            let secondaryApp;
            try {
                secondaryApp = firebase.app('secondary');
            } catch (error) {
                secondaryApp = firebase.initializeApp({
                    apiKey: "AIzaSyCTM8LdVW5Hh2Unu7IDvsKjvTL8m43nQyc",
                    authDomain: "az-flight-league-prod-2026.firebaseapp.com",
                    projectId: "az-flight-league-prod-2026",
                    storageBucket: "az-flight-league-prod-2026.firebasestorage.app",
                    messagingSenderId: "936667116683",
                    appId: "1:936667116683:web:185b8ad2439fbdb6ced08e"
                }, 'secondary');
            }
            
            const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, tempPassword);
            const uid = userCred.user.uid;
            await userCred.user.updateProfile({ displayName: coachData.name });
            await secondaryApp.auth().signOut();
            
            await db.collection('users').doc(uid).set({
                uid, username, email,
                displayName: coachData.name,
                role: 'coach',
                teamId, teamName: coachData.teamName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            await db.collection('teams').doc(teamId).update({
                coachUsername: username,
                coachEmail: email,
                coachUid: uid,
                coachAccountCreated: true
            });
            
            return { success: true, username, email, tempPassword, uid };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create scorekeeper account
    async createScorekeeperAccount(scorekeeperData) {
        try {
            const username = `sk_${scorekeeperData.name.toLowerCase().replace(/[^a-z]/g, '')}${Math.floor(Math.random() * 100)}`;
            const email = username + this.emailDomain;
            const password = 'Score' + new Date().getFullYear() + '!';
            
            // Create Firebase Auth account
            const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const uid = userCred.user.uid;
            
            // Update display name
            await userCred.user.updateProfile({
                displayName: scorekeeperData.name
            });
            
            // Create user document
            await db.collection('users').doc(uid).set({
                uid: uid,
                username: username,
                email: email,
                displayName: scorekeeperData.name,
                role: 'scorekeeper',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return {
                success: true,
                username: username,
                email: email,
                tempPassword: password,
                uid: uid
            };
            
        } catch (error) {
            console.error('Scorekeeper account creation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }



    // Display credentials modal
    showCredentialsModal(credentials, role) {
        const modal = document.createElement('div');
        modal.id = 'credentialsModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';
        
        modal.innerHTML = `
            <div style="background:white;padding:2rem;border-radius:8px;max-width:500px;width:90%;">
                <h2 style="margin-bottom:1rem;color:#1e293b;">Account Created Successfully!</h2>
                <div style="background:#f0f9ff;padding:1rem;border-radius:4px;border:1px solid #0284c7;">
                    <h3 style="color:#0c4a6e;margin-bottom:0.5rem;">${role} Login Credentials:</h3>
                    <p style="margin:0.5rem 0;"><strong>Username:</strong> 
                        <span style="background:white;padding:0.25rem 0.5rem;border-radius:4px;font-family:monospace;">${credentials.username}</span>
                        <button onclick="navigator.clipboard.writeText('${credentials.username}')" style="margin-left:0.5rem;padding:0.25rem 0.5rem;background:#3b82f6;color:white;border:none;border-radius:4px;cursor:pointer;">Copy</button>
                    </p>
                    <p style="margin:0.5rem 0;"><strong>Password:</strong> 
                        <span style="background:white;padding:0.25rem 0.5rem;border-radius:4px;font-family:monospace;">Auto-Generated</span>
                    </p>
                </div>
                <div style="background:#fef2f2;padding:1rem;border-radius:4px;border:1px solid #dc2626;margin-top:1rem;">
                    <p style="color:#dc2626;font-weight:bold;margin:0;">⚠️ Important Instructions:</p>
                    <ul style="margin:0.5rem 0;padding-left:1.5rem;color:#7f1d1d;">
                        <li>Share these credentials securely with the ${role}</li>
                        <li>This information will not be shown again</li>
                    </ul>
                </div>
                <button onclick="document.getElementById('credentialsModal').remove()" style="width:100%;margin-top:1rem;padding:0.75rem;background:#6b7280;color:white;border:none;border-radius:4px;cursor:pointer;">
                    Close (I've saved the credentials)
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
}

// Initialize globally
if (typeof window !== 'undefined') {
    window.accountManager = new AccountManager();
    console.log('✅ Account Manager initialized');
}