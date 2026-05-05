import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAg3q1qpjJ4hS9yvAHzAAPGesSErIjatcQ",
    authDomain: "digital-notice-board-7e57f.firebaseapp.com",
    projectId: "digital-notice-board-7e57f",
    storageBucket: "digital-notice-board-7e57f.appspot.com",
    messagingSenderId: "14402052673",
    appId: "1:14402052673:web:1d987b65490537152e9cc0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const noticeList = document.getElementById('noticeList');
const noticeText = document.getElementById('noticeText');
const addBtn = document.getElementById('addBtn');

// Add notice
addBtn.addEventListener('click', async () => {
    const text = noticeText.value.trim();
    if (!text) return alert('Please enter a notice!');

    await addDoc(collection(db, "notices"), {
        text: text,
        timestamp: serverTimestamp()
    });

    noticeText.value = '';
    loadNotices();
});

// Load and display all notices
async function loadNotices() {
    noticeList.innerHTML = '';

    const q = query(collection(db, "notices"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const id = docSnap.id;
        const time = data.timestamp ? data.timestamp.toDate().toLocaleString() : '';

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${data.text}</span>
            <span class="timestamp">(${time})</span>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
        `;

        // Delete notice
        li.querySelector('.deleteBtn').addEventListener('click', async () => {
            await deleteDoc(doc(db, "notices", id));
            loadNotices();
        });

        // Edit notice
        li.querySelector('.editBtn').addEventListener('click', () => {
            const newText = prompt("Edit notice:", data.text);
            if (newText) {
                updateDoc(doc(db, "notices", id), {
                    text: newText,
                    timestamp: serverTimestamp() // update timestamp
                }).then(() => loadNotices());
            }
        });

        noticeList.appendChild(li);
    });
}

// Load notices on page load
loadNotices();