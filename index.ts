// This file can start a bot with just MuppetsClient features.
// You can use a similar code to easily plug these features to more developed bot.
import { ChatInputCommandInteraction, Client, GatewayIntentBits, Interaction } from 'discord.js';
import { token } from './config.json';
import { is_DISCORD_LANGUAGE } from './models/translation.type';
import { MuppetsClient } from './muppets-client';
import { setRegion_command } from './utils/setRegion.command';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Handling interaction error
async function handle(interaction:ChatInputCommandInteraction, error:unknown) {
    const rep = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
    try {await interaction.reply(rep)} catch {await interaction.editReply(rep)}
}

(async () => {
	await setRegion_command.deploy(["en-US", "fr"]);

	//Deploy the MuppetClient commands Collection
	const muppetsClient = new MuppetsClient();
	const muppetsCommands = await muppetsClient.getCommandsCollection();
	
	//Running MuppetsClient commands + another command
	client.on('interactionCreate', async (i:Interaction) => {
		if (!i.isChatInputCommand()) return ;
		const selectedCommand = muppetsCommands.get(i.commandName);
		try {
			await selectedCommand?.execute(i);

			if (i.commandName === "set_region") {
				await i.deferReply();
				const language =  i.options.getString("language", true);
				if (is_DISCORD_LANGUAGE(language)) {
					await muppetsClient.changeLanguage(language);
					await i.editReply({content:`:earth_africa: The language has been successfully set up to \`${language}\`.`})
					return;
				}
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