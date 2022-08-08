import { Attachment, BufferResolvable, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Stream } from "stream";
import { CharacterService } from "../classes/characterService";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";

function getAvatar(avatar_url:string|null, avatarAttachment?:Attachment|null):BufferResolvable|undefined {
    let avatar:BufferResolvable|undefined;
    if (avatar_url) avatar = avatar_url;
    if (avatarAttachment && avatarAttachment.contentType?.includes('image')){
        const attachment = avatarAttachment.attachment;
        if (!(attachment instanceof Stream)) {
            avatar = attachment;
        }
    }
    return avatar;
}

const command:MyCommandType = {
    async buildData() {
        const options = (await (new CharacterService()).getCharactersNames())
            .map(name => ({name:name, value:name}));
        return new SlashCommandBuilder()
            .setName("personnages")
            .setDescription("Ouvre un formulaire pour ajouter un nouveau personnage à faire parler.")
            .addSubcommand(subcommand => {
                return subcommand.setName("ajouter")
                .setDescription("Créez un nouveau personnage en renseignant son futur pseudo et son avatar.")
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Entrez le nom de votre nouveau personnage.')
                        .setRequired(true)
                    )
                .addStringOption(option =>
                    option.setName("url_avatar")
                        .setDescription("(Optionnel) Entrez l'url de son avatar.")
                    )
                .addAttachmentOption(option =>
                    option.setName("fichier_avatar")
                        .setDescription("(Optionnel) Attacher une image en guise d'avatar pour votre nouveau personnage.")
                    )
            })
            .addSubcommand(subcommand =>
                subcommand.setName('modifier')
                .setDescription('Éditez un personnage.')
                .addStringOption(option => 
                    option.setName('personnage')
                        .setDescription('Entrez le nom du personnage à éditer')
                        .setRequired(true)
                        .addChoices(...options)
                )
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('(Optionnel) Entrez le nouveau nom du personnage.')
                    )
                .addStringOption(option =>
                    option.setName("url_avatar")
                        .setDescription("(Optionnel) Entrez l'url de son avatar.")
                    )
                .addAttachmentOption(option =>
                    option.setName("fichier_avatar")
                        .setDescription("(Optionnel) Attacher une image en guise d'avatar pour votre nouveau personnage.")
                    )
            )
            .addSubcommand(subcommand => {
                return subcommand.setName("supprimer")
                .setDescription('Supprimez un personnage')
                .addStringOption(option =>
                    option.setName("personnage")
                        .setDescription("Renseignez le personnage à effacer.")
                        .setRequired(true)
                        .addChoices(...options)
                    )
            })
    },
    async execute(interaction:ChatInputCommandInteraction){
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand(true);
        const channel = await interaction.channel?.fetch();
        if (!channel) throw "Channel information not found. Please try again.";
        const webhook = new MyWebhook();
        if (subcommand==="ajouter") {
            const name = interaction.options.getString('nom', true);
            const avatar_url = interaction.options.getString('url_avatar');
            const avatarAttachment = interaction.options.getAttachment('fichier_avatar');
            const avatar = getAvatar(avatar_url, avatarAttachment)
            if (!avatar) throw "L'avatar n'a pas pu être traité. Réessayez avec une option valide";
            const character = {
                name:name,
                avatar:avatar
            }
            await webhook.create(channel, character);
            await interaction.editReply(`Le nouveau personnage **${character.name}** a été créé !`);
        } else if (subcommand==="modifier"){
            const charName = interaction.options.getString('personnage', true);
            const name = interaction.options.getString('nom');
            const avatar_url = interaction.options.getString('url_avatar');
            const avatarAttachment = interaction.options.getAttachment('fichier_avatar');
            const character = {
                name:name||undefined,
                avatar:getAvatar(avatar_url, avatarAttachment)
            }
            await webhook.init(interaction.client, charName);
            await webhook.editCharacter(character);
            await interaction.editReply(`Le personnage **${charName}** a été édité avec succès.`);
        } else if (subcommand==="supprimer"){
            const charName = interaction.options.getString('personnage', true);
            await webhook.init(interaction.client, charName);
            await webhook.delete();
            await interaction.editReply({
                content:`:+1: Le personnage **${charName}** a été supprimé avec succès !`
            });
        }
    }
}
export=command;