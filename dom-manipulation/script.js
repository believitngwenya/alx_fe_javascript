
    // ... existing variable declarations ...

    // Add new variables for periodic sync
    let lastServerFetchTime = null;
    let periodicSyncInterval = null;
    let syncIntervalMinutes = 5; // Default interval
    
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

    // ... existing functions until fetchQuotesFromServer ...

    // Modified fetchQuotesFromServer function
    async function fetchQuotesFromServer(silent = false) {
        if (!silent) {
            syncStatus.innerHTML = '<span class="loading"></span> Fetching...';
            syncStatus.className = 'status-value status-warning';
            addToSyncLog('Fetching quotes from server...');
        }

        try {
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
                syncStatus.textContent = 'Data Received';
                syncStatus.className = 'status-value status-success';
                addToSyncLog(`Fetched ${serverQuotes.length} quotes from server`);
                showSyncNotification('Success', `Fetched ${serverQuotes.length} quotes from server`);
            }
        } catch (error) {
            if (!silent) {
                syncStatus.textContent = 'Fetch Failed';
                syncStatus.className = 'status-value status-error';
                showSyncNotification('Error', `
                    <p>Failed to fetch quotes: ${error.message}</p>
                    <p>Please check your network connection and try again.</p>
                `);
            }
            addToSyncLog(`Fetch failed: ${error.message}`);
        }
    }

    // New function: Start periodic sync
    function startPeriodicSync() {
        if (periodicSyncInterval) {
            clearInterval(periodicSyncInterval);
        }
        
        // Convert minutes to milliseconds
        const intervalMs = syncIntervalMinutes * 60 * 1000;
        
        periodicSyncInterval = setInterval(() => {
            addToSyncLog(`Automatic server check started (every ${syncIntervalMinutes} minutes)`);
            fetchQuotesFromServer(true); // Silent fetch
            
            // If server data exists, check for updates
            if (serverQuotes.length > 0) {
                checkForServerUpdates();
            }
        }, intervalMs);
        
        addToSyncLog(`Periodic sync started (every ${syncIntervalMinutes} minutes)`);
    }

    // New function: Check for server updates
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
            showSyncNotification('Updates Available', `
                <p>Server has ${updatesFound} updates (${newQuotes.length} new quotes)</p>
                <p>Click "Sync Quotes" to apply updates</p>
            `);
            addToSyncLog(`Server updates detected: ${updatesFound} changes available`);
        }
    }

    // Enhanced syncQuotes function with conflict resolution
    async function syncQuotes() {
        // ... existing sync code until try block ...
        
        try {
            let addedCount = 0;
            let updatedCount = 0;
            let conflicts = 0;
            const conflictDetails = [];
            
            // 1. Sync server quotes to local
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

            // ... rest of existing sync code ...

            // Create detailed sync report
            let report = `
                <div class="conflict-quote">
                    <p><i class="fas fa-check-circle"></i> Added ${addedCount} new quotes from server</p>
                </div>
                <div class="conflict-quote">
                    <p><i class="fas fa-sync-alt"></i> Updated ${updatedCount} quotes (${conflicts} conflicts resolved)</p>
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
            
            // ... rest of report generation ...

        } catch (error) {
            // ... error handling ...
        }
    }

    // ... existing functions ...

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

    // ... rest of existing code ...

    // Add to CSS for conflict details:
    const style = document.createElement('style');
    style.innerHTML = `
        .conflict-detail {
            padding: 8px;
            margin: 5px 0;
            background: rgba(0,0,0,0.2);
            border-radius: 5px;
            font-size: 0.9rem;
            border-left: 3px solid var(--warning);
        }
        
        .conflict-detail p {
            margin: 3px 0;
        }
        
        .sync-frequency {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
    `;
    document.head.appendChild(style);
