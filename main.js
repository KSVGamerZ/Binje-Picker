const recommendationsContainer = document.getElementById('recommendations');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

function createMovieCard(movie) {
    const placeholderImage = 'https://via.placeholder.com/300x450?text=No+Image';
    return `
    <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        <img src="${placeholderImage}" alt="${movie.SeriesTitle}" class="w-full md:w-48 object-cover"/>
        <div class="p-4 flex flex-col justify-between">
            <h3 class="font-bold text-xl mb-2">${movie.SeriesTitle}</h3>
            <p class="text-sm text-gray-700 mb-2">${movie.Genre}</p>
            <p class="text-sm mb-2">${movie.Overview ? movie.Overview.slice(0,150) + '...' : ''}</p>
            <div class="font-semibold text-purple-700">IMDb: ${movie.IMDBRating}</div>
        </div>
    </div>`;
}

async function fetchRecommendations(query) {
    if (!query.trim()) {
        recommendationsContainer.innerHTML = `<p class="text-white text-center">Please enter a search query.</p>`;
        return;
    }
    recommendationsContainer.innerHTML = `<p class="text-white text-center">Loading...</p>`;
    try {
        const response = await fetch('/recommend', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query})
        });
        const data = await response.json();
        console.log('API response:', data);
        if (data.error) {
            recommendationsContainer.innerHTML = `<p class="text-white text-center">${data.error}</p>`;
        } else if (Array.isArray(data) && data.length) {
            recommendationsContainer.innerHTML = data.map(createMovieCard).join('');
        } else {
            recommendationsContainer.innerHTML = `<p class="text-white text-center">No recommendations found.</p>`;
        }
    } catch (err) {
        console.error('Fetch error:', err);
        recommendationsContainer.innerHTML = `<p class="text-white text-center">Error fetching data.</p>`;
    }
}

searchBtn.onclick = () => fetchRecommendations(searchInput.value);
searchInput.onkeypress = (e) => {
    if (e.key === 'Enter') fetchRecommendations(searchInput.value);
};
