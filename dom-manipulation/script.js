        // Quote array with initial data
        let quotes = [];
        let selectedCategory = 'all';
        let serverQuotes = [];
        let lastSyncTime = null;
        let quotesSynced = 0;
        let lastServerFetchTime = null;
        let periodicSyncInterval = null;
        let syncIntervalMinutes = 5; // Default interval
        let updateAvailable = false;
        
        // DOM elements
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteBtn = document.getElementById('newQuote');
        const addQuoteBtn = document.getElementById('addQuoteBtn');
        const formContainer = document.getElementById('formContainer');
        const exportBtn = document.getElementById('exportBtn');
        const clearStorageBtn = document.getElementById('clearStorageBtn');
        const submitQuoteBtn = document.getElementById('submitQuoteBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const localStorageContent = document.getElementById('localStorageContent');
        const serverDataContent = document.getElementById('serverDataContent');
        const categoryFilter = document.getElementById('categoryFilter');
        const totalQuoteCount = document.getElementById('totalQuoteCount');
        const filteredCount = document.getElementById('filteredCount');
        const currentFilterSpan = document.getElementById('currentFilter');
        const syncStatus = document.getElementById('syncStatus');
        const lastSync = document.getElementById('lastSync');
        const nextSync = document.getElementById('nextSync');
        const serverVersion = document.getElementById('serverVersion');
        const quotesSyncedSpan = document.getElementById('quotesSynced');
        const syncQuotesBtn = document.getElementById('syncQuotesBtn');
        const fetchServerBtn = document.getElementById('fetchServerBtn');
        const syncNotification = document.getElementById('syncNotification');
        const syncDetails = document.getElementById('syncDetails');
        const syncLog = document.getElementById('syncLog');
        const syncIntervalInput = document.getElementById('syncInterval');
        const updateIntervalBtn = document.getElementById('updateIntervalBtn');
        const autoSyncStatus = document.getElementById('autoSyncStatus');
        const notificationContainer = document.getElementById('notificationContainer');
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            loadQuotesFromStorage();
            showLastSessionQuote();
            populateCategories();
            updateStorageDisplays();
            setupEventListeners();
            updateQuoteCount();
            addToSyncLog('Application initialized');
            
            // Start periodic sync
            startPeriodicSync();
        });
        
        // Load quotes from localStorage
        function loadQuotesFromStorage() {
            const storedQuotes = localStorage.getItem('quotes');
            if (storedQuotes) {
                try {
                    quotes = JSON.parse(storedQuotes);
                    updateQuoteCount();
                } catch (e) {
                    console.error('Error parsing quotes from localStorage:', e);
                    quotes = getDefaultQuotes();
                    saveQuotesToLocalStorage();
                }
            } else {
                quotes = getDefaultQuotes();
                saveQuotesToLocalStorage();
            }
            
            // Load filter preference
            const savedFilter = localStorage.getItem('quoteFilter');
            if (savedFilter) {
                selectedCategory = savedFilter;
                categoryFilter.value = selectedCategory;
                currentFilterSpan.textContent = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
            }
        }
        
        // Get default quotes if none are stored
        function getDefaultQuotes() {
            return [
                { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration", version: 1 },
                { id: 2, text: "Innovation distinguishes between a leader and a follower.", category: "Business", version: 1 },
                { id: 3, text: "Life is what happens when you're busy making other plans.", category: "Life", version: 1 },
                { id: 4, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Motivation", version: 1 },
                { id: 5, text: "Be the change that you wish to see in the world.", category: "Wisdom", version: 1 }
            ];
        }
        
        // Save quotes to localStorage
        function saveQuotesToLocalStorage() {
            localStorage.setItem('quotes', JSON.stringify(quotes));
            localStorage.setItem('lastSaved', new Date().toLocaleString());
            updateStorageDisplays();
            updateQuoteCount();
        }
        
        // Populate categories in the filter dropdown
        function populateCategories() {
            // Clear existing options except the first one ("all")
            while (categoryFilter.options.length > 1) {
                categoryFilter.remove(1);
            }
            
            // Extract unique categories
            const categories = [...new Set(quotes.map(quote => quote.category))];
            categories.sort();
            
            // Add options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
            
            // Set the selected category
            categoryFilter.value = selectedCategory;
        }
        
        // Filter quotes based on selected category
        function filterQuotes() {
            selectedCategory = categoryFilter.value;
            localStorage.setItem('quoteFilter', selectedCategory);
            currentFilterSpan.textContent = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
            
            // Update filtered count display
            if (selectedCategory === 'all') {
                filteredCount.textContent = '';
            } else {
                const count = quotes.filter(q => q.category === selectedCategory).length;
                filteredCount.innerHTML = ` | Showing: <span class="highlight">${count}</span>`;
            }
            
            showRandomQuote();
        }
        
        // Show random quote
        function showRandomQuote() {
            if (quotes.length === 0) {
                quoteDisplay.innerHTML = '<p class="no-quotes">No quotes available. Add some quotes!</p>';
                return;
            }
            
            let filteredQuotes = quotes;
            
            // Apply category filter
            if (selectedCategory !== 'all') {
                filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
                
                // If no quotes in category, fallback to all quotes
                if (filteredQuotes.length === 0) {
                    filteredQuotes = quotes;
                    quoteDisplay.innerHTML = `<p class="no-quotes">No quotes in category "${selectedCategory}". Showing all quotes.</p>`;
                    return;
                }
            }
            
            const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
            const quote = filteredQuotes[randomIndex];
            displayQuote(quote);
            
            // Store last viewed quote in sessionStorage
            sessionStorage.setItem('lastQuote', JSON.stringify(quote));
            sessionStorage.setItem('lastViewed', new Date().toLocaleString());
            updateStorageDisplays();
        }
        
        // Display a quote
        function displayQuote(quote) {
            quoteDisplay.innerHTML = `
                <blockquote>${quote.text}</blockquote>
                <cite>— ${quote.category}</cite>
                <div class="category-tag">ID: ${quote.id} | Version: ${quote.version}</div>
            `;
        }
        
        // Show last viewed quote from sessionStorage
        function showLastSessionQuote() {
            const lastQuote = sessionStorage.getItem('lastQuote');
            if (lastQuote) {
                try {
                    const quote = JSON.parse(lastQuote);
                    displayQuote(quote);
                } catch (e) {
                    console.error('Error parsing last quote from sessionStorage:', e);
                    showRandomQuote();
                }
            } else {
                showRandomQuote();
            }
        }
        
        // Create the add quote form
        function createAddQuoteForm() {
            formContainer.style.display = 'block';
            document.getElementById('quoteText').focus();
        }
        
        // Add a new quote
        function addNewQuote() {
            const text = document.getElementById('quoteText').value.trim();
            const category = document.getElementById('quoteCategory').value.trim();
            
            if (text && category) {
                // Generate unique ID and version
                const newId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1;
                
                quotes.push({ 
                    id: newId, 
                    text, 
                    category, 
                    version: 1
                });
                
                saveQuotesToLocalStorage();
                formContainer.style.display = 'none';
                document.getElementById('quoteText').value = '';
                document.getElementById('quoteCategory').value = '';
                
                // Update categories and show new quote
                populateCategories();
                showRandomQuote();
                
                // Show success notification
                showNotification('Quote Added', `"${text.substring(0, 40)}..." added successfully!`, 'success');
                addToSyncLog(`Added new quote: "${text.substring(0, 20)}..."`);
            } else {
                // Using alert for form validation as requested
                alert('Please fill in both fields.');
            }
        }
        
        // Export quotes to JSON file
        function exportQuotes() {
            if (quotes.length === 0) {
                showNotification('Export Failed', 'No quotes to export!', 'warning');
                return;
            }
            
            const dataStr = JSON.stringify(quotes, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quotes.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Export Successful', 'Quotes exported to JSON file!', 'success');
            addToSyncLog('Exported quotes to JSON file');
        }
        
        // Clear all quotes from storage
        function clearAllQuotes() {
            // Using alert for confirmation as requested
            if (confirm('Are you sure you want to delete all quotes? This cannot be undone.')) {
                quotes = [];
                localStorage.removeItem('quotes');
                localStorage.removeItem('quoteFilter');
                sessionStorage.removeItem('lastQuote');
                selectedCategory = 'all';
                categoryFilter.value = 'all';
                currentFilterSpan.textContent = 'All Categories';
                quoteDisplay.innerHTML = '<p class="no-quotes">All quotes have been cleared.</p>';
                populateCategories();
                updateStorageDisplays();
                updateQuoteCount();
                
                showNotification('Storage Cleared', 'All quotes have been cleared.', 'info');
                addToSyncLog('Cleared all quotes');
            }
        }
        
        // Update storage information displays
        function updateStorageDisplays() {
            // Local storage display
            const storedQuotes = localStorage.getItem('quotes');
            if (storedQuotes) {
                const quoteCount = JSON.parse(storedQuotes).length;
                const lastSaved = localStorage.getItem('lastSaved') || 'Unknown';
                localStorageContent.innerHTML = `<strong>${quoteCount} quotes stored</strong>\nLast saved: ${lastSaved}`;
            } else {
                localStorageContent.textContent = 'No quotes in local storage';
            }
            
            // Server data display
            if (serverQuotes.length > 0) {
                const fetchTime = lastServerFetchTime ? lastServerFetchTime.toLocaleTimeString() : 'Unknown';
                serverDataContent.innerHTML = `<strong>${serverQuotes.length} quotes from server</strong>\nLast fetched: ${fetchTime}`;
            } else {
                serverDataContent.textContent = 'No server data fetched yet';
            }
        }
        
        // Update quote count display
        function updateQuoteCount() {
            totalQuoteCount.textContent = quotes.length;
            
            // Update filtered count if a filter is active
            if (selectedCategory !== 'all') {
                const count = quotes.filter(q => q.category === selectedCategory).length;
                filteredCount.innerHTML = ` | Showing: <span class="highlight">${count}</span>`;
            } else {
                filteredCount.textContent = '';
            }
        }
        
        // Set up event listeners
        function setupEventListeners() {
            newQuoteBtn.addEventListener('click', showRandomQuote);
            addQuoteBtn.addEventListener('click', createAddQuoteForm);
            submitQuoteBtn.addEventListener('click', addNewQuote);
            cancelBtn.addEventListener('click', () => {
                formContainer.style.display = 'none';
                document.getElementById('quoteText').value = '';
                document.getElementById('quoteCategory').value = '';
            });
            exportBtn.addEventListener('click', exportQuotes);
            clearStorageBtn.addEventListener('click', clearAllQuotes);
            categoryFilter.addEventListener('change', filterQuotes);
            syncQuotesBtn.addEventListener('click', syncQuotes);
            fetchServerBtn.addEventListener('click', fetchQuotesFromServer);
            updateIntervalBtn.addEventListener('click', updateSyncInterval);
        }
        
        // Start periodic sync with setInterval
        function startPeriodicSync() {
            if (periodicSyncInterval) {
                clearInterval(periodicSyncInterval);
            }
            
            // Convert minutes to milliseconds
            const intervalMs = syncIntervalMinutes * 60 * 1000;
            
            // Update next sync time display
            updateNextSyncTime();
            
            periodicSyncInterval = setInterval(() => {
                addToSyncLog(`Automatic server check started (every ${syncIntervalMinutes} minutes)`);
                fetchQuotesFromServer(true); // Silent fetch
                
                // If server data exists, check for updates
                if (serverQuotes.length > 0) {
                    checkForServerUpdates();
                }
                
                // Update next sync time display
                updateNextSyncTime();
            }, intervalMs);
            
            addToSyncLog(`Periodic sync started (every ${syncIntervalMinutes} minutes)`);
            autoSyncStatus.textContent = `Active (every ${syncIntervalMinutes} min)`;
        }
        
        // Update sync interval from user input
        function updateSyncInterval() {
            const newInterval = parseInt(syncIntervalInput.value);
            if (newInterval >= 1 && newInterval <= 60) {
                syncIntervalMinutes = newInterval;
                startPeriodicSync();
                showNotification('Interval Updated', `Auto-sync interval set to ${syncIntervalMinutes} minutes`, 'success');
            } else {
                showNotification('Invalid Interval', 'Please enter a value between 1 and 60 minutes', 'warning');
            }
        }
        
        // Update next sync time display
        function updateNextSyncTime() {
            const now = new Date();
            const nextTime = new Date(now.getTime() + (syncIntervalMinutes * 60 * 1000));
            nextSync.textContent = nextTime.toLocaleTimeString();
        }
        
        // Fetch quotes from server using JSONPlaceholder API
        async function fetchQuotesFromServer(silent = false) {
            if (!silent) {
                syncStatus.innerHTML = '<span class="loading"></span> Fetching...';
                syncStatus.className = 'status-value status-warning';
                addToSyncLog('Fetching quotes from server...');
            }
            
            try {
                // Fetch from JSONPlaceholder API
                const response = await fetch('https://jsonplaceholder.typicode.com/posts');
                
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                
                const data = await response.json();
                
                // Transform API data to our quote format
                serverQuotes = data.map(post => ({
                    id: post.id,
                    text: post.title,
                    category: `User ${post.userId}`,
                    version: 1
                }));
                
                // Update server data display
                lastServerFetchTime = new Date();
                updateStorageDisplays();
                
                if (!silent) {
                    lastSync.textContent = lastServerFetchTime.toLocaleTimeString();
                    syncStatus.textContent = 'Data Received';
                    syncStatus.className = 'status-value status-success';
                    addToSyncLog(`Fetched ${serverQuotes.length} quotes from server`);
                    showNotification('Server Data Fetched', `Received ${serverQuotes.length} quotes from server`, 'success');
                } else {
                    addToSyncLog(`Periodic fetch: ${serverQuotes.length} quotes received`);
                }
            } catch (error) {
                if (!silent) {
                    syncStatus.textContent = 'Fetch Failed';
                    syncStatus.className = 'status-value status-error';
                    showNotification('Fetch Failed', `Failed to fetch quotes: ${error.message}`, 'error');
                }
                addToSyncLog(`Fetch failed: ${error.message}`);
            }
        }
        
        // Check for server updates
        function checkForServerUpdates() {
            let updatesFound = 0;
            const newQuotes = [];
            
            serverQuotes.forEach(serverQuote => {
                const localIndex = quotes.findIndex(q => q.id === serverQuote.id);
                
                if (localIndex === -1) {
                    // New quote found on server
                    updatesFound++;
                    newQuotes.push(serverQuote);
                } else {
                    // Check for updates to existing quotes
                    const localQuote = quotes[localIndex];
                    if (localQuote.text !== serverQuote.text || 
                        localQuote.category !== serverQuote.category) {
                        updatesFound++;
                    }
                }
            });
            
            if (updatesFound > 0) {
                updateAvailable = true;
                showNotification('Updates Available', `Server has ${updatesFound} updates (${newQuotes.length} new quotes)`, 'info');
                addToSyncLog(`Server updates detected: ${updatesFound} changes available`);
                
                // Add visual indicator to sync button
                syncQuotesBtn.innerHTML = `<i class="fas fa-sync"></i> Sync Quotes <span class="update-indicator">${updatesFound}</span>`;
            }
        }
        
        // The main syncQuotes function
        async function syncQuotes() {
            if (serverQuotes.length === 0) {
                showNotification('No Server Data', 'Fetch server data first before syncing', 'warning');
                return;
            }
            
            syncStatus.innerHTML = '<span class="loading"></span> Syncing...';
            syncStatus.className = 'status-value status-warning';
            
            addToSyncLog('Starting quote synchronization...');
            
            try {
                let addedCount = 0;
                let updatedCount = 0;
                let conflicts = 0;
                const conflictDetails = [];
                
                // Sync server quotes to local
                serverQuotes.forEach(serverQuote => {
                    const localIndex = quotes.findIndex(q => q.id === serverQuote.id);
                    
                    if (localIndex === -1) {
                        // Add new quote from server
                        quotes.push(serverQuote);
                        addedCount++;
                    } else {
                        // Enhanced conflict detection
                        const localQuote = quotes[localIndex];
                        if (localQuote.text !== serverQuote.text || 
                            localQuote.category !== serverQuote.category) {
                            
                            // Record conflict details
                            conflictDetails.push({
                                id: serverQuote.id,
                                local: `${localQuote.text.substring(0, 30)}... (v${localQuote.version})`,
                                server: `${serverQuote.text.substring(0, 30)}... (v1)`
                            });
                            
                            // Conflict resolution: server version wins
                            quotes[localIndex] = {
                                ...serverQuote,
                                version: localQuote.version + 1
                            };
                            updatedCount++;
                            conflicts++;
                        }
                    }
                });
                
                // Send new local quotes to server
                let sentToServer = 0;
                const newQuotes = [];
                
                for (const localQuote of quotes) {
                    const existsOnServer = serverQuotes.some(sq => sq.id === localQuote.id);
                    
                    if (!existsOnServer) {
                        try {
                            // POST new quote to server
                            await fetch('https://jsonplaceholder.typicode.com/posts', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({
                                    title: localQuote.text,
                                    body: `Category: ${localQuote.category}`,
                                    userId: 1
                                })
                            });
                            
                            newQuotes.push(`"${localQuote.text.substring(0, 20)}..."`);
                            sentToServer++;
                        } catch (error) {
                            console.error('Error posting quote to server:', error);
                            addToSyncLog(`Failed to send quote ID ${localQuote.id}: ${error.message}`);
                        }
                    }
                }
                
                // Save changes
                saveQuotesToLocalStorage();
                populateCategories();
                
                // Update sync status
                quotesSynced += addedCount + updatedCount + sentToServer;
                quotesSyncedSpan.textContent = quotesSynced;
                lastSyncTime = new Date();
                lastSync.textContent = lastSyncTime.toLocaleTimeString();
                syncStatus.textContent = 'Sync Complete';
                syncStatus.className = 'status-value status-success';
                
                // Create detailed sync report
                let report = `
                    <div class="conflict-quote">
                        <p><i class="fas fa-check-circle"></i> Added ${addedCount} new quotes from server</p>
                    </div>
                    <div class="conflict-quote">
                        <p><i class="fas fa-sync-alt"></i> Updated ${updatedCount} quotes (${conflicts} conflicts resolved)</p>
                    </div>
                    <div class="conflict-quote">
                        <p><i class="fas fa-cloud-upload-alt"></i> Sent ${sentToServer} new quotes to server</p>
                    </div>
                `;
                
                // Add conflict details if any
                if (conflictDetails.length > 0) {
                    report += `<div class="conflict-quote"><p><strong>Conflict Details:</strong></p>`;
                    conflictDetails.forEach(conflict => {
                        report += `
                            <div class="conflict-detail">
                                <p>ID ${conflict.id}:</p>
                                <p><i class="fas fa-laptop"></i> Local: ${conflict.local}</p>
                                <p><i class="fas fa-server"></i> Server: ${conflict.server}</p>
                            </div>
                        `;
                    });
                    report += `</div>`;
                }
                
                // Add new quotes details if any
                if (newQuotes.length > 0) {
                    report += `<div class="conflict-quote"><p><strong>New Quotes Sent:</strong></p>`;
                    newQuotes.forEach(quote => {
                        report += `<div class="conflict-detail">${quote}</div>`;
                    });
                    report += `</div>`;
                }
                
                // Final summary
                report += `
                    <div class="conflict-quote">
                        <p><i class="fas fa-database"></i> Total quotes now: ${quotes.length}</p>
                    </div>
                `;
                
                syncDetails.innerHTML = report;
                syncNotification.style.display = 'block';
                
                // Show the specific notification requested
                showNotification('Sync Complete', 'Quotes synced with server!', 'success');
                
                // Reset update indicator
                updateAvailable = false;
                syncQuotesBtn.innerHTML = '<i class="fas fa-sync"></i> Sync Quotes';
                
                addToSyncLog(`Sync completed: Added ${addedCount}, Updated ${updatedCount}, Sent ${sentToServer}`);
                
            } catch (error) {
                syncStatus.textContent = 'Sync Failed';
                syncStatus.className = 'status-value status-error';
                showNotification('Sync Failed', `Synchronization failed: ${error.message}`, 'error');
                addToSyncLog(`Sync failed: ${error.message}`);
            }
        }
        
        // Show notification
        function showNotification(title, message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            
            // Set icon based on type
            let icon;
            switch(type) {
                case 'success':
                    icon = 'fas fa-check-circle';
                    break;
                case 'warning':
                    icon = 'fas fa-exclamation-triangle';
                    break;
                case 'error':
                    icon = 'fas fa-exclamation-circle';
                    break;
                default:
                    icon = 'fas fa-info-circle';
            }
            
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            notificationContainer.appendChild(notification);
            
            // Add close functionality
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
            
            // Show animation
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
        
        // Add entry to sync log
        function addToSyncLog(message) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<strong>[${timeString}]</strong> ${message}`;
            syncLog.prepend(logEntry);
            
            // Store in localStorage
            const logs = JSON.parse(localStorage.getItem('syncLogs') || '[]');
            logs.unshift(`[${now.toISOString()}] ${message}`);
            localStorage.setItem('syncLogs', JSON.stringify(logs.slice(0, 50)));  // Keep last 50 entries
            
            // Keep only the last 5 log entries visible in UI
            while (syncLog.children.length > 5) {
                syncLog.removeChild(syncLog.lastChild);
            }
        }