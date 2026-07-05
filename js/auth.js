import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =============================
// Show Alert
// =============================

function showMessage(message) {
    alert(message);
}


// =============================
// Handle Firebase Errors
// =============================

function handleAuthError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            showMessage("Email is already registered.");
            break;

        case "auth/invalid-email":
            showMessage("Invalid email address.");
            break;

        case "auth/weak-password":
            showMessage("Password should be at least 6 characters.");
            break;

        case "auth/user-not-found":
            showMessage("No account found.");
            break;

        case "auth/wrong-password":
            showMessage("Incorrect password.");
            break;

        case "auth/invalid-credential":
            showMessage("Invalid email or password.");
            break;

        default:
            showMessage(error.message);

    }

}



// =============================
// SIGN UP
// =============================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const btn = signupForm.querySelector("button");

        btn.disabled = true;

        btn.innerHTML = "Creating Account...";

        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (password !== confirmPassword) {

            showMessage("Passwords do not match.");

            btn.disabled = false;

            btn.innerHTML = "Create Account";

            return;

        }

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await updateProfile(userCredential.user, {

                displayName: name

            });

            await setDoc(
                doc(db, "users", userCredential.user.uid),
                {

                    uid: userCredential.user.uid,

                    name: name,

                    email: email,

                    createdAt: serverTimestamp()

                }
            );

            showMessage("Account created successfully!");

            window.location.href = "index.html";

        }

        catch (error) {

            handleAuthError(error);

        }

        finally {

            btn.disabled = false;

            btn.innerHTML = "Create Account";

        }

    });

}



// =============================
// LOGIN
// =============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const btn = loginForm.querySelector("button");

        btn.disabled = true;

        btn.innerHTML = "Logging In...";

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        try {

            await signInWithEmailAndPassword(

                auth,

                email,

                password

            );

            window.location.href = "dashboard.html";

        }

        catch (error) {

            handleAuthError(error);

        }

        finally {

            btn.disabled = false;

            btn.innerHTML = "Login";

        }

    });

}



// =============================
// LOGOUT
// =============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "index.html";

        }

        catch (error) {

            console.log(error);

        }

    });

}



// =============================
// AUTH STATE CHECK
// =============================

onAuthStateChanged(auth, (user) => {

    const currentPage =
        window.location.pathname.split("/").pop();

    if (user) {

        if (
            currentPage === "index.html" ||
            currentPage === "signup.html"
        ) {

            window.location.href = "dashboard.html";

        }

    }

    else {

        if (currentPage === "dashboard.html") {

            window.location.href = "index.html";

        }

    }

});