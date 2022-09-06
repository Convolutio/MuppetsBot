import { REST, Routes, SlashCommandBuilder } from "discord.js";
import {token, clientId, guildId } from '../../config.json'

export const setRegion_command = {
    async deploy(availableLanguages:string[]) {
        const command = new SlashCommandBuilder()
            .setName('set_region')
            .setDescription("change bot's language")
            .addStringOption(option => 
                option.setName("language")
                    .setDescription("Choose which language to set up the bot with.")
                    .setRequired(true)
                    .addChoices(...availableLanguages
                        .map(val => ({name:val, value:val})))
            ).toJSON();
        const rest = new REST({version:'10'}).setToken(token);
        await rest.post(Routes.applicationGuildCommands(clientId, guildId),
        {body:command});
    }
}