// Import the necessary discord.js classes and other packages
import { Client, GatewayIntentBits } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { token } from './config.json';
import MyEventBuilder from './models/event.type';
import deployCommands from './utils/deploy-commands';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


//Register all events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

(async () => {
	//Deploy commands
	await deployCommands;
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const eventBuilder:MyEventBuilder = require(filePath);
		const event = await eventBuilder();
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
	// Login to Discord with your client's token
	client.login(token);
})();