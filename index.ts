// This file can start a bot with just MuppetsClient features.
// You can use a similar code to easily plug these features to more developed bot.
import { ChatInputCommandInteraction, Client, GatewayIntentBits, Interaction } from 'discord.js';
import { token } from './config.json';
import { MuppetsClient } from './muppets-client';
import { setRegion_command } from './utils/setRegion.command';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Handling interaction error
async function handle(interaction:ChatInputCommandInteraction, error:unknown) {
    const rep = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
    try {await interaction.reply(rep)} catch {await interaction.editReply(rep)}
}

(async () => {
	await setRegion_command.deploy(["en", "fr"]);
	//Deploy the MuppetClient commands Collection
	const muppetsClient = new MuppetsClient();
	const muppetsCommands = await muppetsClient.getCommandsCollection();
	client.on('interactionCreate', async (i:Interaction) => {
		//Running commands
		if (!i.isChatInputCommand()) return ;
		const selectedCommand = muppetsCommands.get(i.commandName);
		try {
			await selectedCommand?.execute(i);
			if (i.commandName === "set_region") {
				await i.deferReply();
				await muppetsClient.changeLanguage(i.options.getString("language", true));
				await i.editReply({content:":earth_africa: The language has been successfully set up."})
			}
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