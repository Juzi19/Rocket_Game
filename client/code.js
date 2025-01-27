async function fetchTop10() {
    try {
        const response = await fetch('/api/leaders');
        if (!response.ok) {
            throw new Error(`Fehler: ${response.status}`);
        }

        const data = await response.json();
        displayLeaderboard(data);
    } catch (error) {
        console.error('Fehler beim Abrufen der Top-10-Daten:', error);
    }
}

function displayLeaderboard(entries) {
    const leaderboard = document.getElementById('leaderboard2');
    leaderboard.innerHTML = ''; // clear previous items
    entries.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${entry.name} - ${entry.coins} Coins`;
        leaderboard.appendChild(listItem);
    });
}

// fetches and shows data
fetchTop10();
