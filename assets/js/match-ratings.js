$(function() {
	axios.defaults.baseURL = 'http://localhost:8080/service';
	axios.defaults.timeout = 3000;

	getAllLeagues();
});

function getAllLeagues() {
	axios.get('/league/getall')
		.then(function(response) {
			renderAllLeagues(response.data.leagues);
		})
		.catch(function(error) {
			console.log(error);
		});
}

function getAllTeams(leagueId) {
	axios.get('/team/getallbyfilters', {
			params: {
				leagueId: leagueId
			}
		})
		.then(function(response) {
			renderAllTeams(response.data.teams);
		})
		.catch(function(error) {
			console.log(error);
		});
}

function getAllMatchesForTeamInLeague(leagueId, teamId) {
	axios.get('/match/getallbyfilters', {
			params: {
				leagueId: leagueId,
				seasonId: 1,
				teamId: 1
			}
		})
		.then(function(response) {
			renderAllMatches(response.data.matches);
		})
		.catch(function(error) {
			console.log(error);
		});
}

function renderAllLeagues(leagues) {
	_.each(leagues, function(league) {
		$('.league-selector-dropdown').append(`<button class="dropdown-item" id="league-${league.leagueId}" data-leagueid="${league.leagueId}" type="button">${league.name}</button>`);
	});
	bindAllLeagueActions();
}

function renderAllTeams(teams) {
	if(teams.length === 0) {
		$('.team-selector-button').text('no teams');
		$('.team-selector-dropdown').empty();
	} else {
		$('.team-selector-button').text('select team');
		$('.team-selector-dropdown').empty();
		_.each(teams, function(team) {
			$('.team-selector-dropdown').append(`<button class="dropdown-item" id="team-${team.teamId}" data-teamid="${team.teamId}" type="button">${team.name}</button>`);
		});
		bindAllTeamActions();
	}
}

function renderAllMatches(matches) {
	if(matches.length === 0) {
		$('.match-selector-button').text('no matches');
		$('.match-selector-dropdown').empty();
	} else {
		$('.match-selector-button').text('select match');
		$('.match-selector-dropdown').empty();
		_.each(matches, function(match) {
		$('.match-selector-dropdown').append(`<button class="dropdown-item" id="match-${match.matchId}" data-matchid="${match.matchId}" type="button">${match.opponentshortname} (${match.venue.slice(0,1)}) - ${match.result}</button>`);
		});
		bindAllMatchActions();
	}
}

function bindAllLeagueActions() {
	$('.league-selector-dropdown .dropdown-item').on('click', function(e) {
		var leagueId = $(e.currentTarget).attr('data-leagueid');
		$('.league-selector-button').text($(e.currentTarget).text());
		$('.league-selector-button').attr('data-leagueid', leagueId);
		$('.team-selector-div').removeClass('invisible');
		getAllTeams(leagueId);
	});
}

function bindAllTeamActions() {
	$('.team-selector-dropdown .dropdown-item').on('click', function(e) {
		var teamId = $(e.currentTarget).attr('data-teamid');
		$('.team-selector-button').text($(e.currentTarget).text());
		$('.team-selector-button').attr('data-teamid', teamId);
		$('.match-selector-div').removeClass('invisible');
		var leagueId = $('.league-selector-button').attr('data-leagueid');
		getAllMatchesForTeamInLeague(leagueId, teamId);
	});
}

function bindAllMatchActions() {
	$('.match-selector-dropdown .dropdown-item').on('click', function(e) {
		var matchId = $(e.currentTarget).attr('data-matchid');
		$('.match-selector-button').text($(e.currentTarget).text());
		$('.match-selector-button').attr('data-matchid', matchId);
		getRatingsForMatch(matchId);
	});
}

function getRatingsForMatch(matchId) {
	axios.get('/ratings/match/getrating', {
			params: {
				matchId: matchId
			}
		})
		.then(function(response) {
			console.log(response);
			// renderChart(response.data);
		})
		.catch(function(error) {
			console.log(error);
		});
}

function renderChart(data) {
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