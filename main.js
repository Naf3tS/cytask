
// Firebase configuration
const firebaseConfig = {"projectId":"cytask","appId":"1:19240282522:web:9958ed71c93782f53ef223","storageBucket":"cytask.firebasestorage.app","apiKey":"AIzaSyAbRAMOXeLdfE2ftPrJFcSgyp7QP3rV-Bo","authDomain":"cytask.firebaseapp.com","messagingSenderId":"19240282522","measurementId":"G-2171EDDE3N"};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const mainContent = document.querySelector('main');
const taskList = document.getElementById('task-list');
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const body = document.body;

let tasksRef;
let unsubscribe;

// Sign in with Google
loginButton.addEventListener('click', () => {
  auth.signInWithPopup(provider)
    .catch((error) => {
      console.error('Sign-in error:', error.message);
    });
});

// Sign out
logoutButton.addEventListener('click', () => {
  auth.signOut();
});

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in.
    body.classList.remove('logged-out');
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    mainContent.style.display = 'block';

    // Get user's tasks
    tasksRef = db.collection('users').doc(user.uid).collection('tasks');

    addTaskForm.addEventListener('submit', e => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            tasksRef.add({
                text: taskText,
                completed: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            taskInput.value = '';
        }
    });

    // Listen for task changes
    unsubscribe = tasksRef.orderBy('createdAt').onSnapshot(snapshot => {
        taskList.innerHTML = '';
        snapshot.forEach(doc => {
            const task = doc.data();
            const li = document.createElement('li');
            li.textContent = task.text;
            li.dataset.id = doc.id;
            if (task.completed) {
                li.classList.add('completed');
            }

            // Mark as complete
            li.addEventListener('click', () => {
                tasksRef.doc(doc.id).update({ completed: !task.completed });
            });

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                tasksRef.doc(doc.id).delete();
            });

            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });
    });

  } else {
    // User is signed out.
    body.classList.add('logged-out');
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    mainContent.style.display = 'none';
    if (unsubscribe) {
        unsubscribe();
    }
  }
});
