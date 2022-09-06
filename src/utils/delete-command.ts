//Run this script to delete the command with the id specified in ./config.json

import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
import { token, clientId, guildId,  commandToDelete_id } from '../../config.json'

const rest = new REST({version:'10'}).setToken(token);

if (commandToDelete_id != "") {
    (async () => {
        try {
            await rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandToDelete_id));
            console.log('Successfully deleted guild command.');
        } catch(error) {
            console.error(error);
        }
    })();
} else {
    console.error("You must scpecify a guild command's id.");
}