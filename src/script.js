const base_url = "http://localhost:3000";

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
    var serverlistResponse = await fetch(`${base_url}/serverlist`);
    servers = await serverlistResponse.json();
}

const populateServerList = () => {
    servers.forEach(server => {
        var newLine = document.createElement('div');
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
    console.log("Display players for: " + ip);
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
    console.dir(players);
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
        var newLine = document.createElement('div');

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
        <div class="ten columns"><a href="https://www.aastats.com" target="_blank">${name}</a></div>
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
    return `<div id=${steamid} class="row spectator id"><a href="https://www.aastats.com" target="_blank">${name}</a></div>`
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

    console.dir("Display player data for " + ip);

    dataLoader.className = "loader";
    dataHolder.className = "hidden";

    playerSummeries = await retrievePlayerSummeries(ip);
    playerStats = await retrievePlayerStats(ip);

    playerStats.sort((a, b) => b.playtime - a.playtime);
    playerSummeries.sort((a, b) => playerStats.find(p => p.steamID === b.steamid).playtime - playerStats.find(p => p.steamID === a.steamid).playtime);

    clearPlayerSummeriesList();
    populatePlayerSummeries();

    dataLoader.className = "hidden";
    dataHolder.className = "";
}

const retrievePlayerSummeries = async (ip) => {
    let playerSummeriesResponse = await fetch(`${base_url}/playersummaries?serverip=${ip}`);
    var playerSummeries = await playerSummeriesResponse.json();
    playerSummeries = playerSummeries.players;
    return playerSummeries;
}

const retrievePlayerStats = async (ip) => {
    let playerStatsResponse = await fetch(`${base_url}/playerstats?serverip=${ip}`);
    var stats = await playerStatsResponse.json();
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
        var stats = playerStats.find(p => p.steamID === player.steamid)
        var icon = player.avatar;
        var name = player.personaname;
        var playtime = stats.playtime;
        playtime = Math.round((parseInt(playtime) / 60)).toString();

        let newLine = document.createElement('div');
        newLine.innerHTML = newPlayerSummeryElement(icon, player.profileurl, name, playtime);

        playerSummerysHolder.appendChild(newLine);
    });
}

const newPlayerSummeryElement = (icon, steamprofileURL, name, playtime) => {
    name = name.replaceAll('<', '&lt;');
    name = name.replaceAll('>', '&gt;');

    return `
    <div class="row player_summary">
        <div class="one columns"><img src="${icon}" alt="username"></div>
        <div class="nine columns"><a href="${steamprofileURL}" target="_blank">${name}</a></div>
        <div class="two columns">${playtime} hours</div>
    </div>`
}

window.onload = init;