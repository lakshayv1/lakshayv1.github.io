const app = {
    // Current user state
    currentUser: null,
    userRole: null, // 'admin' or 'user'

    // LocalStorage Keys
    STORAGE_BOOKS: 'lms_books',
    STORAGE_USERS: 'lms_users',
    
    // Config
    MAX_BORROW_LIMIT: 3,

    // Lifecycle
    init() {
        // Initialize default books if empty
        if (!localStorage.getItem(this.STORAGE_BOOKS)) {
            localStorage.setItem(this.STORAGE_BOOKS, JSON.stringify([
                { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '2', title: '1984', author: 'George Orwell', category: 'Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '4', title: 'The Matrix', author: 'Wachowski Brothers', category: 'Science', status: 'borrowed', borrower: 'john_doe', dueDate: new Date(Date.now() - 86400000).toISOString(), issueDate: new Date(Date.now() - 86400000 * 15).toISOString() }, // Sample overdue book
                { id: '5', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '6', title: 'Dune', author: 'Frank Herbert', category: 'Science', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '7', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'History', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '8', title: 'Steve Jobs', author: 'Walter Isaacson', category: 'Biography', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '9', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Non-Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '10', title: 'The Diary of a Young Girl', author: 'Anne Frank', category: 'Biography', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '11', title: 'Guns, Germs, and Steel', author: 'Jared Diamond', category: 'History', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '12', title: 'Cosmos', author: 'Carl Sagan', category: 'Science', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '13', title: 'Quiet', author: 'Susan Cain', category: 'Non-Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '14', title: 'The Martian', author: 'Andy Weir', category: 'Science', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '15', title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', status: 'available', borrower: null, dueDate: null, issueDate: null },
                { id: '16', title: 'Alexander Hamilton', author: 'Ron Chernow', category: 'Biography', status: 'available', borrower: null, dueDate: null, issueDate: null }
            ]));
        }
        
        // Initialize users if empty
        if (!localStorage.getItem(this.STORAGE_USERS)) {
            // Seed a sample user
            localStorage.setItem(this.STORAGE_USERS, JSON.stringify({
                'john_doe': { password: 'pass' }
            }));
        }

        // Session check
        const sessionUser = localStorage.getItem('lms_session_user');
        const sessionRole = localStorage.getItem('lms_session_role');
        
        if (sessionUser && sessionRole) {
            this.currentUser = sessionUser;
            this.userRole = sessionRole;
            this.showDashboard();
        } else {
            this.showLanding();
        }
    },

    // Utilities
    getBooks() { return JSON.parse(localStorage.getItem(this.STORAGE_BOOKS)) || []; },
    saveBooks(books) { localStorage.setItem(this.STORAGE_BOOKS, JSON.stringify(books)); },
    getUsers() { return JSON.parse(localStorage.getItem(this.STORAGE_USERS)) || {}; },
    saveUsers(users) { localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users)); },
    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); },
    
    notify(message, type = 'success') {
        const notif = document.getElementById('notification-area');
        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
        notif.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        notif.className = `notify-${type} active`;
        
        // Clear previous timeout and set new one
        if (this.notifTimeout) clearTimeout(this.notifTimeout);
        this.notifTimeout = setTimeout(() => { notif.className = 'hidden'; }, 4000);
    },

    // Navigation Updates
    hideAllViews() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    },
    
    showLanding() { 
        this.hideAllViews(); 
        document.getElementById('landing-view').classList.add('active'); 
    },
    
    showAdminLogin() { 
        this.hideAllViews(); 
        document.getElementById('admin-login-view').classList.add('active'); 
    },
    
    showUserLogin() { 
        this.hideAllViews(); 
        document.getElementById('user-auth-view').classList.add('active'); 
        this.switchUserAuthTab('login'); 
    },
    
    showDashboard() {
        this.hideAllViews();
        if (this.userRole === 'admin') {
            document.getElementById('admin-dashboard-view').classList.add('active');
            this.renderAdminDashboard();
        } else if (this.userRole === 'user') {
            document.getElementById('user-dashboard-view').classList.add('active');
            document.getElementById('user-display-name').textContent = this.currentUser;
            this.renderUserDashboard();
        }
    },

    // Authentication
    handleAdminLogin(e) {
        e.preventDefault();
        const user = document.getElementById('admin-username').value;
        const pass = document.getElementById('admin-password').value;
        if (user === 'admin' && pass === 'admin123') {
            this.setSession('admin', 'admin');
            this.notify('Admin access granted');
            document.getElementById('admin-login-form').reset();
            this.showDashboard();
        } else {
            this.notify('Invalid admin credentials', 'error');
        }
    },

    switchUserAuthTab(tab) {
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('tab-signup').classList.remove('active');
        document.getElementById('user-login-form').classList.add('hidden');
        document.getElementById('user-signup-form').classList.add('hidden');
        
        document.getElementById(`tab-${tab}`).classList.add('active');
        document.getElementById(`user-${tab}-form`).classList.remove('hidden');
    },

    handleUserSignup(e) {
        e.preventDefault();
        const user = document.getElementById('signup-username').value.trim();
        const pass = document.getElementById('signup-password').value;
        
        const users = this.getUsers();
        if (users[user]) {
            this.notify('Username is already taken', 'error');
            return;
        }
        
        users[user] = { password: pass };
        this.saveUsers(users);
        this.notify('Account created! You can now login.');
        document.getElementById('user-signup-form').reset();
        this.switchUserAuthTab('login');
    },

    handleUserLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;
        
        const users = this.getUsers();
        if (users[user] && users[user].password === pass) {
            this.setSession(user, 'user');
            this.notify(`Welcome back, ${user}!`);
            document.getElementById('user-login-form').reset();
            this.showDashboard();
        } else {
            this.notify('Authentication failed. Check credentials.', 'error');
        }
    },

    setSession(username, role) {
        this.currentUser = username;
        this.userRole = role;
        localStorage.setItem('lms_session_user', username);
        localStorage.setItem('lms_session_role', role);
    },

    handleLogout() {
        this.currentUser = null;
        this.userRole = null;
        localStorage.removeItem('lms_session_user');
        localStorage.removeItem('lms_session_role');
        this.showLanding();
        this.notify('Logged out successfully');
    },

    // Admin Features
    renderAdminDashboard() {
        this.renderAdminBooks();
        this.renderAdminBorrowedBooks();
        this.updateAdminStats();
    },

    updateAdminStats() {
        const books = this.getBooks().filter(b => b.status !== 'deleted');
        const total = books.length;
        const borrowed = books.filter(b => b.status === 'borrowed').length;
        const available = total - borrowed;
        
        // Counter animation effect
        document.getElementById('stat-total-books').textContent = total;
        document.getElementById('stat-borrowed-books').textContent = borrowed;
        document.getElementById('stat-available-books').textContent = available;
    },

    handleAddBook(e) {
        e.preventDefault();
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const category = document.getElementById('book-category').value;
        
        const newBook = {
            id: this.generateId(),
            title,
            author,
            category: category || 'Uncategorized',
            status: 'available',
            borrower: null,
            dueDate: null,
            issueDate: null
        };
        
        const books = this.getBooks();
        books.push(newBook);
        this.saveBooks(books);
        
        document.getElementById('add-book-form').reset();
        this.notify(`"${title}" added to catalog`);
        this.renderAdminDashboard();
    },

    handleDeleteBook(id) {
        if (!confirm('Are you sure you want to delete this book?')) return;
        
        let books = this.getBooks();
        const bookIndex = books.findIndex(b => b.id === id);
        
        if (books[bookIndex].status === 'borrowed') {
            this.notify('Cannot delete a book that is currently borrowed', 'error');
            return;
        }
        
        books[bookIndex].status = 'deleted';
        this.saveBooks(books);
        this.notify('Book deleted successfully');
        this.renderAdminDashboard();
    },

    handlePermanentDeleteBook(id) {
        if (!confirm('Permanently delete this book from the system? This cannot be undone.')) return;
        
        let books = this.getBooks();
        books = books.filter(b => b.id !== id);
        this.saveBooks(books);
        this.notify('Book permanently deleted');
        this.renderAdminDashboard();
    },

    handleRestoreBook(id) {
        let books = this.getBooks();
        const bookIndex = books.findIndex(b => b.id === id);
        
        if (bookIndex !== -1) {
            books[bookIndex].status = 'available';
            this.saveBooks(books);
            this.notify('Book restored successfully');
            this.renderAdminDashboard();
        }
    },

    openEditModal(id) {
        const book = this.getBooks().find(b => b.id === id);
        if (!book) return;
        
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('edit-book-title').value = book.title;
        document.getElementById('edit-book-author').value = book.author;
        document.getElementById('edit-book-category').value = book.category || '';
        
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeEditModal() {
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 250); // match transition
    },

    handleUpdateBook(e) {
        e.preventDefault();
        const id = document.getElementById('edit-book-id').value;
        const title = document.getElementById('edit-book-title').value.trim();
        const author = document.getElementById('edit-book-author').value.trim();
        const category = document.getElementById('edit-book-category').value;
        
        const books = this.getBooks();
        const idx = books.findIndex(b => b.id === id);
        if (idx !== -1) {
            books[idx].title = title;
            books[idx].author = author;
            books[idx].category = category;
            this.saveBooks(books);
            this.notify('Book details updated');
            this.closeEditModal();
            this.renderAdminDashboard();
        }
    },

    renderAdminBooks() {
        const search = document.getElementById('admin-search-books').value.toLowerCase();
        let books = this.getBooks();
        
        if (search) {
            books = books.filter(b => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search));
        }
        
        const tbody = document.getElementById('admin-books-list');
        tbody.innerHTML = '';
        
        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-muted);">No books found in the catalog.</td></tr>';
            return;
        }

        books.forEach(book => {
            const tr = document.createElement('tr');
            
            let actionsHtml = '';
            if (book.status === 'deleted') {
                actionsHtml = `
                    <button class="btn btn-secondary btn-sm" onclick="app.handleRestoreBook('${book.id}')">Restore</button>
                    <button class="btn btn-danger btn-sm" onclick="app.handlePermanentDeleteBook('${book.id}')">Perm Delete</button>
                `;
            } else {
                actionsHtml = `
                    <button class="btn btn-outline btn-sm" onclick="app.openEditModal('${book.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="app.handleDeleteBook('${book.id}')">Delete</button>
                `;
            }

            tr.innerHTML = `
                <td>
                    <span class="book-title">${book.title}</span>
                </td>
                <td><span class="book-author" style="margin:0; font-size:0.9375rem;">${book.author}</span></td>
                <td><span class="badge badge-outline">${book.category || 'N/A'}</span></td>
                <td><span class="badge badge-${book.status === 'deleted' ? 'danger' : book.status}">${book.status.charAt(0).toUpperCase() + book.status.slice(1)}</span></td>
                <td class="td-actions">
                    ${actionsHtml}
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    renderAdminBorrowedBooks() {
        const borrowedBooks = this.getBooks().filter(b => b.status === 'borrowed');
        const tbody = document.getElementById('admin-borrowed-list');
        tbody.innerHTML = '';
        
        if (borrowedBooks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">No active loans at the moment.</td></tr>';
            return;
        }

        borrowedBooks.forEach(book => {
            const tr = document.createElement('tr');
            const isOverdue = new Date(book.dueDate) < new Date();
            const dueDateDisplay = isOverdue ? 
                `<span class="text-danger font-bold" title="Overdue">${new Date(book.dueDate).toLocaleDateString()} ⚠️ Overdue</span>` : 
                new Date(book.dueDate).toLocaleDateString();

            tr.innerHTML = `
                <td>
                    <span class="book-title">${book.title}</span>
                    <span class="book-author">${book.author}</span>
                </td>
                <td><span class="badge badge-primary">@${book.borrower}</span></td>
                <td>${new Date(book.issueDate).toLocaleDateString()}</td>
                <td>${dueDateDisplay}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    // User Features
    renderUserDashboard() {
        this.checkDeadlines();
        this.renderUserAvailableBooks();
        this.renderUserBorrowedBooks();
    },

    checkDeadlines() {
        if (this.userRole !== 'user') return;
        
        const borrowed = this.getBooks().filter(b => b.borrower === this.currentUser);
        let overdueBooks = [];
        let nearingBooks = [];
        
        borrowed.forEach(book => {
            const daysLeft = Math.ceil((new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft < 0) {
                overdueBooks.push(`"${book.title}"`);
            } else if (daysLeft <= 2) {
                nearingBooks.push(`"${book.title}"`);
            }
        });
        
        const alertBanner = document.getElementById('user-deadline-alert');
        alertBanner.className = 'alert-banner hidden';
        
        if (overdueBooks.length > 0) {
            alertBanner.innerHTML = `⚠️ <strong>OVERDUE ACTION REQUIRED:</strong> Please return ${overdueBooks.join(', ')} immediately.`;
            alertBanner.className = 'alert-banner alert-danger';
        } else if (nearingBooks.length > 0) {
            alertBanner.innerHTML = `🔔 <strong>REMINDER:</strong> ${nearingBooks.join(', ')} are due very soon!`;
            alertBanner.className = 'alert-banner alert-warning';
        }
    },

    renderUserAvailableBooks() {
        const search = document.getElementById('user-search-books').value.toLowerCase();
        let books = this.getBooks().filter(b => b.status === 'available');
        
        if (search) {
            books = books.filter(b => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search));
        }

        const tbody = document.getElementById('user-available-list');
        tbody.innerHTML = '';

        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem; color: var(--text-muted);">No available books matching your search.</td></tr>';
            return;
        }

        books.forEach(book => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="book-title">${book.title}</span></td>
                <td><span class="book-author" style="margin:0; font-size:0.9375rem;">${book.author}</span></td>
                <td><span class="badge badge-outline">${book.category || 'N/A'}</span></td>
                <td class="td-actions"><button class="btn btn-primary btn-sm" onclick="app.handleBorrowBook('${book.id}')">Borrow Book</button></td>
            `;
            tbody.appendChild(tr);
        });
    },

    renderUserBorrowedBooks() {
        const borrowed = this.getBooks().filter(b => b.borrower === this.currentUser);
        document.getElementById('user-borrow-count').textContent = borrowed.length;
        
        const tbody = document.getElementById('user-borrowed-list');
        tbody.innerHTML = '';

        if (borrowed.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">You haven\'t borrowed any books yet. Browse the catalog to start reading!</td></tr>';
            return;
        }

        borrowed.forEach(book => {
            const tr = document.createElement('tr');
            
            const daysLeft = Math.ceil((new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
            let statusBadge = '';

            if (daysLeft < 0) {
                statusBadge = '<span class="badge badge-danger">Overdue (' + Math.abs(daysLeft) + ' days)</span>';
            } else if (daysLeft === 0) {
                statusBadge = '<span class="badge badge-danger">Due Today</span>';
            } else if (daysLeft <= 2) {
                statusBadge = `<span class="badge badge-borrowed">Due in ${daysLeft} days</span>`;
            } else {
                statusBadge = '<span class="badge badge-primary">Active (Due in ' + daysLeft + ' days)</span>';
            }

            tr.innerHTML = `
                <td>
                    <span class="book-title">${book.title}</span>
                    <span class="book-author">${book.author}</span>
                </td>
                <td>${new Date(book.dueDate).toLocaleDateString()}</td>
                <td>${statusBadge}</td>
                <td class="td-actions"><button class="btn btn-outline btn-sm" onclick="app.handleReturnBook('${book.id}')">Return Book</button></td>
            `;
            tbody.appendChild(tr);
        });
    },

    handleBorrowBook(id) {
        const books = this.getBooks();
        
        // Max limit check
        const userBooks = books.filter(b => b.borrower === this.currentUser);
        if (userBooks.length >= this.MAX_BORROW_LIMIT) {
            this.notify(`Limit reached! You can only borrow up to ${this.MAX_BORROW_LIMIT} books at a time.`, 'error');
            return;
        }

        const book = books.find(b => b.id === id);
        if (!book || book.status !== 'available') {
            this.notify('Sorry, this book is no longer available', 'error');
            return;
        }

        book.status = 'borrowed';
        book.borrower = this.currentUser;
        
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days deadline
        
        book.issueDate = issueDate.toISOString();
        book.dueDate = dueDate.toISOString();

        this.saveBooks(books);
        this.notify(`Successfully borrowed "${book.title}". Due on ${dueDate.toLocaleDateString()}`);
        this.renderUserDashboard();
    },

    handleReturnBook(id) {
        const books = this.getBooks();
        const book = books.find(b => b.id === id);
        
        if (book && book.borrower === this.currentUser) {
            book.status = 'available';
            book.borrower = null;
            book.dueDate = null;
            book.issueDate = null;
            
            this.saveBooks(books);
            this.notify(`Thank you for returning "${book.title}"`);
            this.renderUserDashboard();
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
