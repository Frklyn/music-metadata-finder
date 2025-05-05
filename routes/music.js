const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper functions for API calls
async function fetchISWCnetData(query) {
  if (!process.env.ISWCNET_API_URL || !process.env.ISWCNET_API_KEY) {
    return null;
  }
  try {
    const options = {
      method: 'GET',
      url: process.env.ISWCNET_API_URL,
      params: { search: query },
      headers: { 'Authorization': `Bearer ${process.env.ISWCNET_API_KEY}` },
      timeout: 5000
    };
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error('ISWC API Error:', error.message);
    return null;
  }
}

async function fetchIFPIISRCData(isrc) {
  if (!process.env.IFPI_API_URL || !process.env.IFPI_API_KEY) {
    return null;
  }
  try {
    const options = {
      method: 'GET',
      url: process.env.IFPI_API_URL,
      params: { isrc },
      headers: { 'Authorization': `Bearer ${process.env.IFPI_API_KEY}` },
      timeout: 5000
    };
    const response = await axios(options);
    return response.data;
  } catch (error) {
    console.error('IFPI API Error:', error.message);
    return null;
  }
}

// New helper functions for MusicBrainz API
async function fetchMusicBrainzByISRC(isrc) {
  try {
    const url = `https://musicbrainz.org/ws/2/recording?query=isrc:${encodeURIComponent(isrc)}&fmt=json`;
    const response = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': 'MusicMetadataFinder/1.0 ( your-email@example.com )' } });
    if (response.data && response.data.recordings && response.data.recordings.length > 0) {
      return response.data.recordings[0];
    }
    return null;
  } catch (error) {
    console.error('MusicBrainz ISRC API Error:', error.message);
    return null;
  }
}

async function fetchMusicBrainzBySongName(songName) {
  try {
    const url = `https://musicbrainz.org/ws/2/recording?query=recording:"${encodeURIComponent(songName)}"&fmt=json`;
    const response = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': 'MusicMetadataFinder/1.0 ( your-email@example.com )' } });
    if (response.data && response.data.recordings && response.data.recordings.length > 0) {
      return response.data.recordings[0];
    }
    return null;
  } catch (error) {
    console.error('MusicBrainz SongName API Error:', error.message);
    return null;
  }
}

router.get('/search', async (req, res) => {
  const { songName, isrc } = req.query;
  
  try {
    if (!songName && !isrc) {
      return res.status(400).json({
        error: 'Please provide at least a song name or an ISRC code'
      });
    }

    // Prepare API calls based on provided parameters
    const promises = [];
    if (songName) {
      promises.push(fetchISWCnetData(songName));
      promises.push(fetchMusicBrainzBySongName(songName));
    }
    if (isrc) {
      promises.push(fetchIFPIISRCData(isrc));
      promises.push(fetchMusicBrainzByISRC(isrc));
    }

    // Wait for all API calls to complete
    const results = await Promise.all(promises);

    // Map results
    const response = {
      query: {
        songName: songName || null,
        isrc: isrc || null
      },
      results: {
        iswc: songName ? results[0] : null,
        musicbrainzSong: songName ? results[1] : null,
        isrc: isrc ? results[songName ? 2 : 0] : null,
        musicbrainzISRC: isrc ? results[songName ? 3 : 1] : null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch metadata. Please try again later.'
    });
  }
});

module.exports = router;
