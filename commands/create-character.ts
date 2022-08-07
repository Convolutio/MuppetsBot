import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { MyCommandType } from "../models/command.type";

const command:MyCommandType = {
    async buildData() {
        return new SlashCommandBuilder()
            .setName("créer_personnage")
            .setDescription("Ouvre un formulaire pour ajouter un nouveau personnage à faire parler.")
    },
    async execute(interaction:ChatInputCommandInteraction){
        const modal = new ModalBuilder()
            .setCustomId('charCreatorForm')
            .setTitle('Création d\'un nouveau personnage');
        const nameField = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(new TextInputBuilder()
                .setCustomId('charNameInput')
                .setLabel("Quel sera le nom de votre personnage ?")
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
                );
        const avatarField = new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(new TextInputBuilder()
                .setCustomId('avatarFieldInput')
                .setLabel('Entrez l\'url de son avatar :')
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
            )
        modal.addComponents(nameField, avatarField);
        await interaction.showModal(modal);
    }
}
export=command;