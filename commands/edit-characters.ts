import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, ModalActionRowComponentBuilder, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { CharacterService } from "../classes/characterService";
import { AddCharacterSelector } from "../classes/selectors";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";

function characterForm(customId:string, creation:boolean=true) {
    const modal = new ModalBuilder()
        .setCustomId(customId)
        .setTitle(creation?'Création':'Édition' + ' d\'un nouveau personnage');
    const nameField = new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(new TextInputBuilder()
            .setCustomId('charNameInput')
            .setLabel("Quel sera le nom de votre personnage ?")
            .setRequired(creation)
            .setStyle(TextInputStyle.Short)
            );
    const avatarField = new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(new TextInputBuilder()
            .setCustomId('avatarFieldInput')
            .setLabel('Entrez l\'url de son avatar :')
            .setRequired(creation)
            .setStyle(TextInputStyle.Short)
        )
    modal.addComponents(nameField, avatarField);
    return modal;
};

const command:MyCommandType = {
    async buildData() {
        return new SlashCommandBuilder()
            .setName("personnages")
            .setDescription("Ouvre un formulaire pour ajouter un nouveau personnage à faire parler.")
            .addSubcommand(subcommand => {
                return subcommand.setName("ajouter")
                .setDescription("Créez un nouveau personnage")
            })
            .addSubcommand(subcommand =>
                subcommand.setName('modifier')
                .setDescription('Éditez un personnage.')
            )
            .addSubcommand(subcommand => {
                return subcommand.setName("supprimer")
                .setDescription('Supprimez un personnage')
            })
    },
    async execute(interaction:ChatInputCommandInteraction){
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand==="ajouter") {
            const modal = characterForm('selectCharToDelete');
            await interaction.showModal(modal);
        } else if (subcommand==="modifier"){
            await AddCharacterSelector(
                'selectCharToEdit', interaction,
                async i => {
                    const id = (await (new CharacterService()).getCharacterWithName(i.values[0])).webhook_data.id;
                    const modal = characterForm(`editChar_${id}`, false).setTitle(
                        `Édition du personnage ${i.values[0]}`
                    );
                    await i.showModal(modal);
                });
        } else if (subcommand==="supprimer"){
            await AddCharacterSelector('selectCharToDelete', interaction, 
                async i=>{
                    i.deferUpdate();
                    if (i.customId!=="selectCharToDelete") return;
                    const charName = i.values[0];
                    const webhook = (new MyWebhook());
                    await webhook.init(i.client, charName);
                    await webhook.delete();
                    await i.editReply({
                        content:`:+1: Le personnage **${charName}** a été supprimé avec succès !`,
                        components:[]
                    })
                });
        }
    }
}
export=command;