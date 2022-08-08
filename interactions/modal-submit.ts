import { ModalSubmitInteraction, TextChannel } from "discord.js";
import { CharacterService } from "../classes/characterService";
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
        } else if (interaction.customId.startsWith('editChar')) {
            await interaction.deferReply();
            const character = {
                name:interaction.fields.getTextInputValue('charNameInput'),
                avatar:interaction.fields.getTextInputValue('avatarFieldInput')
            };
            const whk_id = interaction.customId.split('_')[1];
            const selectedCharacterName = (await (new CharacterService()).getCharacterWithWhkId(whk_id)).name;
            const webhook = new MyWebhook();
            await webhook.init(interaction.client, selectedCharacterName);
            try {
                await webhook.editCharacter(character);
            } catch(error) {console.error(error);throw error}
            await interaction.editReply(`:+1: Le personnage **${selectedCharacterName}** a été modifé avec succès`)
        }
    }
}