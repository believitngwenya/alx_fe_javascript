// Quote array with initial data
        let quotes = [];
        
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
        const quoteCount = document.getElementById('quoteCount');
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            loadQuotesFromStorage();
            showLastSessionQuote();
            updateStorageDisplays();
            setupEventListeners();
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
        }
        
        // Get default quotes if none are stored
        function getDefaultQuotes() {
            return [
                { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
                { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
                { text: "Life is what happens when you're busy making other plans.", category: "Life" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Motivation" },
                { text: "Be the change that you wish to see in the world.", category: "Wisdom" }
            ];
        }
        
        // Save quotes to localStorage
        function saveQuotesToLocalStorage() {
            localStorage.setItem('quotes', JSON.stringify(quotes));
            updateStorageDisplays();
            updateQuoteCount();
        }
        
        // Show random quote
        function showRandomQuote() {
            if (quotes.length === 0) {
                quoteDisplay.innerHTML = '<p class="no-quotes">No quotes available. Add some quotes!</p>';
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const quote = quotes[randomIndex];
            displayQuote(quote);
            
            // Store last viewed quote in sessionStorage
            sessionStorage.setItem('lastQuote', JSON.stringify(quote));
            updateStorageDisplays();
        }
        
        // Display a quote
        function displayQuote(quote) {
            quoteDisplay.innerHTML = `
                <blockquote>${quote.text}</blockquote>
                <cite>— ${quote.category}</cite>
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
                    const importedQuotes = JSON.parse(e.target.result);
                    if (Array.isArray(importedQuotes) ){
                        quotes.push(...importedQuotes);
                        saveQuotesToLocalStorage();
                        showRandomQuote();
                        alert(`Successfully imported ${importedQuotes.length} quotes!`);
                    }  else {
                        alert('Invalid format: The file should contain an array of quotes.');
                    }
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
                sessionStorage.removeItem('lastQuote');
                quoteDisplay.innerHTML = '<p class="no-quotes">All quotes have been cleared.</p>';
                updateStorageDisplays();
                updateQuoteCount();
            }
        }
        
        // Update storage information displays
        function updateStorageDisplays() {
            // Local storage display
            const storedQuotes = localStorage.getItem('quotes');
            if (storedQuotes) {
                localStorageContent.textContent = `${quotes.length} quotes stored`;
            } else {
                localStorageContent.textContent = 'No quotes in local storage';
            }
            
            // Session storage display
            const lastQuote = sessionStorage.getItem('lastQuote');
            if (lastQuote) {
                try {
                    const quoteObj = JSON.parse(lastQuote);
                    sessionStorageContent.innerHTML = `Last viewed: <em>"${quoteObj.text}"</em> (${quoteObj.category})`;
                } catch (e) {
                    sessionStorageContent.textContent = 'Error reading last quote';
                }
            } else {
                sessionStorageContent.textContent = 'No recent quote in session storage';
            }
        }
        
        // Update quote count display
        function updateQuoteCount() {
            quoteCount.textContent = quotes.length;
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
        }