        // Quote array with initial data
        let quotes = [];
        let selectedCategory = 'all';
        let lastSyncTime = null;
        let syncInterval = null;
        let conflictsResolved = 0;
        
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
        const serverStorageContent = document.getElementById('serverStorageContent');
        const categoryFilter = document.getElementById('categoryFilter');
        const totalQuoteCount = document.getElementById('totalQuoteCount');
        const filteredCount = document.getElementById('filteredCount');
        const currentFilterSpan = document.getElementById('currentFilter');
        const syncStatus = document.getElementById('syncStatus');
        const lastSync = document.getElementById('lastSync');
        const serverVersion = document.getElementById('serverVersion');
        const conflictsResolvedSpan = document.getElementById('conflictsResolved');
        const syncNowBtn = document.getElementById('syncNowBtn');
        const forceSyncBtn = document.getElementById('forceSyncBtn');
        const conflictNotification = document.getElementById('conflictNotification');
        const conflictDetails = document.getElementById('conflictDetails');
        const resolveConflictBtn = document.getElementById('resolveConflictBtn');
        const syncLog = document.getElementById('syncLog');
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            loadQuotesFromStorage();
            showLastSessionQuote();
            populateCategories();
            updateStorageDisplays();
            setupEventListeners();
            updateQuoteCount();
            
            // Start periodic syncing
            startSyncInterval();
            
            // Add initial sync log
            addToSyncLog('Application initialized');
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
                    version: 1,
                    lastUpdated: new Date().toISOString()
                });
                
                saveQuotesToLocalStorage();
                formContainer.style.display = 'none';
                document.getElementById('quoteText').value = '';
                document.getElementById('quoteCategory').value = '';
                
                // Update categories and show new quote
                populateCategories();
                showRandomQuote();
                
                alert('Quote added successfully!');
                addToSyncLog(`Added new quote: "${text.substring(0, 20)}..."`);
            } else {
                alert('Please fill in both fields.');
            }
        }
        
        // Export quotes to JSON file
        function exportQuotes() {
            if (quotes.length === 0) {
                alert('No quotes to export!');
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
            
            addToSyncLog('Exported quotes to JSON file');
        }
        
        // Clear all quotes from storage
        function clearAllQuotes() {
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
            
            // Server storage display
            serverStorageContent.innerHTML = `<strong>Simulated server storage</strong>\nQuotes are synced periodically`;
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
            syncNowBtn.addEventListener('click', syncWithServer);
            forceSyncBtn.addEventListener('click', () => syncWithServer(true));
            resolveConflictBtn.addEventListener('click', resolveConflicts);
        }
        
        // Start periodic syncing
        function startSyncInterval() {
            if (syncInterval) clearInterval(syncInterval);
            
            syncInterval = setInterval(() => {
                syncWithServer();
            }, 30000); // Sync every 30 seconds
            
            addToSyncLog('Started periodic sync (every 30 seconds)');
        }
        
        // Fetch quotes from server simulation
        function fetchQuotesFromServer() {
            // Simulate server response with some quotes
            return new Promise((resolve) => {
                // Simulate network delay
                setTimeout(() => {
                    resolve([
                        { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration", version: 1 },
                        { id: 2, text: "Innovation distinguishes between a leader and a follower.", category: "Business", version: 1 },
                        { id: 3, text: "Life is what happens when you're busy making other plans.", category: "Life", version: 1 },
                        { id: 4, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Motivation", version: 1 },
                        { id: 5, text: "Be the change that you wish to see in the world.", category: "Wisdom", version: 1 },
                        { id: 6, text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Perseverance", version: 2 },
                        { id: 7, text: "The way to get started is to quit talking and begin doing.", category: "Action", version: 1 }
                    ]);
                }, 1000);
            });
        }
        
        // Simulate server synchronization
        async function syncWithServer(force = false) {
            // Show syncing status
            syncStatus.textContent = 'Syncing...';
            syncStatus.className = 'status-value status-warning';
            
            addToSyncLog('Starting server synchronization...');
            
            try {
                // Fetch quotes from server
                const serverQuotes = await fetchQuotesFromServer();
                
                // Merge server quotes into local
                const conflicts = [];
                
                // Merge server quotes with local quotes
                serverQuotes.forEach(serverQuote => {
                    const localQuote = quotes.find(q => q.id === serverQuote.id);
                    
                    if (localQuote) {
                        // Check for conflict
                        if (localQuote.version !== serverQuote.version && 
                            localQuote.text !== serverQuote.text) {
                            conflicts.push({
                                id: serverQuote.id,
                                serverText: serverQuote.text,
                                serverCategory: serverQuote.category,
                                localText: localQuote.text,
                                localCategory: localQuote.category
                            });
                            
                            // Resolve conflict by using server version
                            localQuote.text = serverQuote.text;
                            localQuote.category = serverQuote.category;
                            localQuote.version = serverQuote.version;
                            conflictsResolved++;
                        } else if (serverQuote.version > localQuote.version) {
                            // Update local with server version
                            localQuote.text = serverQuote.text;
                            localQuote.category = serverQuote.category;
                            localQuote.version = serverQuote.version;
                        }
                    } else {
                        // Add new quote from server
                        quotes.push(serverQuote);
                    }
                });
                
                // Update UI and storage
                saveQuotesToLocalStorage();
                populateCategories();
                
                // Update sync status
                lastSyncTime = new Date();
                lastSync.textContent = lastSyncTime.toLocaleTimeString();
                conflictsResolvedSpan.textContent = conflictsResolved;
                syncStatus.textContent = 'Synchronized';
                syncStatus.className = 'status-value status-success';
                
                addToSyncLog(`Sync completed at ${lastSyncTime.toLocaleTimeString()}`);
                
                // Show conflict notification if any
                if (conflicts.length > 0) {
                    conflictNotification.style.display = 'block';
                    conflictDetails.innerHTML = '';
                    
                    conflicts.forEach(conflict => {
                        const conflictHtml = `
                            <div class="conflict-quote">
                                <div><strong>Quote ID:</strong> ${conflict.id}</div>
                                <div><strong>Server version:</strong> "${conflict.serverText.substring(0, 50)}..."</div>
                                <div><strong>Local version:</strong> "${conflict.localText.substring(0, 50)}..."</div>
                            </div>
                        `;
                        conflictDetails.innerHTML += conflictHtml;
                    });
                    
                    addToSyncLog(`Resolved ${conflicts.length} conflicts during sync`);
                }
                
            } catch (error) {
                syncStatus.textContent = 'Sync Failed';
                syncStatus.className = 'status-value status-error';
                addToSyncLog(`Sync failed: ${error.message}`);
            }
        }
        
        // Add entry to sync log
        function addToSyncLog(message) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<strong>[${timeString}]</strong> ${message}`;
            syncLog.prepend(logEntry);
            
            // Keep only the last 5 log entries
            if (syncLog.children.length > 5) {
                syncLog.removeChild(syncLog.lastChild);
            }
        }
        
        // Resolve conflicts manually
        function resolveConflicts() {
            alert('Manual conflict resolution would be implemented here. For this demo, server version is always used.');
            conflictNotification.style.display = 'none';
        }