// This file can start a bot with just MuppetsClient features.
// You can use a similar code to easily plug these features to more developed bot.
import { Client, GatewayIntentBits, Interaction } from 'discord.js';
import { token } from '../config.json';
import { is_DISCORD_LANGUAGE } from './models/translation.type';
import { MuppetsClient } from './muppets-client';
import { setRegion_command } from './utils/setRegion.command';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

(async () => {
	await setRegion_command.deploy(["en-US", "fr"]);

	//Initiating the MuppetClient commands Collection
	const muppetsClient = new MuppetsClient();
	await muppetsClient.initCommandsCollection();
	
	client.on('interactionCreate', async (i:Interaction) => {
		//Treating MuppetsClient's commands (if there's one to be treated) 
		muppetsClient.treat(i);
		//here is an example of command to set bot language
		if (i.isChatInputCommand() && i.commandName === "set_region") {
			await i.deferReply();
			const language =  i.options.getString("language", true);
			if (is_DISCORD_LANGUAGE(language)) {
				await muppetsClient.changeLanguage(language);
				await i.editReply({content:`:earth_africa: The language has been successfully set up to \`${language}\`.`})
				return;
			}
		}
	});
	client.on('ready', () => {
		console.log('Ready !')
	})
	// Login to Discord with your client's token
	client.login(token);
})();