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

function renderAllLeagues(leagues) {
	_.each(leagues, function(league) {
		$('.league-selector-dropdown').append(`<button class="dropdown-item" id="league-${league.leagueId}" data-leagueid="${league.leagueId}" type="button">${league.name}</button>`);
	});
	bindAllLeagueActions();
}

function bindAllTeamActions() {
	$('.team-selector-dropdown .dropdown-item').on('click', function(e) {
		var teamId = $(e.currentTarget).attr('data-teamid');
		$('.team-selector-button').text($(e.currentTarget).text());
		$('.team-selector-button').attr('data-teamid', teamId);
		var startDate = $('[name=startDate]').val();
		var endDate = $('[name=endDate]').val();
		getRatingsForTeam(teamId, startDate, endDate);
	});
}

function bindAllLeagueActions() {
	$('.league-selector-dropdown .dropdown-item').on('click', function(e) {
		var leagueId = $(e.currentTarget).attr('data-leagueid');
		$('.league-selector-button').text($(e.currentTarget).text());
		$('.league-selector-button').attr('data-leagueid', leagueId);
		$('.team-selector-div').removeClass('hide');
		getAllTeams(leagueId);
	});
}

function getRatingsForTeam(teamId, startDate, endDate) {
	axios.get('/ratings/team/getratingsbetweendates', {
			params: {
				teamId: teamId,
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