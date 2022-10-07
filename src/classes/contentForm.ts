import { ActionRowBuilder, ButtonInteraction, ContextMenuCommandInteraction,
    ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";

export async function createContentForm(
    interaction:ButtonInteraction|ContextMenuCommandInteraction,
    title:string, callback:(inter:ModalSubmitInteraction, textInput:string)=>Promise<void>, placeholder?:string) {
    /*Shows a modal to ask the custom content of a message or a new quote.
    Then executes the callback if the modal has been submitted.*/
    const modalId="newContentModal"+ Date.now().toString();
    const modal = new ModalBuilder()
        .setTitle(title)
        .setCustomId(modalId)
        .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            (() => {
                const component = new TextInputBuilder()
                    .setCustomId("newContentInput")
                    .setLabel("What is the new content of the message ?")
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