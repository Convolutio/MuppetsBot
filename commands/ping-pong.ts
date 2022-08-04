import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";
import { MyCommandType } from '../models/command.type';

const command : MyCommandType = {
    buildData: async()=>{
        return new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Replies with pong.')
    },

    async execute(interaction:ChatInputCommandInteraction) {
        await interaction.reply({content:"Pong", ephemeral:true});
    }
}

export = command;