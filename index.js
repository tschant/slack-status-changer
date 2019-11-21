#!/usr/bin/env node
'use strict';
const meow = require('meow');
const axios = require('axios');
const {addMinutes, getUnixTime} = require('date-fns');
const querystring = require('querystring');
const config = require('./config');

const {log, error} = console;

if (!config.slackToken && config.slackToken.length) {
	error('Missing Slack token. Set it in config.js');
	process.exit(1);
}

function setSlackStatus(token, status) {
	return axios.post('https://slack.com/api/users.profile.set',
		querystring.stringify({
			token: token,
			profile: JSON.stringify(status)
		}), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}).then(function (response) {
		log('Set Slack status API response: %j', response.data);
	})
		.catch(function (error) {
			error('Set Slack status error: %s', error);
		});
}

function slackStatus(status, timeout) {
	if (timeout > 0 && !isNaN(parseInt(timeout, 10))) {
		// eslint-disable-next-line camelcase
		status.status_expiration = getUnixTime(addMinutes(new Date(), parseInt(timeout, 10)));
	}

	log('Setting Slack status to: %j', status);
	config.slackToken.forEach(token => {
		setSlackStatus(token, status);
	});
}

const cli = meow(`
    Usage
       $ ./index.js <input>
       $ ./index.js -s <input>

    Options
       --status, -s  status [lunch, afk, off, meeting]
       --timeout, -t  how long status lasts  (in minutes) [clear, lunch, run, afk, off, meeting]

    Examples
       $ ./index.js lunch
       $ ./index.js -s lunch
       $ ./index.js -s lunch -t 60
`, {
	flags: {
		status: {
			type: 'string',
			alias: 's'
		},
		timeout: {
			type: 'number',
			alias: 't'
		}
	}
});

if (cli.flags.status) {
	slackStatus(config.statusBy[cli.flags.status.toUpperCase()], cli.flags.timeout);
} else if (cli.input.length) {
	slackStatus(config.statusBy[cli.input[0].toUpperCase()], cli.flags.timeout);
} else {
	cli.showHelp();
}
