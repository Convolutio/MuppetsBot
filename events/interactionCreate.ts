import { Interaction, Collection, InteractionType, TextChannel } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import MyEventBuilder from "../models/event.type";
import { setTimeout } from "node:timers/promises";

//Execute all deployed commands
const commands = new Collection<string, MyCommandType>();
const commandsPath = path.join(__dirname, '..','commands');
const commandFiles = fs.readdirSync(commandsPath).filter(filename => filename.endsWith(".ts"));

const buildEvent : MyEventBuilder = async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command:MyCommandType = require(filePath);
        const command_data = await command.buildData();
        commands.set(command_data.name, command);
    }
    return {
        name:"interactionCreate",
        async execute(interaction:Interaction) {
            if (interaction.type===InteractionType.ModalSubmit
                && interaction.customId==="charCreatorForm") {
                    await interaction.deferReply();
                    const character = {
                        name:interaction.fields.getTextInputValue('charNameInput'),
                        avatar:interaction.fields.getTextInputValue('avatarFieldInput')
                    }
                    try {
                        const channel = await interaction.channel?.fetch(true);
                        if (!(channel instanceof TextChannel)) throw "TextChannel not found";
                        await (new MyWebhook()).create(channel,character);
                        await interaction.editReply(`Le nouveau personnage ${character.name} a été créé !`);
                    } catch(error) {
                        await interaction.editReply(`An error has occured when executing this command:\n${error}`);
                    }
            }
            //Run just slash commands
            if (!interaction.isChatInputCommand()) return;
            const command = commands.get(interaction.commandName);
            if(!command) return;
            try {
                await command.execute(interaction);
            } catch(error) {
                if (interaction.isChatInputCommand()) {
                    const rep = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
                    try {await interaction.reply({content: rep, ephemeral:true})}
                    catch {await interaction.editReply(rep)};
                }
            }
        }
    }
}

export = buildEvent;