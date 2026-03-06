// Only one source for the prototype

const encoded = "aHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlRUYUl2Sk1LaUdUaDgzRVlCOEktUjB4a3haOFJabHFETzFDa3QzdXdHYThqdG8tNmMwYmZLb0Z0R3pVOHp5NlJKVWNkcldleHRqaUhfdS9wdWI/Z2lkPTYwMDY2OTc2MCZzaW5nbGU9dHJ1ZSZvdXRwdXQ9Y3N2";
let resources = [];

/**
 * 1. INITIALIZE: Fetch only the Clubs data
 */
async function init() {
    const CLUBS_URL = atob(encoded);

    const response = await fetch(CLUBS_URL);
    const grid = document.getElementById('sections-wrapper');
    grid.innerHTML = "<div class='loader'>Loading Civic Clubs...</div>";

    try {
        const response = await fetch(CLUBS_URL);
        const csvData = await response.text();

        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                // Map the CSV columns specifically for the Clubs sheet
                resources = results.data.map(row => ({
                    title: row['Club Name'] || 'Unnamed Club',
                    focus: row['Focus Area'] || '',
                    topic: row['Topic Areas'] || '',
                    school: row['Accessibility '] || 'All University',
                    description: row['Brief Explanation'] || 'No description available yet.',
                    link: row['Link'] || '#'
                }));

                displayResources(resources);
                setupEventListeners();
            }
        });
    } catch (error) {
        grid.innerHTML = "<p>Error loading data. Please check your connection.</p>";
        console.error("Fetch Error:", error);
    }
}

/**
 * 2. RENDER: Build the cards into the grid
 */
function displayResources(data) {
    const grid = document.getElementById('sections-wrapper');
    const noResults = document.getElementById('no-results');
    const feedback = document.getElementById('filter-feedback');

    grid.innerHTML = "";
    feedback.innerHTML = `Showing <strong>${data.length}</strong> clubs`;

    if (data.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    // Create a simple grid for the cards
    const gridContainer = document.createElement('div');
    gridContainer.className = 'section-grid';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const primaryTag = item.topic.split(',')[0].trim() || 'Civic';

        card.innerHTML = `
            <div class="card-tag">${primaryTag}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="card-footer">
                <span class="location"><i class="fas fa-university"></i> ${item.school}</span>
                <a href="${item.link}" target="_blank" class="view-btn">Learn More <i class="fas fa-external-link-alt"></i></a>
            </div>
        `;
        gridContainer.appendChild(card);
    });

    grid.appendChild(gridContainer);
}

/**
 * 3. FILTER LOGIC
 */
function applyFilters() {
    const searchVal = document.getElementById('search-input').value.toLowerCase();
    const collegeVal = document.getElementById('college-filter').value;
    const selectedFocus = Array.from(document.querySelectorAll('.focus-cb:checked')).map(cb => cb.value);
    const selectedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);

    const filtered = resources.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchVal) ||
            item.description.toLowerCase().includes(searchVal);

        const matchesCollege = collegeVal === 'all' ||
            item.school.includes(collegeVal) ||
            item.school.includes('All University');

        const matchesFocus = selectedFocus.length === 0 ||
            selectedFocus.some(f => item.focus.includes(f));

        const matchesTopic = selectedTopics.length === 0 ||
            selectedTopics.some(t => item.topic.includes(t));

        return matchesSearch && matchesCollege && matchesFocus && matchesTopic;
    });

    displayResources(filtered);
}

/**
 * 4. EVENTS
 */
function setupEventListeners() {
    document.getElementById('search-btn').addEventListener('click', applyFilters);

    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    document.getElementById('college-filter').addEventListener('change', applyFilters);

    document.querySelectorAll('.focus-cb, .topic-cb').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('search-input').value = "";
        document.getElementById('college-filter').value = "all";
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        displayResources(resources);
    });
}

// Start
init();