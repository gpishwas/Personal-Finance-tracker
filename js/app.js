// =====================================================
// Personal Finance Tracker
// app.js (Part 1)
// =====================================================


// ==========================
// IMPORTS
// ==========================

import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    addDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================
// HTML ELEMENTS
// ==========================

// Summary Cards

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");


// Transaction Form

const transactionForm = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");


// Transaction Table

const transactionTable = document.getElementById("transactionTable");


// Filters

const searchInput = document.getElementById("searchInput");

const filterCategory = document.getElementById("filterCategory");

const sortBy = document.getElementById("sortBy");

const exportBtn = document.getElementById("exportBtn");


// ==========================
// GLOBAL VARIABLES
// ==========================

let currentUser = null;

let transactions = [];


// ==========================
// DEFAULT DATE
// ==========================

// Automatically select today's date

if (dateInput) {

    dateInput.value = new Date()
        .toISOString()
        .split("T")[0];

}


// ==========================
// AUTHENTICATION CHECK
// ==========================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;

    }

    currentUser = user;

    console.log("Logged in as:", user.email);

    await loadTransactions();

});


// ==========================
// LOAD TRANSACTIONS
// ==========================

async function loadTransactions() {

    try {

        transactions = [];

        const transactionRef = collection(

            db,

            "users",

            currentUser.uid,

            "transactions"

        );

        const q = query(

            transactionRef,

            orderBy("createdAt", "desc")

        );

        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {

            transactions.push({

                id: doc.id,

                ...doc.data()

            });

        });

        console.log("Transactions Loaded");

        console.log(transactions);

        showLoading();

        renderTransactions(transactions);

        hideLoading();

        updateSummaryCards();

    }

    catch (error) {

        console.error(error);

        showNotification("Failed to load transactions.");

    }

}
// ==========================================
// RENDER TRANSACTIONS
// ==========================================

function renderTransactions(data) {

    transactionTable.innerHTML = "";

    // Empty State
    if (data.length === 0) {

        transactionTable.innerHTML = `
            <tr>
                <td colspan="6">
                    No Transactions Found
                </td>
            </tr>
        `;

        return;
    }

    data.forEach((transaction) => {

        const typeClass =
            transaction.type === "Income"
                ? "type-income"
                : "type-expense";

        transactionTable.innerHTML += `

            <tr>

                <td>${transaction.title}</td>

                <td>₹${Number(transaction.amount).toLocaleString()}</td>

                <td>

                    <span class="${typeClass}">

                        ${transaction.type}

                    </span>

                </td>

                <td>${transaction.category}</td>

                <td>

                    ${new Date(transaction.date).toLocaleDateString("en-IN")}

                </td>

                <td>

                    <button
                        class="delete-btn"
                        data-id="${transaction.id}"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;

    });

}



// ==========================================
// UPDATE SUMMARY CARDS
// ==========================================

function updateSummaryCards() {

    let totalIncome = 0;

    let totalExpense = 0;

    transactions.forEach((transaction) => {

        if (transaction.type === "Income") {

            totalIncome += Number(transaction.amount);

        }

        else {

            totalExpense += Number(transaction.amount);

        }

    });

    const totalBalance = totalIncome - totalExpense;

    balanceElement.textContent =
        `₹${totalBalance.toLocaleString("en-IN")}`;

    incomeElement.textContent =
        `₹${totalIncome.toLocaleString("en-IN")}`;

    expenseElement.textContent =
        `₹${totalExpense.toLocaleString("en-IN")}`;

}



// ==========================================
// FILTERS
// ==========================================

function applyFilters() {

    let filteredTransactions = [...transactions];

    // Search

    const keyword =
        searchInput.value.trim().toLowerCase();

    if (keyword !== "") {

        filteredTransactions = filteredTransactions.filter(

            transaction =>

                transaction.title
                    .toLowerCase()
                    .includes(keyword)

        );

    }

    // Category Filter

    const category =
        filterCategory.value;

    if (category !== "All") {

        filteredTransactions =
            filteredTransactions.filter(

                transaction =>

                    transaction.category === category

            );

    }

    // Sorting

    filteredTransactions.sort((a, b) => {

        if (sortBy.value === "oldest") {

            return new Date(a.date) - new Date(b.date);

        }

        return new Date(b.date) - new Date(a.date);

    });

    renderTransactions(filteredTransactions);

}
// ==========================================
// EVENT LISTENERS
// ==========================================

searchInput.addEventListener(

    "input",

    applyFilters

);

filterCategory.addEventListener(

    "change",

    applyFilters

);

sortBy.addEventListener(

    "change",

    applyFilters

);
// ==========================================
// ADD TRANSACTION
// ==========================================

if (transactionForm) {

    transactionForm.addEventListener("submit", addTransaction);

}

async function addTransaction(e) {

    e.preventDefault();

    const title = titleInput.value.trim();

    const amount = Number(amountInput.value);

    const type = typeInput.value;

    const category = categoryInput.value;

    const date = dateInput.value;

    // Validation

    if (!title) {

        showNotification("Please enter a transaction title.");

        return;

    }

    if (amount <= 0 || isNaN(amount)) {

        showNotification("Please enter a valid amount.");

        return;

    }

    if (!type) {

        showNotification("Please select Income or Expense.");

        return;

    }

    if (!category) {

        showNotification("Please select a category.");

        return;

    }

    if (!date) {

        showNotification("Please select a date.");

        return;

    }

    const submitButton = transactionForm.querySelector("button");

    submitButton.disabled = true;

    submitButton.textContent = "Adding...";

    try {

        await addDoc(

            collection(

                db,

                "users",

                currentUser.uid,

                "transactions"

            ),

            {

                title,

                amount,

                type,

                category,

                date,

                createdAt: serverTimestamp()

            }

        );

        transactionForm.reset();

        // Set today's date again

        dateInput.value = new Date()
            .toISOString()
            .split("T")[0];

        await loadTransactions();

        showNotification("Transaction Added Successfully.");

    }

    catch (error) {

        console.error(error);

        showNotification("Unable to save transaction.");

    }

    finally {

        submitButton.disabled = false;

        submitButton.textContent = "Add Transaction";

    }

}



// ==========================================
// DELETE TRANSACTION
// ==========================================

transactionTable.addEventListener("click", async (event) => {

    const button = event.target;

    if (!button.classList.contains("delete-btn")) {

        return;

    }

    const confirmDelete = confirm(

        "Are you sure you want to delete this transaction?"

    );

    if (!confirmDelete) {

        return;

    }

    const transactionId = button.dataset.id;

    try {

        await deleteDoc(

            doc(

                db,

                "users",

                currentUser.uid,

                "transactions",

                transactionId

            )

        );

        await loadTransactions();

    }

    catch (error) {

        console.error(error);

        showNotification("Unable to delete transaction.");

    }

});
// ==========================================
// SHOW NOTIFICATION
// ==========================================

function showNotification(message, type = "success") {

    const notification = document.createElement("div");

    notification.className = `notification ${type}`;

    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 100);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 2500);

}



// ==========================================
// EXPORT CSV
// ==========================================

if (exportBtn) {

    exportBtn.addEventListener("click", exportCSV);

}

function exportCSV() {

    if (transactions.length === 0) {

        showNotification("No transactions available.", "error");

        return;

    }

    let csvContent = "Title,Amount,Type,Category,Date\n";

    transactions.forEach(transaction => {

        csvContent +=

`${transaction.title},
${transaction.amount},
${transaction.type},
${transaction.category},
${transaction.date}\n`;

    });

    const blob = new Blob(

        [csvContent],

        { type: "text/csv;charset=utf-8;" }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "transactions.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showNotification("CSV Exported Successfully.");

}



// ==========================================
// LOADING
// ==========================================

function showLoading() {

    document.body.style.cursor = "wait";

}

function hideLoading() {

    document.body.style.cursor = "default";

}



// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyState() {

    transactionTable.innerHTML = `

    <tr>

        <td colspan="6">

            No Transactions Yet

        </td>

    </tr>

    `;

}



// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return Number(amount).toLocaleString(

        "en-IN",

        {

            style: "currency",

            currency: "INR"

        }

    );

}



// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    return new Date(date)

        .toLocaleDateString(

            "en-IN",

            {

                day: "2-digit",

                month: "short",

                year: "numeric"

            }

        );

}