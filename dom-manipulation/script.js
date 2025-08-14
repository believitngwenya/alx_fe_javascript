// Quote array with initial data
        let quotes = [];
        let selectedCategory = 'all';
        let serverQuotes = [];
        let postsSent = 0;
        
        // DOM elements
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteBtn = document.getElementById('newQuote');
        const addQuoteBtn = document.getElementById('addQuoteBtn');
        const formContainer = document.getElementById('formContainer');
        const exportBtn = document.getElementById('exportBtn');
        const clearStorageBtn = document.getElementById('clearStorageBtn');
        const submitQuoteBtn = document.getElementById('submitQuoteBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const postToServerBtn = document.getElementById('postToServerBtn');
        const localStorageContent = document.getElementById('localStorageContent');
        const serverDataContent = document.getElementById('serverDataContent');
        const categoryFilter = document.getElementById('categoryFilter');
        const totalQuoteCount = document.getElementById('totalQuoteCount');
        const filteredCount = document.getElementById('filteredCount');
        const currentFilterSpan = document.getElementById('currentFilter');
        const apiStatus = document.getElementById('apiStatus');
        const lastOperation = document.getElementById('lastOperation');
        const serverVersion = document.getElementById('serverVersion');
        const postsSentSpan = document.getElementById('postsSent');
        const fetchServerBtn = document.getElementById('fetchServerBtn');
        const syncNowBtn = document.getElementById('syncNowBtn');
        const apiNotification = document.getElementById('apiNotification');
        const apiNotificationTitle = document.getElementById('apiNotificationTitle');
        const apiNotificationContent = document.getElementById('apiNotificationContent');
        const apiLog = document.getElementById('apiLog');
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            loadQuotesFromStorage();
            showLastSessionQuote();
            populateCategories();
            updateStorageDisplays();
            setupEventListeners();
            updateQuoteCount();
            addToApiLog('Application initialized');
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
                
                alert('Quote added successfully!');
                addToApiLog(`Added new quote: "${text.substring(0, 20)}..."`);
            } else {
                alert('Please fill in both fields.');
            }
        }
        
        // Post a quote to the server
        async function postQuoteToServer() {
            const text = document.getElementById('quoteText').value.trim();
            const category = document.getElementById('quoteCategory').value.trim();
            
            if (!text || !category) {
                showApiNotification('Error', 'Please fill in both fields before posting to server');
                return;
            }
            
            apiStatus.innerHTML = '<span class="loading"></span> Posting...';
            apiStatus.className = 'status-value status-warning';
            
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: text,
                        body: `Category: ${category}`,
                        userId: 1
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to post data to server');
                }
                
                const data = await response.json();
                
                // Update UI
                postsSent++;
                postsSentSpan.textContent = postsSent;
                lastOperation.textContent = 'POST Success';
                apiStatus.textContent = 'Posted Successfully';
                apiStatus.className = 'status-value status-success';
                
                // Show success notification
                showApiNotification('Success', `Quote posted to server with ID: ${data.id}`);
                addToApiLog(`Posted quote to server: "${text.substring(0, 20)}..."`);
                
            } catch (error) {
                apiStatus.textContent = 'Post Failed';
                apiStatus.className = 'status-value status-error';
                lastOperation.textContent = 'POST Failed';
                showApiNotification('Error', `Failed to post quote: ${error.message}`);
                addToApiLog(`Post failed: ${error.message}`);
            }
        }
        
        // Fetch quotes from server using JSONPlaceholder API
        async function fetchQuotesFromServer() {
            apiStatus.innerHTML = '<span class="loading"></span> Fetching...';
            apiStatus.className = 'status-value status-warning';
            lastOperation.textContent = 'Fetching...';
            
            addToApiLog('Fetching quotes from server...');
            
            try {
                // Fetch from JSONPlaceholder API
                const response = await fetch('https://jsonplaceholder.typicode.com/posts');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch data from server');
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
                updateStorageDisplays();
                
                // Update status
                lastOperation.textContent = 'Fetch Success';
                apiStatus.textContent = 'Data Received';
                apiStatus.className = 'status-value status-success';
                
                addToApiLog(`Fetched ${serverQuotes.length} quotes from server`);
                
                // Show notification
                showApiNotification('Success', `Fetched ${serverQuotes.length} quotes from server`);
                
            } catch (error) {
                apiStatus.textContent = 'Fetch Failed';
                apiStatus.className = 'status-value status-error';
                lastOperation.textContent = 'Fetch Failed';
                showApiNotification('Error', `Failed to fetch quotes: ${error.message}`);
                addToApiLog(`Fetch failed: ${error.message}`);
            }
        }
        
        // Sync server data with local quotes
        function syncWithServer() {
            if (serverQuotes.length === 0) {
                showApiNotification('Info', 'No server data available. Fetch data from server first.');
                return;
            }
            
            apiStatus.innerHTML = '<span class="loading"></span> Syncing...';
            apiStatus.className = 'status-value status-warning';
            lastOperation.textContent = 'Syncing...';
            
            addToApiLog('Starting synchronization with server...');
            
            // Simulate processing time
            setTimeout(() => {
                try {
                    let newQuotesAdded = 0;
                    
                    // Merge server quotes into local quotes
                    serverQuotes.forEach(serverQuote => {
                        const localQuoteIndex = quotes.findIndex(q => q.id === serverQuote.id);
                        
                        if (localQuoteIndex === -1) {
                            // New quote from server
                            quotes.push(serverQuote);
                            newQuotesAdded++;
                        }
                    });
                    
                    // Save updated quotes
                    saveQuotesToLocalStorage();
                    populateCategories();
                    
                    // Update status
                    lastOperation.textContent = 'Sync Complete';
                    apiStatus.textContent = 'Sync Complete';
                    apiStatus.className = 'status-value status-success';
                    
                    addToApiLog(`Sync completed. Added ${newQuotesAdded} new quotes from server`);
                    
                    // Show notification
                    showApiNotification('Success', `Synchronization complete! Added ${newQuotesAdded} new quotes.`);
                    
                } catch (error) {
                    apiStatus.textContent = 'Sync Failed';
                    apiStatus.className = 'status-value status-error';
                    lastOperation.textContent = 'Sync Failed';
                    showApiNotification('Error', `Synchronization failed: ${error.message}`);
                    addToApiLog(`Sync failed: ${error.message}`);
                }
            }, 1500);
        }
        
        // Export quotes to JSON file
        function exportQuotes() {
            if (quotes.length === 0) {
                showApiNotification('Info', 'No quotes to export!');
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
            
            addToApiLog('Exported quotes to JSON file');
            showApiNotification('Success', 'Quotes exported successfully!');
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
                
                addToApiLog('Cleared all quotes');
                showApiNotification('Info', 'All quotes have been cleared.');
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
                serverDataContent.innerHTML = `<strong>${serverQuotes.length} quotes from server</strong>\nLast fetched: ${lastOperation.textContent || 'Unknown'}`;
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
        
        // Show API notification
        function showApiNotification(title, content) {
            apiNotificationTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${title}`;
            apiNotificationContent.innerHTML = `<div class="conflict-quote">${content}</div>`;
            apiNotification.style.display = 'block';
        }
        
        // Add entry to API log
        function addToApiLog(message) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.innerHTML = `<strong>[${timeString}]</strong> ${message}`;
            apiLog.prepend(logEntry);
            
            // Keep only the last 5 log entries
            while (apiLog.children.length > 5) {
                apiLog.removeChild(apiLog.lastChild);
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
            postToServerBtn.addEventListener('click', postQuoteToServer);
            exportBtn.addEventListener('click', exportQuotes);
            clearStorageBtn.addEventListener('click', clearAllQuotes);
            categoryFilter.addEventListener('change', filterQuotes);
            fetchServerBtn.addEventListener('click', fetchQuotesFromServer);
            syncNowBtn.addEventListener('click', syncWithServer);
        }