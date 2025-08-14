        // Quote array with initial data
        let quotes = [];
        let selectedCategory = 'all';
        
        // DOM elements
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteBtn = document.getElementById('newQuote');
        const addQuoteBtn = document.getElementById('addQuoteBtn');
        const formContainer = document.getElementById('formContainer');
        const exportBtn = document.getElementById('exportBtn');
        const importFile = document.getElementById('importFile');
        const clearStorageBtn = document.getElementById('clearStorageBtn');
        const submitQuoteBtn = document.getElementById('submitQuoteBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const localStorageContent = document.getElementById('localStorageContent');
        const sessionStorageContent = document.getElementById('sessionStorageContent');
        const categoryInfo = document.getElementById('categoryInfo');
        const categoryFilter = document.getElementById('categoryFilter');
        const totalQuoteCount = document.getElementById('totalQuoteCount');
        const filteredCount = document.getElementById('filteredCount');
        const currentFilterSpan = document.getElementById('currentFilter');
        const quickCategoryFilters = document.getElementById('quickCategoryFilters');
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            loadQuotesFromStorage();
            showLastSessionQuote();
            populateCategories();
            updateStorageDisplays();
            setupEventListeners();
            updateCategoryInfo();
            updateQuoteCount();
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
                { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
                { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
                { text: "Life is what happens when you're busy making other plans.", category: "Life" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Motivation" },
                { text: "Be the change that you wish to see in the world.", category: "Wisdom" },
                { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" },
                { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Life" },
                { text: "Don't watch the clock; do what it does. Keep going.", category: "Motivation" },
                { text: "The only impossible journey is the one you never begin.", category: "Inspiration" }
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
            
            // Clear quick filter buttons
            quickCategoryFilters.innerHTML = '';
            
            // Create "All" quick filter button
            const allButton = document.createElement('button');
            allButton.className = `filter-btn ${selectedCategory === 'all' ? 'active' : ''}`;
            allButton.innerHTML = '<i class="fas fa-layer-group"></i> All';
            allButton.addEventListener('click', () => {
                categoryFilter.value = 'all';
                filterQuotes();
            });
            quickCategoryFilters.appendChild(allButton);
            
            // Extract unique categories
            const categories = [...new Set(quotes.map(quote => quote.category))];
            categories.sort();
            
            // Add options to dropdown and create quick filter buttons
            categories.forEach(category => {
                // Add to dropdown
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
                
                // Create quick filter button
                const button = document.createElement('button');
                button.className = `filter-btn ${selectedCategory === category ? 'active' : ''}`;
                button.innerHTML = `<i class="fas fa-tag"></i> ${category}`;
                button.addEventListener('click', () => {
                    categoryFilter.value = category;
                    filterQuotes();
                });
                quickCategoryFilters.appendChild(button);
            });
            
            // Set the selected category
            categoryFilter.value = selectedCategory;
            
            // Update category info
            updateCategoryInfo();
        }
        
        // Filter quotes based on selected category
        function filterQuotes() {
            selectedCategory = categoryFilter.value;
            localStorage.setItem('quoteFilter', selectedCategory);
            currentFilterSpan.textContent = selectedCategory === 'all' ? 'All Categories' : selectedCategory;
            
            // Update active state for quick filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            if (selectedCategory === 'all') {
                document.querySelector('.filter-btn:first-child').classList.add('active');
                filteredCount.textContent = '';
            } else {
                const activeButton = [...document.querySelectorAll('.filter-btn')].find(
                    btn => btn.textContent.includes(selectedCategory)
                );
                if (activeButton) activeButton.classList.add('active');
                
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
                <div class="category-tag">${quote.category}</div>
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
                quotes.push({ text, category });
                saveQuotesToLocalStorage();
                formContainer.style.display = 'none';
                document.getElementById('quoteText').value = '';
                document.getElementById('quoteCategory').value = '';
                
                // Update categories and show new quote
                populateCategories();
                showRandomQuote();
                
                alert('Quote added successfully!');
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
        }
        
        // Import quotes from JSON file
        function importQuotes(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate imported data structure
                    if (!Array.isArray(importedData)) {
                        alert('Invalid format: The file should contain an array of quotes.');
                        return;
                    }
                    
                    let validQuotes = [];
                    let invalidCount = 0;
                    
                    for (const item of importedData) {
                        // Validate quote structure
                        if (item && typeof item.text === 'string' && item.text.trim() !== '' && 
                            typeof item.category === 'string' && item.category.trim() !== '') {
                            
                            validQuotes.push({
                                text: item.text.trim(),
                                category: item.category.trim()
                            });
                        } else {
                            invalidCount++;
                        }
                    }
                    
                    if (validQuotes.length === 0) {
                        alert('No valid quotes found in the file.');
                        return;
                    }
                    
                    // Add valid quotes to collection
                    quotes.push(...validQuotes);
                    saveQuotesToLocalStorage();
                    populateCategories();
                    showRandomQuote();
                    
                    // Provide detailed import report
                    let message = `Successfully imported ${validQuotes.length} quotes!`;
                    if (invalidCount > 0) {
                        message += `\n${invalidCount} invalid items were skipped.`;
                    }
                    alert(message);
                    
                } catch (error) {
                    alert('Error parsing JSON file: ' + error.message);
                }
            };
            reader.readAsText(file);
            
            // Reset the input to allow importing the same file again
            event.target.value = '';
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
            
            // Session storage display
            const lastQuote = sessionStorage.getItem('lastQuote');
            if (lastQuote) {
                try {
                    const quoteObj = JSON.parse(lastQuote);
                    const lastViewed = sessionStorage.getItem('lastViewed') || 'Unknown';
                    sessionStorageContent.innerHTML = `<strong>Last viewed:</strong>\n"${quoteObj.text}"\n<em>(${quoteObj.category})</em>\n\nViewed: ${lastViewed}`;
                } catch (e) {
                    sessionStorageContent.textContent = 'Error reading last quote';
                }
            } else {
                sessionStorageContent.textContent = 'No recent quote in session storage';
            }
        }
        
        // Update category information
        function updateCategoryInfo() {
            const categories = [...new Set(quotes.map(quote => quote.category))];
            categories.sort();
            
            if (categories.length === 0) {
                categoryInfo.innerHTML = '<p>No categories available</p>';
                return;
            }
            
            let infoHTML = `<p><strong>${categories.length} categories:</strong></p><ul>`;
            
            categories.forEach(category => {
                const count = quotes.filter(q => q.category === category).length;
                infoHTML += `<li>${category} <span class="highlight">(${count})</span></li>`;
            });
            
            infoHTML += '</ul>';
            categoryInfo.innerHTML = infoHTML;
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
            importFile.addEventListener('change', importQuotes);
            clearStorageBtn.addEventListener('click', clearAllQuotes);
            categoryFilter.addEventListener('change', filterQuotes);
        }