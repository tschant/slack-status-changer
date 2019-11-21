/* eslint-disable camelcase */
// Rename this file to config.js and add your token(s) from https://api.slack.com/custom-integrations/legacy-tokens
module.exports = {
	slackToken: [
		// 'xoxp-***************'
	],
	statusBy: {
		CLEAR: {
			status_text: '',
			status_emoji: ''
		},
		LUNCH: {
			status_text: 'At lunch',
			status_emoji: ':meat_on_bone:'
		},
		RUN: {
			status_text: 'On a run, back soon-ish?',
			status_emoji: ':runner:'
		},
		AFK: {
			status_text: 'Not at laptop at moment',
			status_emoji: ':anger:'
		},
		OFF: {
			status_text: 'Signed off, ping if needed',
			status_emoji: ':zzz:'
		},
		MEETING: {
			status_text: 'In a meeting',
			status_emoji: ':spiral_calendar_pad:'
		}
	}
};
