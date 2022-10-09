import { ComponentType, SlashCommandBuilder } from "discord.js";
import { CommandMethodsType } from "../models/command.type";

export const command:CommandMethodsType = {
    buildData() {
        const i18n_b = this.muppetsClient.i18n_build;
        return i18n_b(new SlashCommandBuilder(), "quotes", "quotes_description")
        .addSubcommand(subcommand =>
            i18n_b(subcommand, "add", "quotes$add_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "quotes$add$character_description")
                        .setRequired(true)
                        .setAutocomplete(true)
                    )
                .addMentionableOption(option =>
                    i18n_b(option, "mention", "quotes$add$mention_description")
                    )
                .addAttachmentOption(option =>
                    i18n_b(option, "attachment", "quotes$add$attachment_description"))
            )
        .addSubcommand(subcommand =>
            i18n_b(subcommand, "edit", "quotes$edit_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "quotes$edit$character_description")
                        .setRequired(true)
                        .setAutocomplete(true)
                    )
                    .addMentionableOption(option =>
                        i18n_b(option, "mention", "quotes$edit$mention_description")
                        )
                    .addAttachmentOption(option =>
                        i18n_b(option, "attachment", "quotes$edit$attachment_description"))
            )
        .addSubcommand(subcommand =>
            i18n_b(subcommand, "remove", "quotes$remove_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "quotes$remove$character_description")
                        .setRequired(true)
                        .setAutocomplete(true)
                    )
            )
        
    },
    async autocomplete(interaction) {
        this.muppetsClient.characterAutocomplete(interaction)
    },
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        const i18n = this.muppetsClient.i18n;
        const charService = this.muppetsClient.characterService;
        const subcommand = interaction.options.getSubcommand(true);
        const charName = interaction.options.getString("character", true);
        const mention = interaction.options.getMentionable("mention");
        const attachment = interaction.options.getAttachment("attachment")||undefined;
        if (subcommand ==="add") {
            await this.muppetsClient.createContentForm(interaction,
                async (submission, textInput) => {
                    await submission.deferReply();
                    let content:string = textInput;
                    if (mention) content+="\n"+mention.toString();
                    await this.muppetsClient.characterService.addQuote(charName, content, attachment);
                    await submission.editReply({content:i18n("quoteAdded_log")});
                });
        } else if (subcommand==="edit") {
            const reply = await this.muppetsClient.AddQuoteSelector(
                charName, 'selectQuoteToEdit');
            const msg = await interaction.reply(reply);
            if (reply.components) {
                //There's at least one quote to be selected
                msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000})
                    .on('collect', async i => {
                        if (i.customId!=='selectQuoteToEdit') return;
                        const selectedQuoteId = +i.values[0];
                        await this.muppetsClient.createContentForm(i,
                            async (submission, textInput) => {
                                if (!submission.isFromMessage()) return;
                                await submission.deferUpdate();
                                let content:string = textInput;
                                if (mention) content+="\n"+mention.toString();
                                await this.muppetsClient.characterService.editQuote(selectedQuoteId, content, attachment);
                                await submission.editReply({content:i18n("quoteEdited_log", {charName:charName}), components:[]});
                            });
                    }
                )
            }
        } else if (subcommand==="remove") {
            const reply = await this.muppetsClient.AddQuoteSelector(
                charName, 'selectQuoteToDelete');
            const msg = await interaction.reply(reply);
            if (reply.components) {
                msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000})
                    .on('collect', async i => {
                        if (i.customId!=='selectQuoteToDelete') return;
                        await i.deferUpdate();
                        const selectedQuoteId = +i.values[0];
                        await charService.deleteQuote(selectedQuoteId);
                        await i.editReply({
                            content:i18n("quoteRemoved_log", {charName:charName}),
                            components:[]
                        });
                    })
            }
        }
    }
}