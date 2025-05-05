document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const resultsDiv = document.getElementById('results');
    const messageDiv = document.getElementById('message');

    // Helper function to show messages
    function showMessage(message, type = 'error') {
        const bgColor = type === 'error' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';
        const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';
        
        messageDiv.innerHTML = `
            <div class="rounded-md ${bgColor} p-4 border-l-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} ${textColor}"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm ${textColor}">${message}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper function to show loading state
    function showLoading() {
        resultsDiv.innerHTML = `
            <div class="col-span-2 flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        `;
    }

    // Helper function to render a result card
    function renderResultCard(source, data) {
        if (!data) return '';

        // For MusicBrainz, flatten some nested data for display
        if (source.toLowerCase().includes('musicbrainz')) {
            const title = data.title || 'N/A';
            const artist = (data['artist-credit'] && data['artist-credit'][0] && data['artist-credit'][0].name) || 'N/A';
            const releaseDate = (data.releases && data.releases[0] && data.releases[0].date) || 'N/A';
            const isrcs = (data.isrcs && data.isrcs.length > 0) ? data.isrcs.join(', ') : 'N/A';

            return `
                <div class="result-card bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 fade-in">
                    <div class="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-blue-600">
                        <h3 class="text-lg leading-6 font-medium text-white">
                            ${source} Results
                        </h3>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                        <dl class="grid grid-cols-1 gap-x-4 gap-y-6">
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">TITLE</dt>
                                <dd class="mt-1 text-sm text-gray-900">${title}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">ARTIST</dt>
                                <dd class="mt-1 text-sm text-gray-900">${artist}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">RELEASE DATE</dt>
                                <dd class="mt-1 text-sm text-gray-900">${releaseDate}</dd>
                            </div>
                            <div class="sm:col-span-1">
                                <dt class="text-sm font-medium text-gray-500">ISRC</dt>
                                <dd class="mt-1 text-sm text-gray-900">${isrcs}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            `;
        }

        // Default rendering for other sources
        return `
            <div class="result-card bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 fade-in">
                <div class="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-blue-600">
                    <h3 class="text-lg leading-6 font-medium text-white">
                        ${source} Results
                    </h3>
                </div>
                <div class="px-4 py-5 sm:p-6">
                    <pre class="whitespace-pre-wrap text-sm text-gray-900">${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        `;
    }

    // Handle form submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageDiv.innerHTML = '';
        
        const songName = document.getElementById('songName').value.trim();
        const isrc = document.getElementById('isrc').value.trim();

        // Validate input
        if (!songName && !isrc) {
            showMessage('Please enter either a song name or an ISRC code.');
            return;
        }

        // Show loading state
        showLoading();

        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (songName) params.append('songName', songName);
            if (isrc) params.append('isrc', isrc);

            // Make API request
            const response = await fetch(`/api/music/search?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch results');
            }

            // Clear previous results
            resultsDiv.innerHTML = '';

            // Check if we have any results
            if (!data.results.iswc && !data.results.isrc && !data.results.musicbrainzSong && !data.results.musicbrainzISRC) {
                showMessage('No results found for your search.', 'info');
                return;
            }

            // Render results
            if (data.results.iswc) {
                resultsDiv.innerHTML += renderResultCard('ISWC', data.results.iswc);
            }
            if (data.results.musicbrainzSong) {
                resultsDiv.innerHTML += renderResultCard('MusicBrainz (Song Name)', data.results.musicbrainzSong);
            }
            if (data.results.isrc) {
                resultsDiv.innerHTML += renderResultCard('ISRC', data.results.isrc);
            }
            if (data.results.musicbrainzISRC) {
                resultsDiv.innerHTML += renderResultCard('MusicBrainz (ISRC)', data.results.musicbrainzISRC);
            }

            // Show success message
            showMessage('Search completed successfully!', 'success');

        } catch (error) {
            console.error('Search error:', error);
            showMessage(error.message || 'An error occurred while searching. Please try again.');
        }
    });

    // Add input validation and formatting
    const isrcInput = document.getElementById('isrc');
    isrcInput.addEventListener('input', (e) => {
        // Remove any non-alphanumeric characters
        let value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
        // Convert to uppercase
        value = value.toUpperCase();
        // Limit to 12 characters (ISRC standard length)
        value = value.slice(0, 12);
        e.target.value = value;
    });
});
