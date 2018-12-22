$(function() {
	axios.defaults.baseURL = 'http://localhost:8080/service';
	axios.defaults.timeout = 3000;

	getAllTeams();
});

function getAllTeams() {
	axios.get('/team/getall')
		.then(function(response) {
			renderAllTeams(response.data.teams);
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

function renderPlayers(players) {
	_.each(players, function(player) {
		$('.player-selector-dropdown').append(`<button class="dropdown-item" id="player-${player.playerId}" data-playerid="${player.playerId}" type="button">${player.name}</button>`);
	});
	bindAllPlayerActions();
}

function bindAllTeamActions() {
	$('.team-selector-dropdown .dropdown-item').on('click', function(e) {
		var teamId = $(e.currentTarget).attr('data-teamid');
		$('.team-selector-button').text($(e.currentTarget).text());
		$('.team-selector-button').attr('data-teamid', teamId);
		$('.player-selector-div').removeClass('hide');
		getAllPlayersForTeam(teamId);
	});
}

function bindAllPlayerActions() {
	$('.player-selector-dropdown .dropdown-item').on('click', function(e) {
		var playerId = $(e.currentTarget).attr('data-playerid');
		var teamId = $('.team-selector-button').attr('data-teamid');
		var startDate = $('[name=startDate]').val();
		var endDate = $('[name=endDate]').val();
		$('.player-selector-button').text($(e.currentTarget).text());
		$('.player-selector-button').attr('data-playerid', playerId);
		getRatingsForPlayer(playerId, startDate, endDate);
	});
}

/*function getAllMatchesForTeam(teamId, leagueId, seasonId) {
	axios.get('/match/getallbyfilters', {
			params: {
				teamId: teamId,
				leagueId: leagueId,
				seasonId: seasonId
			}
		})
		.then(function(response) {
			renderChart();
		})
		.catch(function(error) {
			console.log(error);
		});
}*/

function getAllPlayersForTeam(teamId) {
	axios.get('/player/getallbyfilters', {
			params: {
				teamId: teamId
			}
		})
		.then(function(response) {
			renderPlayers(response.data.players)
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
			renderChart(response.data.ratingsByMatch)
		})
		.catch(function(error) {
			console.log(error);
		});
}

function renderChart(ratings) {
	var labels = [];
	var data = [];
	_.each(ratings, function(rating) {
		labels.push([`${rating.match.opponentshortname} (${rating.match.venue.slice(0,1)}) - ${rating.match.result}`,`${rating.match.fixtureDate}`]);
		data.push(rating.rating);
	});
	var chartData = {
		labels: labels,
		datasets: [{
			label: 'Rating',
			data: data,
			borderColor: '#111836'
		},{
			label: 'Rating',
			data: data,
			type: 'line',
			borderColor: '#868e96',
			pointBackgroundColor: '#111836',
			pointBorderColor: '#868e96',
			steppedLine: false,
			lineTension: 0
		}]
	};
	var chLine = document.getElementById('chart-line');
	
	if (chLine) {
		if(window.chart)
			chart.destroy();

		window.chart = new Chart(chLine, {
		type: 'bar',
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