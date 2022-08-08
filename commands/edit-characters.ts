import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, ModalActionRowComponentBuilder, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { CharacterService } from "../classes/characterService";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";

const command:MyCommandType = {
    async buildData() {
        return new SlashCommandBuilder()
            .setName("personnages")
            .setDescription("Ouvre un formulaire pour ajouter un nouveau personnage à faire parler.")
            .addSubcommand(subcommand => {
                return subcommand.setName("ajouter")
                .setDescription("Créez un nouveau personnage")
            })
            .addSubcommand(subcommand => {
                return subcommand.setName("supprimer")
                .setDescription('Supprimez un personnage')
            })
    },
    async execute(interaction:ChatInputCommandInteraction){
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand==="ajouter") {
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
        } else if (subcommand==="supprimer"){
            await interaction.deferReply({ephemeral:true});
            const characterNames = await (new CharacterService()).getCharactersNames();
            if (characterNames.length===0) {
                await interaction.editReply(':confused: Vous n\'avez aucun personnage enregistré.')
                return ;
            }
            const rows= [
                new ActionRowBuilder<SelectMenuBuilder>()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId("selectCharToDelete")
                        .setPlaceholder("Sélectionnez la réplique pré-enregistrée.")
                        .addOptions(characterNames.map(
                            name => {
                                const label:string=name.length>50?name.slice(0,47)+'...':name; 
                                return {
                                    label:label,
                                    value:name
                                }
                            }))
                )
            ];
            const msg = await interaction.editReply({
                content:`Choisissez le personnage à supprimer`,
                components:rows
            });
            msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000})
                .on('collect', async i=>{
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
                })
        }
    }
}
export=command;