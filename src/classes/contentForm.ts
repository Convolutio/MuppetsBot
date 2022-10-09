import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, ContextMenuCommandInteraction,
    ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { MuppetsClient } from "../muppets-client";

export async function createContentForm(
    this:MuppetsClient,
    interaction:ChatInputCommandInteraction|SelectMenuInteraction|ButtonInteraction|ContextMenuCommandInteraction,
    callback:(inter:ModalSubmitInteraction, textInput:string)=>Promise<void>, placeholder?:string) {
    /*Shows a modal to ask the custom content of a message or a new quote.
    Then executes the callback if the modal has been submitted.*/
    const modalId="newContentModal"+ Date.now().toString();
    const modal = new ModalBuilder()
        .setTitle(this.i18n('modalContentTitle'))
        .setCustomId(modalId)
        .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            (() => {
                const component = new TextInputBuilder()
                    .setCustomId("newContentInput")
                    .setLabel(this.i18n("modalContentDescription"))
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                if (placeholder) component.setValue(placeholder)
                else component.setPlaceholder("Write here")
                return component
            })()
        )
    );
    await interaction.showModal(modal);
    try {
        const submission = await interaction.awaitModalSubmit({filter:(i)=>i.customId===modalId,time:120_000});
        const text = submission.fields.getTextInputValue('newContentInput');
        await callback(submission, text);
    } catch(err) {console.error(err)}
}