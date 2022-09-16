import { SlashCommandBuilder } from "discord.js";
import { AsyncBuiltCommandMethods } from "../models/command.type";

export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        return this.muppetsClient.i18n_build(
            new SlashCommandBuilder(),
            "happy-hour",
            "happy-hour_description"
        )
    },
    async execute(interaction) {
        const happyHour=this.muppetsClient.setHappyHour();
        const message = happyHour
            ?"Welcome to the ***Happy Hour*** :partying_face:!"
            :"Happy Hour is over :neutral_face:.";
        await interaction.reply({content:message})
    }
}