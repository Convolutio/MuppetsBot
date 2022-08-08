import { Interaction, Collection, InteractionType, TextChannel, ChatInputCommandInteraction, ModalSubmitInteraction } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { MyCommandType } from "../models/command.type";
import MyEventBuilder from "../models/event.type";
import modalSubmit from "../interactions/modal-submit";

//Handling interaction error
async function handle(interaction:ModalSubmitInteraction|ChatInputCommandInteraction, error:unknown) {
    const rep = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
    try {await interaction.reply(rep)} catch {await interaction.editReply(rep)}
}

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
            if (interaction.type===InteractionType.ModalSubmit) {
                try {
                    await modalSubmit.execute(interaction);
                } catch(error) {
                    handle(interaction, error);
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
                    handle(interaction, error);
                }
            }
        }
    }
}

export = buildEvent;