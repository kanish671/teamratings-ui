$(function() {
	axios.defaults.baseURL = 'http://localhost:8080/service';
	axios.defaults.timeout = 3000;

	getAllTeams();
});

function getAllTeams() {
	axios.get('/team/getall')
		.then(function(response) {
			console.log(response);
			renderAllTeams(response.data.responseObj.teams);
		})
		.catch(function(error) {
			console.log(error);
		});
}

function renderAllTeams(teams) {
	_.each(teams, function(team) {
		$('.team-selector-dropdown').append(`<button class="dropdown-item" id="team-${team.teamId}" data-teamid="${team.teamId}" type="button">${team.name}</button>`);
	});
	bindAllTeamActions();
}

function renderAllLeagues(leagues) {
	_.each(leagues, function(league) {
		$('.league-selector-dropdown').append(`<button class="dropdown-item" id="league-${league.leagueId}" data-leagueid="${league.leagueId}" type="button">${league.name}</button>`);
	});
	bindAllLeagueActions();
}

function renderPlayers(players) {
	_.each(players, function(player) {
		$('.player-selector-dropdown').append(`<button class="dropdown-item" id="player-${player.playerId}" data-playerid="${player.playerId}" type="button">${player.name}</button>`);
	});
	bindAllPlayerActions();
}

function bindAllTeamActions() {
	$('.team-selector-dropdown .dropdown-item').on('click', function(e) {
		console.log('clicked');
		// var teamId = $(e.currentTarget).attr('data-teamid');
		var teamId = 1;
		$('.team-selector-button').text($(e.currentTarget).text());
		$('.team-selector-button').attr('data-teamid', teamId);
		$('.league-selector-div').removeClass('hide');
		getAllLeaguesForTeam(teamId);
	});

	$('.team-selector-dropdown .dropdown-item:nth-child(1)').click();
}

function bindAllLeagueActions() {
	$('.league-selector-dropdown .dropdown-item').on('click', function(e) {
		console.log('clicked');
		var leagueId = $(e.currentTarget).attr('data-leagueid');
		// var teamId = $('.team-selector-button').attr('data-teamid');
		var teamId = 1;
		$('.league-selector-button').text($(e.currentTarget).text());
		$('.league-selector-button').attr('data-leagueid', leagueId);
		$('.player-selector-div').removeClass('hide');
		getAllPlayersForTeam(teamId);
		// getAllMatchesForTeam(teamId, leagueId, 1); // seasonId is 1 for now
	});
}

function bindAllPlayerActions() {
	$('.player-selector-dropdown .dropdown-item').on('click', function(e) {
		console.log('clicked');
		var playerId = $(e.currentTarget).attr('data-playerid');
		// var teamId = $('.team-selector-button').attr('data-teamid');
		var teamId = 1;
		var startDate = $('[name=startDate]').val();
		var endDate = $('[name=endDate]').val();
		$('.player-selector-button').text($(e.currentTarget).text());
		$('.player-selector-button').attr('data-playerid', playerId);
		getRatingsForPlayer(playerId, startDate, endDate);
	});
}

function getAllLeaguesForTeam(teamId) {
	axios.get('/league/getallbyfilters', {
			params: {
				teamId: teamId
			}
		})
		.then(function(response) {
			console.log(response);
			renderAllLeagues(response.data.responseObj.leagues);
		})
		.catch(function(error) {
			console.log(error);
		});
}

function getAllMatchesForTeam(teamId, leagueId, seasonId) {
	axios.get('/match/getallbyfilters', {
			params: {
				teamId: teamId,
				leagueId: leagueId,
				seasonId: seasonId
			}
		})
		.then(function(response) {
			console.log(response);
			renderChart();
		})
		.catch(function(error) {
			console.log(error);
		});
}

function getAllPlayersForTeam(teamId) {
	axios.get('/player/getallbyfilters', {
			params: {
				teamId: teamId
			}
		})
		.then(function(response) {
			console.log(response);
			renderPlayers(response.data.responseObj.players)
		})
		.catch(function(error) {
			console.log(error);
		});
}

function getRatingsForPlayer(playerId, startDate, endDate) {
	axios.get('/ratings/player/getratingsbetweendates', {
			params: {
				playerId: playerId,
				startDate: startDate,
				endDate: endDate
			}
		})
		.then(function(response) {
			console.log(response);
			renderChart(response.data.responseObj.ratingsByMatch)
		})
		.catch(function(error) {
			console.log(error);
		});
}

function renderChart(ratings) {
	var labels = [];
	var data = [];
	_.each(ratings, function(rating) {
		labels.push(`${rating.match.opponentshortname}(${rating.match.venue})`);
		data.push(rating.rating);
	});
	var chartData = {
		labels: labels,
		datasets: [{
			data: data
		}]
	};

	var chLine = document.getElementById("chart-line");
	if (chLine) {
		new Chart(chLine, {
		type: 'line',
		data: chartData,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						max: 10
					}
				}]
			},
			legend: {
				display: false
			}
		}
		});
	}
}