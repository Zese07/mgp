const express = require('express');
const router = express.Router();

router.get('/total/:genre_id', async (req, res) => {
  const { genre_id } = req.params;
  const fetch = await import('node-fetch');
  const apiUrl = `https://api.jikan.moe/v4/anime?genres=${genre_id}`;

  try {
    const response = await fetch.default(apiUrl);
    const data = await response.json();
    const genre_total = data.pagination.items.total;
    res.json(genre_total);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/total/:genreId/unexplored', async (req, res) => {
  try {
    const { genreId } = req.params;
    const exploredIds = req.query.array ? req.query.array.split(',') : [];
    let page = req.query.page || 1;

    const allAnime = [];

    while (true) {
      const apiUrl = `https://api.jikan.moe/v4/anime?genres=${genreId}&page=${page}&limit=25`;

      const response = await fetchWithRetries(apiUrl);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        break;
      }

      const filteredData = data.data.filter(anime => !exploredIds.map(id => id.trim()).includes(anime.mal_id.toString().trim()));


      const animeDetails = filteredData.map(anime => ({
        title: anime.title,
        id: anime.mal_id
      }));

      allAnime.push(...animeDetails);

      if (!data.pagination || !data.pagination.has_next_page) {
        break;
      }

      page++;
    }

    allAnime.sort((a, b) => a.title.localeCompare(b.title));
    res.json(allAnime);
  } catch (error) {
    console.error("Error fetching anime data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function fetchWithRetries(url, retries = 3) {
  let retryDelay = 1000; // Initial delay in milliseconds
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After')) || 1;
          console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        } else {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
      }
      return response;
    } catch (error) {
      console.error(`Error fetching data: ${error.message}`);
      if (i < retries - 1) {
        console.log(`Retrying in ${retryDelay} milliseconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2;
      } else {
        throw error;
      }
    }
  }
}

module.exports = router;
