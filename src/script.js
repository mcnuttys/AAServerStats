//const base_url = "https://localhost:3000";
const base_url = "https://aaserverstats-df8905e9512c.herokuapp.com";

let serverView, playerView, dataView;

let serversPageOption, playersPageOption, dataPageOption;

// Loaders
let serverLoader;
let playerLoader;
let dataLoader;

// Server View
let serverListHolder;

// Players View
let teamsHolder;
let playerAlphaHolder;
let playerBravoHolder;
let playerSpectatorHolder;

// Data View
let dataHolder;
let playerSummerysHolder;

let currentIP;

const init = async () => {
    serverView = document.querySelector('#servers_view');
    playerView = document.querySelector('#players_view');
    dataView = document.querySelector('#data_view');

    serversPageOption = document.querySelector('#servers_page_option');
    playersPageOption = document.querySelector('#players_page_option');
    dataPageOption = document.querySelector('#data_page_option');

    serverLoader = document.querySelector("#server_loader");
    playerLoader = document.querySelector("#player_loader");
    dataLoader = document.querySelector("#data_loader");

    serverListHolder = document.querySelector("#server_holder");

    teamsHolder = document.querySelector('#teams_holder');
    playerAlphaHolder = document.querySelector("#player_alphalist");
    playerBravoHolder = document.querySelector("#player_bravolist");
    playerSpectatorHolder = document.querySelector("#player_spectatorlist");

    dataHolder = document.querySelector('#data_holder')
    playerSummerysHolder = document.querySelector('#data_player_list');

    document.querySelector("#server_refresh_button").onclick = displayServerList;
    document.querySelector("#player_refresh_button").onclick = () => displayPlayerList(currentIP);

    serversPageOption.onclick = displayServerList;
    playersPageOption.onclick = () => {
        if (servers.length <= 0)
            return;

        if (currentIP === undefined)
            currentIP = servers[0].ip;

        displayPlayerList(currentIP);
    }
    dataPageOption.onclick = () => {
        if (servers.length <= 0)
            return;

        if (currentIP === undefined)
            currentIP = servers[0].ip;

        displayDataView(currentIP);
    }

    displayServerList();
}

let servers = [];
const displayServerList = async () => {
    serverView.className = "center";
    playerView.className = "right";
    dataView.className = "right"

    serversPageOption.className = 'one-third column active';
    playersPageOption.className = 'one-third column';
    dataPageOption.className = 'one-third column';

    serverLoader.className = "loader";

    clearServerList(serverListHolder);
    await retrieveServerList();
    populateServerList(servers, serverListHolder);

    serverLoader.className = "hidden";
}

const clearServerList = () => {
    while (serverListHolder.firstChild) {
        serverListHolder.removeChild(serverListHolder.firstChild);
    }
}

const retrieveServerList = async () => {
    servers = [];
    let serverlistResponse = await fetch(`${base_url}/serverlist`);
    servers = await serverlistResponse.json();
}

const populateServerList = () => {
    servers.forEach(server => {
        let newLine = document.createElement('div');
        newLine.innerHTML = newServerElement(server.ip, server.name, server.map, server.players, server.maxPlayers);

        serverListHolder.appendChild(newLine);
    })
}

const newServerElement = (ip, servername, map, playerCount, maxPlayers) => {
    return `
    <div class="row server" onClick=clickServer("${ip}")>
        <div class="six columns">${servername}</div>
        <div class="four columns">${map.split('$')[0]}</div>
        <div class="two columns">${playerCount}/${maxPlayers}</div>
    </div>`;
}

const clickServer = (ip) => {
    displayPlayerList(ip);
}

const displayPlayerList = async (ip) => {
    serverView.className = "left";
    playerView.className = "center";
    dataView.className = "right"

    serversPageOption.className = 'one-third column';
    playersPageOption.className = 'one-third column active';
    dataPageOption.className = 'one-third column';

    playerLoader.className = 'loader';
    teamsHolder.className = 'hidden';

    let server = servers.find(server => server.ip === ip);
    document.querySelector("#playerlist_server_name").innerHTML = server.name;
    document.querySelector("#playerlist_server_map").innerHTML = server.map;

    clearPlayerLists();
    let players = await retrieveServerPlayerList(ip);
    players = players.players;
    players.sort((a, b) => parseInt(b.score) - parseInt(a.score));

    if (players.some(p => p.team === '-1'))
        document.querySelector("#player_spectators_title").className = '';
    else
        document.querySelector("#player_spectators_title").className = 'hidden';

    if (players.some(p => p.steamid === 0))
        document.querySelector('#noid_disclaimer').className = 'noid';
    else
        document.querySelector('#noid_disclaimer').className = 'hidden';

    populatePlayerLists(players);

    playerLoader.className = 'hidden';
    teamsHolder.className = '';

    currentIP = ip;
}

const clearPlayerLists = () => {
    while (playerAlphaHolder.firstChild) {
        playerAlphaHolder.removeChild(playerAlphaHolder.firstChild);
    }
    while (playerBravoHolder.firstChild) {
        playerBravoHolder.removeChild(playerBravoHolder.firstChild);
    }
    while (playerSpectatorHolder.firstChild) {
        playerSpectatorHolder.removeChild(playerSpectatorHolder.firstChild);
    }
}

const retrieveServerPlayerList = async (ip) => {
    let playerListResponse = await fetch(`${base_url}/playerlist?serverip=${ip}`);
    return await playerListResponse.json();
}

const populatePlayerLists = (players) => {
    players.forEach(player => {
        let newLine = document.createElement('div');

        if (player.team === '0' || player.team === '1') {
            if (player.steamid === 0)
                newLine.innerHTML = newPlayerElement(player.name, player.duration, player.score);
            else
                newLine.innerHTML = newPlayerElementSteamID(player.steamid, player.name, player.duration, player.score);
        }

        if (player.team === '-1') {
            if (player.steamid === 0)
                newLine.innerHTML = newSpectatorElement(player.name, player.duration, player.score);
            else
                newLine.innerHTML = newSpectatorElementSteamID(player.steamid, player.name, player.duration, player.score);
        }

        if (player.team === '0')
            playerAlphaHolder.appendChild(newLine);
        if (player.team === '1')
            playerBravoHolder.appendChild(newLine);
        if (player.team === '-1')
            playerSpectatorHolder.appendChild(newLine);
    });
}

const newPlayerElementSteamID = (steamid, name, duration, score) => {
    return `
    <div id=${steamid} class="row player id">
        <div class="ten columns"><a href="https://aastats.com/player_stats.php?guid=${name}" target="_blank">${name}</a></div>
        <div class="two columns">${score}</div>
    </div>`
}

const newPlayerElement = (name, duration, score) => {
    return `
    <div class="row player noid">
        <div class="ten columns">${name}</div>
        <div class="two columns">${score}</div>
    </div>`
}

const newSpectatorElementSteamID = (steamid, name) => {
    return `<div id=${steamid} class="row spectator id"><a href="https://aastats.com/player_stats.php?guid=${name}" target="_blank">${name}</a></div>`
}

const newSpectatorElement = (name) => {
    return `<div class="row spectator noid">${name}</div>`
}

let playerSummeries = [];
let playerStats = [];

const displayDataView = async (ip) => {
    serverView.className = "left";
    playerView.className = "left";
    dataView.className = "center"

    serversPageOption.className = 'one-third column';
    playersPageOption.className = 'one-third column';
    dataPageOption.className = 'one-third column active';

    dataLoader.className = "loader";
    dataHolder.className = "hidden";

    playerSummeries = await retrievePlayerSummeries(ip);
    playerStats = await retrievePlayerStats(ip);

    playerStats.sort((a, b) => b.playtime - a.playtime);
    playerSummeries.sort((a, b) => playerStats.find(p => p.steamID === b.steamid).playtime - playerStats.find(p => p.steamID === a.steamid).playtime);

    //console.dir(playerStats);
    //console.dir(playerSummeries);

    //let data = JSON.stringify(playerStats);
    //let type = "application/json", name = 'stats.json';
    //
    //let blob = new Blob([data], { type });
    //let url = window.URL.createObjectURL(blob);
    //
    //console.dir("Downlaod");
    //let link = document.createElement('a');
    //link.downlaod = name;
    //link.href = url;
    //link.click();
    //
    //window.URL.revokeObjectURL(url);

    dataLoader.className = "hidden";
    dataHolder.className = "";

    clearPlayerSummeriesList();
    populatePlayerSummeries();

    populateStatHistogram('Accuracy');
}

const retrievePlayerSummeries = async (ip) => {
    let playerSummeriesResponse = await fetch(`${base_url}/playersummaries?serverip=${ip}`);
    let playerSummeries = await playerSummeriesResponse.json();
    playerSummeries = playerSummeries.players;
    return playerSummeries;
}

const retrievePlayerStats = async (ip) => {
    let playerStatsResponse = await fetch(`${base_url}/playerstats?serverip=${ip}`);
    let stats = await playerStatsResponse.json();
    stats = stats.map(s => s.playerstats);
    return await stats;
}

const clearPlayerSummeriesList = () => {
    while (playerSummerysHolder.firstChild) {
        playerSummerysHolder.removeChild(playerSummerysHolder.firstChild);
    }
}

const populatePlayerSummeries = () => {
    playerSummeries.forEach(player => {
        let stats = playerStats.find(p => p.steamID === player.steamid)
        let icon = player.avatar;
        let name = player.personaname;
        let playtime = stats.playtime;
        playtime = Math.round((parseInt(playtime) / 60)).toString();

        let newLine = document.createElement('div');
        newLine.innerHTML = newPlayerSummeryElement(icon, player.profileurl, name, playtime);

        playerSummerysHolder.appendChild(newLine);
    });
}

const newPlayerSummeryElement = (icon, steamprofileURL, name, playtime) => {
    name = name.replaceAll('<', '&lt;');
    name = name.replaceAll('>', '&gt;');
    playtime = playtime <= 0 ? '???' : `${playtime} hours`;

    return `
    <div class="row player_summary">
        <div class="one columns"><img src="${icon}" alt="username"></div>
        <div class="nine columns"><a href="${steamprofileURL}" target="_blank">${name}</a></div>
        <div class="two columns">${playtime}</div>
    </div>`
}

const populateStatHistogram = (stat) => {
    let region = document.querySelector('#histogram_target');
    region.removeChild(region.firstChild);

    let margin = { top: 10, right: 30, bottom: 30, left: 40 };
    let width = region.offsetWidth - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;

    let svg = d3.select('#histogram_target')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);


    let xAxisGroup = svg.append('g');
    let yAxisGroup = svg.append('g');


    let historgramOptions = document.querySelector('#histogram_options');
    historgramOptions.onchange = () => drawHistogram(historgramOptions.value);

    const drawHistogram = (stat) => {
        let filteredStats = getFiltedStatList(stat);

        let xMax = Math.ceil(d3.max(filteredStats, d => d.value));
        let xScale = d3.scaleLinear()
            .domain([0, xMax])
            .range([0, width]);

        xAxisGroup
            .attr('transform', `translate(0, ${height})`)
            .transition()
            .duration(1000)
            .call(d3.axisBottom(xScale));

        let histogram = d3.histogram()
            .value(d => d.value)
            .domain(xScale.domain())
            .thresholds(xScale.ticks(10));

        let bins = histogram(filteredStats);

        let yMax = d3.max(bins, d => d.length);
        let yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, yMax])

        yAxisGroup
            .transition()
            .duration(1000)
            .call(
                d3.axisLeft(yScale)
                    .ticks(yMax)
                    .tickFormat(d3.format('d'))
            );

        svg.selectAll('rect')
            .data(bins, b => Math.random)
            .join(
                enter => {
                    enter.append("rect")
                        .attr("x", d => xScale(d.x0) + 1)
                        .attr("y", height)
                        .attr('width', d => Math.max(xScale(d.x1) - xScale(d.x0) - 1, 0))
                        .attr('height', 0)
                        .style('fill', '#69b3a2')
                        .transition()
                        .duration(1000)
                        .attr('y', d => yScale(d.length))
                        .attr('height', d => height - yScale(d.length))
                }
            );
    }

    drawHistogram(stat);
}

const histogramStats = {
    'Accuracy': (playerStats) => {
        return getPlayerStat(playerStats, 'TotalHits') / getPlayerStat(playerStats, 'TotalShots');
    },
    'KD': (playerStats) => {
        return getPlayerStat(playerStats, 'EnemyNeutralized') / getPlayerStat(playerStats, 'TimesNeutralized');
    },
    'MeleeKills': (playerStats) => {
        return getPlayerStat(playerStats, 'MeleeKills');
    },
}

const getFiltedStatList = (stat) => {
    console.dir("Get Stats for: " + stat)
    let filteredStats = playerStats.map(p => {
        let steamid = p.steamID;
        let value = histogramStats[stat](p);

        return { steamid, stat, value }
    });

    return filteredStats;
}

const getPlayerStat = (playerStats, statName) => {
    let stat = playerStats.stats.find(s => s.name === statName);

    let value = 0;
    if (stat !== undefined)
        value = parseInt(stat.value);

    return value;
}

window.onload = init;