export default {
	aliases: [ 'ls' ],
	args: [
		{
			name: 'org',
			desc: 'The organization name, id, or guid',
			required: true
		},
		{
			name: 'team',
			desc: 'The team identifier',
			required: true
		}
	],
	desc: 'List all members in a team',
	options: {
		'--account [name]': 'The platform account to use',
		'--json': 'Outputs accounts as JSON'
	},
	async action({ argv, console }) {
		const { initPlatformAccount } = require('../../lib/util');
		const { account, org, sdk } = await initPlatformAccount(argv.account, argv.org);
		const { team } = await sdk.team.find(account, org, argv.team);

		if (!team) {
			throw new Error(`Unable to find team "${argv.team}"`);
		}

		const { users } = await sdk.team.member.list(account, org, team.guid);

		if (argv.json) {
			console.log(JSON.stringify({
				account: account.name,
				org,
				team,
				users
			}, null, 2));
			return;
		}

		const { default: snooplogg } = require('snooplogg');
		const { highlight, note } = snooplogg.styles;

		console.log(`Account:      ${highlight(account.name)}`);
		console.log(`Organization: ${highlight(org.name)} ${note(`(${org.guid})`)}`);
		console.log(`Team:         ${highlight(team.name)} ${note(`(${team.guid})`)}\n`);

		if (!users.length) {
			console.log('No members found');
			return;
		}

		const { createTable } = require('@axway/amplify-cli-utils');
		const table = createTable([ 'Member', 'Email', 'GUID', 'Teams', 'Roles' ]);

		for (const { email, guid, name, roles, teams } of users) {
			table.push([
				name,
				email,
				guid,
				teams,
				roles.length ? roles.join(', ') : note('n/a')
			]);
		}
		console.log(table.toString());
	}
};
