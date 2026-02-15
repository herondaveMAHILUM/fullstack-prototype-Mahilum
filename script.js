// Storage and Database 
const STORAGE_KEY = 'ipt_demo_v1';

function loadFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            window.db = JSON.parse(stored);
        } else {
            window.db = {
                accounts: [
                    { 
                      firstName: 'Admin', 
                      lastName: 'User',   
                      email: 'admin@example.com', 
                      password: 'Password123!', 
                      verified: true, role: 'admin' }
                ],
                departments: [
                    { name: 'Engineering' },
                    { name: 'HR' }
                ],
                requests: []
            };
            saveToStorage();
        }

        window.db.requests = window.db.requests || [];
        window.db.employees = window.db.employees || [];
    } catch (error) {
        console.error("Failed to load DB, resetting.", error);
        window.db = {
            accounts: [
                { 
                  firstName: 'Admin', 
                  lastName: 'User', 
                  email: 'admin@gmail.com', 
                  password: 'admin123', 
                  verified: true, role: 'admin' }
            ],
            departments: [
                { name: 'Engineering' },
                { name: 'HR' }
            ],
            requests: []
        };
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}


// Routing
function handleRouting() {
    const hash = window.location.hash || '#/home';
    const route = hash.replace('#/', '');

    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    const protectedRoutes = ['profile','employees','accounts','departments','requests'];
    if (protectedRoutes.includes(route) && !currentUser) {
        window.location.hash = '#/login';
        return;
    }

    const page = document.getElementById(route);
    if (page) page.style.display = 'block';
    else document.getElementById('home').style.display = 'block';

    if (route === 'profile') renderProfile();
    if (route === 'accounts') renderAccountsList();
    if (route === 'requests') renderRequestsTable();
    if (route === 'employees') renderEmployeesTable();
    if (route === 'departments') renderDepartmentsTable();
}
window.addEventListener('hashchange', handleRouting);


// Initialization
window.addEventListener('load', () => {
    loadFromStorage();

    const token = localStorage.getItem('auth_token');
    if (token) {
        const user = window.db.accounts.find(acc => acc.email === token);
        if (user) setAuthState(true, user);
        else setAuthState(false);
    } else {
        setAuthState(false);
    }

    if (!window.location.hash) window.location.hash = '#/home';
    handleRouting();
});


// Registration
function register() {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;

    if (!firstName || !lastName || !email || !password) {
        alert("All fields are required.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    const existing = window.db.accounts.find(acc => acc.email === email);
    if (existing) {
        alert("Email already registered.");
        return;
    }

    const newUser = { firstName, lastName, email, password, verified: false, role: 'user' };
    window.db.accounts.push(newUser);
    saveToStorage();
    localStorage.setItem('unverified_email', email);
    window.location.hash = '#/verifyemail';
}


// Email Verification
function simVerification() {
    const email = localStorage.getItem('unverified_email');
    if (!email) return alert("No email found to verify.");

    const user = window.db.accounts.find(acc => acc.email === email);
    if (!user) return alert("User not found.");

    user.verified = true;
    saveToStorage();
    localStorage.removeItem('unverified_email');
    alert(`Email ${email} verified! You can now log in.`);
    window.location.hash = '#/login';
}


// Log In
function loginUser() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    const user = window.db.accounts.find(acc => acc.email === email && acc.password === password && acc.verified);

    if (!user) {
        alert("Invalid email/password or email not verified.");
        return;
    }

    localStorage.setItem('auth_token', user.email);
    setAuthState(true, user);
    window.location.hash = '#/profile';
}


// Authentication
let currentUser = null;

function setAuthState(isAuth, user = null) {
    currentUser = isAuth ? user : null;

    if (isAuth) {
        document.querySelector('.role-logged-out').classList.add('d-none');

        if (user.role === 'admin') {
            document.getElementById('adminDropdownContainer').classList.remove('d-none');
            document.getElementById('userNavLink').classList.add('d-none');
        } else {
            document.getElementById('userNavLink').classList.remove('d-none');
            document.getElementById('adminDropdownContainer').classList.add('d-none');
        }
    } else {
        document.querySelector('.role-logged-out').classList.remove('d-none');
        document.getElementById('adminDropdownContainer').classList.add('d-none');
        document.getElementById('userNavLink').classList.add('d-none');
    }
}


// Profile
function renderProfile() {
    if (!currentUser) return;

    const profileSection = document.getElementById('profile');
    profileSection.innerHTML = `
        <div class="forms">
            <h2>My Profile</h2>
            <div class="box">
                <h3>${currentUser.firstName} ${currentUser.lastName}</h3>
                <p>Email: ${currentUser.email}</p>
                <p>Role: ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
                <button id="editProfileBtn">Edit Profile</button>
            </div>
        </div>
    `;

    document.getElementById('editProfileBtn').addEventListener('click', () => {
        alert("Edit Profile clicked! (Feature coming soon)");
    });
}


// Accounts (Admin)
function renderAccountsList() {
    const container = document.getElementById('accounts');
    container.innerHTML = `
        <h2>Accounts</h2>
        <button onclick="showAddAccountForm()">+ Add Account</button>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${window.db.accounts.map((acc, index) => `
                    <tr>
                        <td>${acc.firstName} ${acc.lastName}</td>
                        <td>${acc.email}</td>
                        <td>${acc.role}</td>
                        <td>${acc.verified ? '✅' : '❌'}</td>
                        <td>
                            <button onclick="editAccount(${index})">Edit</button>
                            <button onclick="resetPassword(${index})">Reset PW</button>
                            <button onclick="deleteAccount(${index})">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}


// Employees & Departments (Admin)
function renderEmployeesTable() {
    const container = document.getElementById('employees');
    const employees = window.db.employees || [];

    container.innerHTML = `
        <h2>Employees</h2>
        <button onclick="alert('Add Employee not implemented')">+ Add Employee</button>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${employees.map((e, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${e.email || ''}</td>
                        <td>${e.role || ''}</td>
                        <td>${e.department || ''}</td>
                        <td>
                            <button onclick="alert('Edit Employee not implemented')">Edit</button>
                            <button onclick="alert('Delete Employee not implemented')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderDepartmentsTable() {
    const container = document.getElementById('departments');
    const departments = window.db.departments || [];

    container.innerHTML = `
        <h2>Departments</h2>
        <button onclick="alert('Add Department not implemented')">+ Add Department</button>
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${departments.map((d, i) => `
                    <tr>
                        <td>${d.name}</td>
                        <td>
                            <button onclick="alert('Edit Department not implemented')">Edit</button>
                            <button onclick="alert('Delete Department not implemented')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}


// User Requests
function renderRequestsTable() {
    if (!currentUser) return;

    const container = document.getElementById('requestsTableContainer');
    const userRequests = window.db.requests.filter(r => r.employeeEmail === currentUser.email);

    if (!userRequests.length) {
        container.innerHTML = "<p>No requests yet.</p>";
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Items</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${userRequests.map(r => `
                    <tr>
                        <td>${r.date}</td>
                        <td>${r.type}</td>
                        <td>${r.items.map(i => `${i.name} (x${i.qty})`).join(", ")}</td>
                        <td>${getStatusBadge(r.status)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}


// Request Form
document.addEventListener('DOMContentLoaded', () => {
    const newBtn = document.getElementById('newRequestBtn');
    const form = document.getElementById('newRequestForm');
    const cancelBtn = document.getElementById('cancelRequestBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const submitBtn = document.getElementById('submitRequestBtn');

    if (newBtn) newBtn.addEventListener('click', () => form.style.display = 'block');
    if (cancelBtn) cancelBtn.addEventListener('click', () => form.style.display = 'none');

    if (addItemBtn) addItemBtn.addEventListener('click', () => {
        const container = document.getElementById('requestItemsContainer');
        const div = document.createElement('div');
        div.classList.add('requestItem');
        div.innerHTML = `
            <input type="text" placeholder="Item Name" class="itemName">
            <input type="number" placeholder="Qty" class="itemQty" min="1">
            <button class="removeItemBtn">×</button>
        `;
        container.appendChild(div);
        div.querySelector('.removeItemBtn').addEventListener('click', () => div.remove());
    });

    if (submitBtn) submitBtn.addEventListener('click', () => {
        const type = document.getElementById('requestType').value;
        const itemsDivs = document.querySelectorAll('#requestItemsContainer .requestItem');
        const items = [];

        itemsDivs.forEach(div => {
            const name = div.querySelector('.itemName').value.trim();
            const qty = parseInt(div.querySelector('.itemQty').value);
            if (name && qty > 0) items.push({ name, qty });
        });

        if (!items.length) return alert("Add at least one item.");

        const newRequest = {
            type,
            items,
            status: "Pending",
            date: new Date().toLocaleString(),
            employeeEmail: currentUser.email
        };

        window.db.requests.push(newRequest);
        saveToStorage();
        form.style.display = 'none';
        renderRequestsTable();
    });
});


// Log Out
function logout() {
    localStorage.removeItem('auth_token');

    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    if (loginEmail) loginEmail.value = '';
    if (loginPassword) loginPassword.value = '';

    const adminDropdown = document.getElementById('adminDropdownContainer');
    if (adminDropdown) {
        adminDropdown.classList.add('d-none');
        adminDropdown.querySelector('.dropdown-menu')?.classList.remove('show');
    }

    const userDropdown = document.getElementById('userNavLink');
    if (userDropdown) {
        userDropdown.classList.add('d-none');
        userDropdown.querySelector('.dropdown-menu')?.classList.remove('show');
    }

    document.querySelector('.role-logged-out').classList.remove('d-none');

    currentUser = null;
    window.location.hash = '#/home';
}

document.getElementById('adminLogoutLink')?.addEventListener('click', e => {
    e.preventDefault();
    logout();
});

document.getElementById('userLogoutLink')?.addEventListener('click', e => {
    e.preventDefault();
    logout();
});



function getStatusBadge(status) {
    if (status === "Pending") return '<span style="color:orange;">Pending</span>';
    if (status === "Approved") return '<span style="color:green;">Approved</span>';
    if (status === "Rejected") return '<span style="color:red;">Rejected</span>';
    return status;
}



