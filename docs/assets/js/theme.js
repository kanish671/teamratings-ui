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

function bindAllTeamActions() {
	$('.team-selector-dropdown .dropdown-item').on('click', function(e) {
		console.log('clicked');
		var teamId = $(e.currentTarget).attr('data-teamid');
		$('.team-selector-button').text($(e.currentTarget).text());
		$('.team-selector-button').attr('data-teamid', teamId);
		$('.league-selector-div').removeClass('hide');
		getAllLeaguesForTeam(teamId);
	});
}

function bindAllLeagueActions() {
	$('.league-selector-dropdown .dropdown-item').on('click', function(e) {
		console.log('clicked');
		var leagueId = $(e.currentTarget).attr('data-leagueid');
		var teamId = $('.team-selector-button').attr('data-teamid');
		$('.league-selector-button').text($(e.currentTarget).text());
		$('.league-selector-button').attr('data-leagueid', leagueId);
		getAllMatchesForTeam(teamId, leagueId, 1); // seasonId is 1 for now
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

function renderChart() {
	var chartData = {
		labels: ["S", "M", "T", "W", "T", "F", "S"],
		datasets: [{
			data: [589, 445, 483, 503, 689, 692, 634],
		},
		{
			data: [639, 465, 493, 478, 589, 632, 674],
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
						beginAtZero: false
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