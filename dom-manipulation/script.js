let quotes = [
    {text:"The only way to do great work is to love what you do.",category:"Inspiration"},
    {text:"Innovation distinguishes between a leader and a follower.",category:"Business"},
    {text:"Life is what happens when you're busy making other plans.",category:"Life"},
];

document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const formContainer = document.getElementById('formContainer');

    // Display initial random quote
    showRandomQuote();

    // Event listeners
    randomQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', createAddQuoteForm);

    function showRandomQuote() {
        if (quotes.length === 0) {
            quoteDisplay.innerHTML = "No quotes available";
            return;
        }
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        quoteDisplay.innerHTML = `
            <blockquote>"${quote.text}"</blockquote>
            <cite>— ${quote.category}</cite>
        `;
    }

    function createAddQuoteForm() {
        // Clear previous form if exists
        formContainer.innerHTML = '';

        const form = document.createElement('form');
        form.id = 'addQuoteForm';
        form.innerHTML = `
            <div class="form-group">
                <label for="quoteText">Quote Text:</label>
                <textarea id="quoteText" required></textarea>
            </div>
            <div class="form-group">
                <label for="quoteCategory">Category:</label>
                <input type="text" id="quoteCategory" required>
            </div>
            <button type="submit">Add Quote</button>
        `;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('quoteText').value.trim();
            const category = document.getElementById('quoteCategory').value.trim();

            if (text && category) {
                quotes.push({ text, category });
                form.reset();
                alert('Quote added successfully!');
                showRandomQuote();
            }
        });

        formContainer.appendChild(form);
    }
});
