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
  const { genreId } = req.params;
  const exploredIds = req.query.array || '';
  let page = req.query.page || 1;

  const fetch = await import('node-fetch');
  let allAnime = [];

  while (true) {
    const apiUrl = `https://api.jikan.moe/v4/anime?genres=${genreId}&page=${page}&limit=25`;

    try {
      const response = await fetch.default(apiUrl);
      const data = await response.json();

      const filteredData = data.data.filter(anime => !exploredIds.includes(anime.mal_id.toString()));

      const animeDetails = filteredData.map(anime => ({
        title: anime.title,
        id: anime.mal_id
      }));

      allAnime = allAnime.concat(animeDetails);

      if (!data.pagination || !data.pagination.has_next_page) {
        break;
      }

      page++;
    } catch (error) {
      console.error("Error fetching anime data:", error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
  }

  allAnime.sort((a, b) => a.title.localeCompare(b.title));
  res.json(allAnime);
});

module.exports = router;