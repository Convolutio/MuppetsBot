import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { AsyncBuiltCommandMethods } from "../models/command.type";

export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        const options = (await this.muppetsClient.characterService.getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return new SlashCommandBuilder()
        .setName(this.muppetsClient.i18n("play"))
        .setDescription(this.muppetsClient.i18n("play_description"))
        .addStringOption(option =>
            option.setName(this.muppetsClient.i18n("character"))
                .setDescription(this.muppetsClient.i18n("play$character_description"))
                .setRequired(true)
                .addChoices(...options)
            )
        .addStringOption(option =>
            option.setName(this.muppetsClient.i18n("content"))
                .setDescription(this.muppetsClient.i18n("play$content_description"))
                .setRequired(false)
            )
    },
    async execute(interaction:ChatInputCommandInteraction) {
        //The command has been submitted.
        await interaction.reply({content:this.muppetsClient.i18n("webhookAwaited_log"),ephemeral:true});
        const charName = interaction.options.getString(this.muppetsClient.i18n("character"), true);
        const webhook = new MyWebhook(this.muppetsClient.characterService);
        await webhook.init(interaction.client, charName);
        const channel = interaction.channel;
        if (!channel) throw "Channel information not found. Please try again."
        const textContent = interaction.options.getString(this.muppetsClient.i18n("content"));
        if (textContent) {
            await webhook.speak(textContent, channel);
            await interaction.editReply({content:this.muppetsClient.i18n("done"), components:[]});
        } else {
            await this.muppetsClient.AddQuoteSelector(
                charName, true, 'selectQuoteToTell', interaction,
                async i => {
                    await i.deferUpdate();
                    await webhook.speak(i.values[0], channel);
                    await i.editReply({content:this.muppetsClient.i18n("done"), components:[]});
                }
            );
        }
    }
}
