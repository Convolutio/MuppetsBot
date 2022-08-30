import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AsyncBuiltCommandMethods } from "../models/command.type";

export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        const i18n = this.muppetsClient.i18n;
        const options = (await this.muppetsClient.characterService.getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return new SlashCommandBuilder()
        .setName(i18n("quotes"))
        .setDescription(i18n("quotes_description"))
        .addSubcommand(subcommand =>
            subcommand.setName(i18n("add"))
                .setDescription(i18n("quotes$add_description"))
                .addStringOption(option =>
                    option.setName(i18n("character"))
                        .setDescription(i18n("quotes$add$character_description"))
                        .setRequired(true)
                        .addChoices(...options)
                    )
                .addStringOption(option =>
                    option.setName(i18n("content"))
                        .setDescription(i18n("quotes$add$content_description"))
                        .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            subcommand.setName(i18n("edit"))
                .setDescription(i18n("quotes$edit_description"))
                .addStringOption(option =>
                    option.setName(i18n("character"))
                        .setDescription(i18n("quotes$edit$character_description"))
                        .setRequired(true)
                        .addChoices(...options)
                    )
                .addStringOption(option =>
                    option.setName(i18n("content"))
                        .setDescription(i18n("quotes$edit$content_description"))
                        .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            subcommand.setName(i18n("remove"))
                .setDescription(i18n("quotes$remove_description"))
                .addStringOption(option =>
                    option.setName(i18n("character"))
                        .setDescription(i18n("quotes$remove$character_description"))
                        .setRequired(true)
                        .addChoices(...options)
                    )
            )
        
    },
    async execute(interaction:ChatInputCommandInteraction) {
        await interaction.deferReply();
        const i18n = this.muppetsClient.i18n;
        const charService = this.muppetsClient.characterService;
        const subcommand = interaction.options.getSubcommand(true);
        const charName = interaction.options.getString(i18n("character"), true);
        if (subcommand === i18n("add")) {
            const quote = interaction.options.getString(i18n("content"), true);
            await charService.addQuote(charName, quote);
            await interaction.editReply({content:i18n("quoteAdded_log")});
        } else if (subcommand===i18n("edit")) {
            const new_quote = interaction.options.getString(i18n("content"), true);
            await this.muppetsClient.AddQuoteSelector(
                charName, false, 'selectQuoteToEdit',interaction,
                async i => {
                    await i.deferUpdate();
                    const selectedQuoteId = +i.values[0];
                    await charService.editQuote(selectedQuoteId, new_quote);
                    await i.editReply({
                        content:i18n("quoteEdited_log", {charName:charName}),
                        components:[]
                    });
                }
            );
        } else if (subcommand===i18n("remove")) {
            await this.muppetsClient.AddQuoteSelector(
                charName, false, 'selectQuoteToDelete',interaction,
                async i => {
                    await i.deferUpdate();
                    const selectedQuoteId = +i.values[0];
                    await charService.deleteQuote(selectedQuoteId);
                    await i.editReply({
                        content:i18n("quoteRemoved_log", {charName:charName}),
                        components:[]
                    });
                }
            );
        }
    }
}