// This file can start a bot with just MuppetsClient features.
// You can use a similar code to easily plug these features to more developed bot.
import { ChatInputCommandInteraction, Client, GatewayIntentBits, Interaction } from 'discord.js';
import { token } from './config.json';
import { MuppetsClient } from './muppets-client';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Handling interaction error
async function handle(interaction:ChatInputCommandInteraction, error:unknown) {
    const rep = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
    try {await interaction.reply(rep)} catch {await interaction.editReply(rep)}
}

(async () => {
	//Deploy the MuppetClient commands Collection
	const muppetsCommands = await (new MuppetsClient())
		.getCommandsCollection();
	client.on('interactionCreate', async (i:Interaction) => {
		//Running commands
		if (!i.isChatInputCommand()) return ;
		const selectedCommand = muppetsCommands.get(i.commandName);
		try {
			await selectedCommand?.execute(i);
		} catch(err) {
			handle(i, err);
		}
	});
	client.on('ready', async () => {
		console.log('Ready !')
	})
	// Login to Discord with your client's token
	client.login(token);
})();