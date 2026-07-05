// ===============================
// Firebase Imports
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// Firebase Configuration
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyCVIBM_WNLQN0W309zIMRgrM3MxeaNzFKw",

    authDomain: "personal-finance-tracker-9c271.firebaseapp.com",

    projectId: "personal-finance-tracker-9c271",

    storageBucket: "personal-finance-tracker-9c271.firebasestorage.app",

    messagingSenderId: "867907482416",

    appId: "1:867907482416:web:765e1f68e09c9112d80ef5"

};


// ===============================
// Initialize Firebase
// ===============================

const app = initializeApp(firebaseConfig);


// ===============================
// Firebase Services
// ===============================

const auth = getAuth(app);

const db = getFirestore(app);


// ===============================
// Export Services
// ===============================

export { auth, db };