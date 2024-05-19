var malUsername = "";
var selectedGenreId = 0;
var watching = 0;
var completed = 0;
var on_hold = 0;
var dropped = 0;
var plan_to_watch = 0;
var unexplored = 0;
var explored_ids;
var watching_array = [];
var completed_array = [];
var on_hold_array = [];
var dropped_hold_array = [];
var plan_to_watch_array = [];
var unexplored_array = [];

var data = {
    labels: ['Watching', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch', 'Unexplored'],
    datasets: [{
        data: [watching, completed, on_hold, dropped, plan_to_watch, unexplored],
        backgroundColor: ['red', 'blue', 'green', 'yellow', 'orange', 'purple']
    }]
};

var options = {
    responsive: false,
    onClick: (e, activeEls) => {
        let datasetIndex = activeEls[0].datasetIndex;
        let dataIndex = activeEls[0].index;
        let value = e.chart.data.datasets[datasetIndex].data[dataIndex];
        let label = e.chart.data.labels[dataIndex];
        console.log("In click", label, value);
        clickPie(label.toLowerCase() === 'on-hold' ? 'on_hold' : label.toLowerCase() === 'plan to watch' ? 'plan_to_watch' : label.toLowerCase());
    },
    plugins: {
        datalabels: {
            formatter: (value, ctx) => {
                const datapoints = ctx.chart.data.datasets[0].data
                const total = datapoints.reduce((total, datapoint) => total + datapoint, 0)
                const percentage = (value / total * 100).toFixed(2);
                return percentage > 0 ? percentage + "%" : "";
            },
            color: '#fff',
            font: {
                weight: 'bold'
            },
            anchor: 'outside',
            align: 'end',
            offset: -20,
            textShadowColor: 'black', 
            textShadowBlur: 5
        }
    }
};


var ctx = document.getElementById("myPieChart").getContext('2d');

var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options,
    plugins: [ChartDataLabels],
});

var genres = {
    'Action': 1, 'Adventure': 2, 'Anthropomorphic': 51, 'Award Winning': 46, 'Avant Garde': 5, 'Boys Love': 28, 'CGDCT': 52,
    'Childcare': 53, 'Combat Sports': 54, 'Comedy': 4, 'Crossdressing': 81, 'Delinquents': 55, 'Detective': 39, 'Drama': 8,
    'Ecchi': 9, 'Educational': 56, 'Erotica': 49, 'Fantasy': 10, 'Gag Humor': 57, 'Girls Love': 26, 'Gore': 58,
    'Gourmet': 47, 'Harem': 35, 'Hentai': 12, 'High Stakes Game': 59, 'Historical': 13, 'Horror': 14, 'Idols (Female)': 60,
    'Idols (Male)': 61, 'Isekai': 62, 'Iyashikei': 63, 'Josei': 43, 'Kids': 15, 'Love Polygon': 64, 'Magical Sex Shift': 65,
    'Mahou Shoujo': 66, 'Martial Arts': 17, 'Mecha': 18, 'Medical': 67, 'Military': 38, 'Music': 19, 'Mythology': 6,
    'Organized Crime': 68, 'Otaku Culture': 69, 'Parody': 20, 'Performing Arts': 70, 'Pets': 71, 'Psychological': 40, 'Racing': 3,
    'Reincarnation': 72, 'Reverse Harem': 73, 'Romance': 22, 'Romantic Subtext': 74, 'Samurai': 21, 'School': 23, 'Sci-Fi': 24,
    'Seinen': 42, 'Shoujo': 25, 'Shounen': 27, 'Showbiz': 75, 'Slice of Life': 36, 'Space': 29, 'Sports': 30,
    'Strategy Game': 11, 'Super Power': 31, 'Supernatural': 37, 'Survival': 76, 'Suspense': 41, 'Team Sports': 77, 'Time Travel': 78,
    'Vampire': 32, 'Video Game': 79, 'Visual Arts': 80, 'Workplace': 48
};

async function clickPie(label) {
    console.log(label);
  
    let titles = [];
  
    try {
        
        titles = window[`${label}_array`];
        console.log(titles)

        const modal = document.getElementById("myModal");
        const modalLabel = document.getElementById("modalLabel");
        const modalContent = document.getElementById("modalContent");
        
        modalLabel.textContent = "Titles";
        modalContent.innerHTML = titles.map(anime => `<li><a href="https://myanimelist.net/anime/${anime.id}" target="_blank">${anime.title}</a></li>`).join('');
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error:', error);
    }
}

window.onclick = function(event) {
    const modal = document.getElementById("myModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Event listener for closing modal when clicking the close button
const closeButton = document.querySelector(".close");
if (closeButton) {
    closeButton.onclick = function() {
        const modal = document.getElementById("myModal");
        modal.style.display = "none";
    };
}

function closeNotification(color) {
    var rednotification = document.getElementById('rednotification');
    var greennotification = document.getElementById('greennotification');
    
    if (color === 'red') {
        rednotification.classList.remove('show');
    } else if (color === 'yellow') {
        yellownotification.classList.remove('show');
    } else if (color === 'green') {
        greennotification.classList.remove('show');
    }
}  

async function fetchAndDisplayTitles(status, statusMessage) {
    try {
        var message = statusMessage || `Loading ${status} titles...`;
        const notification = document.getElementById(`yellownotification`);
        const notificationText = document.getElementById(`yellownotificationText`);
        notificationText.textContent = message;
        notification.classList.add('show');

        const response = await fetch(`http://localhost:3000/profile/stats/${malUsername}/${status}/title/${selectedGenreId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${status} titles`);
        }
        window[`${status}_array`] = await response.json();

        closeNotification(status); // assuming you have a closeNotification function

    } catch (error) {
        console.error(`Error fetching ${status} titles:`, error);
        // Handle error: Display error message to the user, or take appropriate action.
    }
}

async function getAnimeTitles(){
    await fetchAndDisplayTitles('watching', 'Loading watching titles...');
    await fetchAndDisplayTitles('completed', 'Loading completed titles...');
    await fetchAndDisplayTitles('on_hold', 'Loading on hold titles...');
    await fetchAndDisplayTitles('dropped', 'Loading dropped titles...');
    await fetchAndDisplayTitles('plan_to_watch', 'Loading plan to watch titles...');

    var message = "Loading unexplored titles..."
    var yellownotification = document.getElementById('yellownotification');
    var yellownotificationText = document.getElementById('yellownotificationText');
    yellownotificationText.textContent = message || "Default notification message";
    yellownotification.classList.add('show');
    
    const titleResponse = await fetch(`http://localhost:3000/genre/total/${selectedGenreId}/unexplored?array=${explored_ids}`);
    const title = await titleResponse.json();
    unexplored_array = title;

    closeNotification("yellow");

    var message = "Data successfuly loaded."
    const notification = document.getElementById(`greennotification`);
    const notificationText = document.getElementById(`greennotificationText`);
    notificationText.textContent = message;
    notification.classList.add('show');
    setTimeout(function() {
        closeNotification("green");
    }, 3000);
}
  
async function submitButton() {
    malUsername = document.getElementById('malUsernameInput').value;
    
    if (!malUsername) {
        document.getElementById('loadingScreen').style.display = 'none';
        setTimeout(() => {
            var message = "Please enter your MyAnimeList username.";
            var rednotification = document.getElementById('rednotification');
            var rednotificationText = document.getElementById('rednotificationText');
            rednotificationText.textContent = message || "Default notification message";
            rednotification.classList.add('show');
            setTimeout(function() {
                closeNotification("red");
            }, 3000);
        }, 20);
        return;
    }

    document.getElementById('loadingScreen').style.display = 'flex';

    console.log("MAL Username:", malUsername);

    selectedGenreId = document.getElementById("genres").value;
    console.log("Selected Genre ID:", selectedGenreId);

    try {
        const response = await fetch(`http://localhost:3000/profile/stats/${malUsername}`);
        if (response.status === 500) {
            document.getElementById('loadingScreen').style.display = 'none';
            setTimeout(() => {
                var message = malUsername + "is not a valid MyAnimeList username.";
                var rednotification = document.getElementById('rednotification');
                var rednotificationText = document.getElementById('rednotificationText');
                rednotificationText.textContent = message || "Default notification message";
                rednotification.classList.add('show');
                setTimeout(function() {
                    closeNotification("red");
                }, 3000);
            }, 20);
            return;
        }      
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile stats: ' + response.status);
        }
        const profile_total = await response.json();
        console.log(profile_total);

        const genreResponse = await fetch(`http://localhost:3000/genre/total/${selectedGenreId}`);
        const genre_total = await genreResponse.json();
        console.log(genre_total);

        const profileGenreResponse = await fetch(`http://localhost:3000/profile/stats/${malUsername}/watching,completed,on_hold,dropped,plan_to_watch/${selectedGenreId}`);
        const profile_genre_total = await profileGenreResponse.json();
        console.log(profile_genre_total);

        watching = profile_genre_total.counts.watching;
        completed = profile_genre_total.counts.completed;
        on_hold = profile_genre_total.counts.on_hold;
        dropped = profile_genre_total.counts.dropped;
        plan_to_watch = profile_genre_total.counts.plan_to_watch;
        unexplored = genre_total - Object.values(profile_genre_total.counts).reduce((total, count) => total + count, 0);
        explored_ids = profile_genre_total.explored;
        
        myPieChart.data.datasets[0].data = [watching, completed, on_hold, dropped, plan_to_watch, unexplored];
        myPieChart.update();

        getAnimeTitles();

    } catch (error) {
        console.error('Error fetching profile stats:', error.message);
    }

    // Hide loading screen
    document.getElementById('loadingScreen').style.display = 'none';
}

var select = document.getElementById("genres");
for (var genre in genres) {
    var option = document.createElement("option");
    option.text = genre;
    option.value = genres[genre];
    select.add(option);
}