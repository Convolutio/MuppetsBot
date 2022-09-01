import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AsyncBuiltCommandMethods } from "../models/command.type";

export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        const i18n_b = this.muppetsClient.i18n_build;
        const options = (await this.muppetsClient.characterService.getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return i18n_b(new SlashCommandBuilder(), "quotes", "quotes_description")
        .addSubcommand(subcommand =>
            i18n_b(subcommand, "add", "quotes$add_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "quotes$add$character_description")
                        .setRequired(true)
                        .addChoices(...options)
                    )
                .addStringOption(option =>
                    i18n_b(option, "content", "quotes$add$content_description")
                        .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            i18n_b(subcommand, "edit", "quotes$edit_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "quotes$edit$character_description")
                        .setRequired(true)
                        .addChoices(...options)
                    )
                .addStringOption(option =>
                    i18n_b(option, "content", "quotes$edit$content_description")
                        .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            i18n_b(subcommand, "remove", "quotes$remove_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "quotes$remove$character_description")
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
        const charName = interaction.options.getString("character", true);
        if (subcommand === i18n("add")) {
            const quote = interaction.options.getString("content", true);
            await charService.addQuote(charName, quote);
            await interaction.editReply({content:i18n("quoteAdded_log")});
        } else if (subcommand===i18n("edit")) {
            const new_quote = interaction.options.getString("content", true);
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