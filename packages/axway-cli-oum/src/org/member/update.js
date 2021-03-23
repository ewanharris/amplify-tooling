export default {
	args: [
		{
			name: 'org',
			desc: 'The organization name, id, or guid; defaults to the current org',
			required: true
		},
		{
			name: 'user',
			desc: 'The user guid or email address',
			required: true
		}
	],
	desc: 'Update an member\'s organization roles',
	options: {
		'--account [name]': 'The platform account to use',
		'--json': 'Outputs accounts as JSON',
		'--role [role]': {
			desc: 'Assign one or more team roles to a member',
			multiple: true
		}
	},
	async action({ argv, cli, console }) {
		const { initPlatformAccount } = require('../../lib/util');
		let { account, org, sdk } = await initPlatformAccount(argv.account, argv.org);
		const { default: snooplogg } = require('snooplogg');
		const { highlight, note } = snooplogg.styles;

		if (!argv.json) {
			console.log(`Account:      ${highlight(account.name)}`);
			console.log(`Organization: ${highlight(org.name)} ${note(`(${org.guid})`)}\n`);
		}

		const results = await sdk.org.member.update(account, org, argv.user, argv.role);

		if (argv.json) {
			console.log(JSON.stringify(results, null, 2));
		} else {
			console.log(`Successfully updated user role${results.roles === 1 ? '' : 's'}`);
		}

		await cli.emitAction('axway:oum:org:member:update', {
			account: account.name,
			org,
			...results
		});
	}
};
