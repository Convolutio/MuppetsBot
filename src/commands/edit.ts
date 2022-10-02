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
            createContentForm(interaction,
                `Edit ${target.author.username}'s message`,
                async submission => {
                    await whk.editMessage(target.id, submission.fields.getTextInputValue('newContentInput'));
                    await submission.reply({content:"Message edited !", ephemeral:true});
                },
                target.content)
            /*
            const modal = new ModalBuilder()
                .setTitle()
                .setCustomId("newContentModal")
                .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("newContentInput")
                        .setLabel("What is the new content of the message ?")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setValue(target.content)
                )
            );
            await interaction.showModal(modal);
            interaction.awaitModalSubmit({filter:(i)=>(i.customId==="newContentModal"), time:60_000})
                    .then(async submission => {
                        await whk.editMessage(target.id, submission.fields.getTextInputValue('newContentInput'));
                        await submission.reply({content:"Message edited !", ephemeral:true});
                    })
                    .catch(err=>{return;})
            */
        } catch(err:any) {
            await interaction.reply({content:"Nop", ephemeral:true});
        }
    }
}