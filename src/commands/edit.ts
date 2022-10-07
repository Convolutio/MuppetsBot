import { ActionRowBuilder, ApplicationCommandType, ContextMenuCommandBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { createContentForm } from "../classes/contentForm";
import { get_locales } from "../i18n/i18n";
import { CommandMethodsType } from "../models/command.type";

export const command:CommandMethodsType = {
    buildData() {
        return new ContextMenuCommandBuilder()
            .setName('edit')
            .setNameLocalizations(get_locales("edit"))
            .setType(ApplicationCommandType.Message)
    },
    async execute(interaction) {
        if (!interaction.isMessageContextMenuCommand()) return;
        const target = interaction.targetMessage;
        try {
            const whk = await interaction.client.fetchWebhook(target.author.id);
            await createContentForm(interaction,
                `Edit ${target.author.username}'s message`,
                async (submission, textInput) => {
                    await whk.editMessage(target.id, textInput);
                    await submission.reply({content:"Message edited !", ephemeral:true});
                },
                target.content);
        } catch(err:any) {
            console.error(err);
            //await interaction.reply({content:"Nop", ephemeral:true});
        }
    }
}