import { SlashCommandBuilder } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { AsyncBuiltCommandMethods } from "../models/command.type";

export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        return this.muppetsClient.i18n_build(
            new SlashCommandBuilder(),
            "play",
            "play_description")
        .addStringOption(option =>
            this.muppetsClient.i18n_build(option,"character", "play$character_description")
                .setRequired(true)
                .setAutocomplete(true)
            )
        .addStringOption(option =>
            this.muppetsClient.i18n_build(option, "content", "play$content_description")
                .setRequired(false)
            )
    },
    async autocomplete(interaction) {
        this.muppetsClient.characterAutocomplete(interaction)
    },
    async execute(interaction) {
        //The command has been submitted.
        this.muppetsClient.checkMemberUsages(interaction);
        await interaction.reply({content:this.muppetsClient.i18n("webhookAwaited_log"),ephemeral:true});
        const charName = interaction.options.getString("character", true);
        const webhook = new MyWebhook(this.muppetsClient.characterService);
        await webhook.init(interaction.client, charName);
        const channel = interaction.channel;
        if (!channel) throw "Channel information not found. Please try again."
        const textContent = interaction.options.getString("content");
        if (textContent) {
            await webhook.speak(textContent, channel);
            await interaction.editReply({content:this.muppetsClient.i18n("done"), components:[]});
            this.muppetsClient.addMemberUsage(interaction)
        } else {
            await this.muppetsClient.AddQuoteSelector(
                charName, true, 'selectQuoteToTell', interaction,
                async i => {
                    await i.deferUpdate();
                    await webhook.speak(i.values[0], channel);
                    await i.editReply({content:this.muppetsClient.i18n("done"), components:[]});
                    this.muppetsClient.addMemberUsage(interaction);
                }
            );
        }
    }
}
