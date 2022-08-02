import { Interaction, Collection } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { MyCommandType } from "../models/command.type";
import { MyEventType } from "../models/event.type";

//Execute all deployed commands
const commands = new Collection<string, MyCommandType>();
const commandsPath = path.join(__dirname, '..','commands');
const commandFiles = fs.readdirSync(commandsPath).filter(filename => filename.endsWith(".ts"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command:MyCommandType = require(filePath);
	commands.set(command.data.name, command);
}

const event : MyEventType = {
    name:"interactionCreate",
    async execute(interaction:Interaction) {
        //Run just slash commands
        if (!interaction.isChatInputCommand()) return;
        const command = commands.get(interaction.commandName);
        if(!command) return;
        try {
            await command.execute(interaction);
        } catch(error) {
            console.error(error);
            await interaction.reply({ content: `An error has occured when executing this command.`, ephemeral:true});
        }
    }
}

export = event;