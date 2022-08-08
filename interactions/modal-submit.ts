import { ModalSubmitInteraction, TextChannel } from "discord.js";
import { MyWebhook } from "../classes/webhook";

export = {
    async execute(interaction:ModalSubmitInteraction) {
        if (interaction.customId==='charCreatorForm') {
            await interaction.deferReply();
            const character = {
                name:interaction.fields.getTextInputValue('charNameInput'),
                avatar:interaction.fields.getTextInputValue('avatarFieldInput')
            }
            const channel = await interaction.channel?.fetch(true);
            if (!(channel instanceof TextChannel)) throw "Current channel isn't a text channel.";
            await (new MyWebhook()).create(channel,character);
            await interaction.editReply(`Le nouveau personnage **${character.name}** a été créé !`);
        }
    }
}