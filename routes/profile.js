const express = require('express');
const router = express.Router();

router.get('/stats/:username', async (req, res) => {
  const { username } = req.params;
  const fetch = await import('node-fetch');
  const apiUrl = `https://api.jikan.moe/v4/users/${username}/statistics`;

  try {
    const response = await fetch.default(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch profile statistics');
    }
    const data = await response.json();
    if (!data || !data.data || !data.data.anime) {
      throw new Error('Invalid response data format');
    }
    const animeStats = data.data.anime;
    res.json(animeStats);
  } catch (error) {
    console.error("Error fetching profile statistics:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/stats/:username/:statuses/:genre_id', async (req, res) => {
  const { username, statuses, genre_id } = req.params;
  const statusesArray = statuses.split(',');

  const apiUrlBase = `https://api.myanimelist.net/v2/users/${username}/animelist?fields=genres,list_status&limit=1000`;

  const headers = {
    'Authorization': 'Bearer ' + process.env.BEARER
  };

  const fetchAnimeData = async (status) => {
    let totalCount = 0;
    let exploredIds = []; 

    let offset = 0;
    const pageSize = 1000;

    try {
      const fetch = await import('node-fetch');
      while (true) {
        const apiUrl = `${apiUrlBase}&status=${status}&genre_id=${genre_id}&offset=${offset}`;
        const response = await fetch.default(apiUrl, { headers });
        const data = await response.json();

        if (!data.data || data.data.length === 0) break;

        const pageAnimeData = data.data.filter(item => {
          return item.node.genres && item.node.genres.some(genre => genre.id === parseInt(genre_id));
        });

        const pageExploredIds = pageAnimeData.map(item => item.node.id);

        totalCount += pageAnimeData.length;
        exploredIds = [...exploredIds, ...pageExploredIds];

        offset += pageSize;
      }

      return { totalCount, exploredIds };
    } catch (error) {
      console.error(`Error fetching data for status "${status}":`, error);
      throw error;
    }
  };


  const fetchCountsForAllStatuses = async () => {
    const allCounts = {};
    let allExploredIds = [];

    for (const status of statusesArray) {
      try {
        const { totalCount, exploredIds } = await fetchAnimeData(status);
        allCounts[status] = totalCount;
        allExploredIds = [...allExploredIds, ...exploredIds]; 
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Internal Server Error for status "${status}"` });
        return;
      }
    }

    res.json({ counts: allCounts, explored: allExploredIds.join(', ') });
  };

  fetchCountsForAllStatuses();
});


router.get('/stats/:username/:status/title/:genre_id', async (req, res) => {
  const { username, status, genre_id } = req.params;

  const apiUrlBase = `https://api.myanimelist.net/v2/users/${username}/animelist?fields=genres,list_status&status=${status}&limit=1000`;

  const headers = {
    'Authorization': 'Bearer ' + process.env.BEARER
  };

  const fetchAnimeData = async () => {
    let animeList = [];
    let offset = 0;
    const pageSize = 1000;

    try {
      const fetch = await import('node-fetch');
      while (true) {
        const apiUrl = `${apiUrlBase}&genre_id=${genre_id}&offset=${offset}`;
        const response = await fetch.default(apiUrl, { headers });
        const data = await response.json();

        if (!data.data || data.data.length === 0) break;

        const pageAnime = data.data
          .filter(item => item.node.genres && item.node.genres.some(genre => genre.id === parseInt(genre_id)))
          .map(item => ({
            title: item.node.title,
            id: item.node.id
          }));

        animeList = [...animeList, ...pageAnime];

        offset += pageSize;
      }

      return animeList;
    } catch (error) {
      console.error(`Error fetching data for status "${status}":`, error);
      throw error;
    }
  };

  try {
    const titles = await fetchAnimeData();
    res.json(titles);
  } catch (error) {
    console.error('Error fetching anime titles:', error);
    res.status(500).json({ error: 'Failed to fetch anime titles' });
  }
});

module.exports = router;
