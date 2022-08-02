import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";
import { MyCommandType } from '../models/command.type';

const command : MyCommandType = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Replies with pong.'),
    async execute(interaction:ChatInputCommandInteraction) {
        await interaction.reply({content:"Pong", ephemeral:true});
    }
}

export = command;