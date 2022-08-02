import {REST} from "@discordjs/rest";
import { clientId, guildId, token } from "../config.json"; 
import fs from "node:fs";
import path from "node:path";
import { Routes, SlashCommandBuilder } from "discord.js";
import { MyCommandType } from "../models/command.type";

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts"));

for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command:MyCommandType = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({version:"10"}).setToken(token);

(async () => {
    try {
        console.log(`Started refreshing application (/) commands in ${guildId} guild.`)
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands}
        );
        console.log("Successfuly reloaded application (/) commands in this server.")
    } catch(error) {
        console.error(error);
    }
})();