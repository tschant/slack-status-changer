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
	return axios.post('https://slack.com/api/users.profile.set', querystring.stringify({
		token: token,
		profile: JSON.stringify(status)
	}), {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	}).then(function (response) {
		log('Set Slack status API response: %j', response.data.username, response.data.profile.status_emoji, response.data.profile.status_text);
	}).catch(function (err) {
		error('Set Slack status error: %s', err);
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

function manualSlackStatus(emoji = ':coffee:', text, timeout) {
	const status = {
		status_text: text, // eslint-disable-line camelcase
		status_emoji: `:${emoji.replace(/[^a-zA-Z0-9-_]/g, '')}:` // eslint-disable-line camelcase
	};
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
       $ ./index.js -s <status>
       $ ./index.js <input> --emoji=<emoji>

    Options
       --status, -s  status based on presets [lunch, afk, off, meeting, etc. - see config.js]
       --timeout, -t  how long status lasts before clearing  (in minutes)
       --emoji, -e  manually set the emoji for slack status (cannot be used with 'status')

    Examples
       $ ./index.js need more coffee -t 10
       $ ./index.js -s lunch
       $ ./index.js -s lunch -t 60
       $ ./index.js -e shrug
`, {
	flags: {
		status: {
			type: 'string',
			alias: 's'
		},
		timeout: {
			type: 'number',
			alias: 't'
		},
		emoji: {
			type: 'string',
			alias: 'e'
		}
	}
});

if (cli.flags.status) {
	slackStatus(config.statusBy[cli.flags.status.toUpperCase()], cli.flags.timeout);
} else if (cli.flags.emoji || cli.input.length) {
	manualSlackStatus(cli.flags.emoji, cli.input.join(' '), cli.flags.timeout);
} else {
	cli.showHelp();
}
