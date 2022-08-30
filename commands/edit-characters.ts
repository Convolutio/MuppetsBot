import { Attachment, BufferResolvable, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { AsyncBuiltCommandMethods } from "../models/command.type";

function getAvatar(avatar_url:string|null, avatarAttachment:Attachment|null):BufferResolvable|undefined {
    let avatar:BufferResolvable|undefined;
    if (avatar_url) avatar = avatar_url;
    if (avatarAttachment && avatarAttachment.contentType?.includes('image')){
        const attachment = avatarAttachment.url
        avatar = attachment;
    }
    return avatar;
}
export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        const options = (await this.muppetsClient.characterService.getCharactersNames())
            .map(name => ({name:name, value:name}));
        const i18n = this.muppetsClient.i18n;
        return new SlashCommandBuilder()
            .setName(i18n("characters"))
            .setDescription(i18n("characters_description"))
            .addSubcommand(subcommand => {
                return subcommand.setName(i18n("add"))
                .setDescription(i18n("characters$add_description"))
                .addStringOption(option =>
                    option.setName(i18n('name'))
                        .setDescription(i18n("characters$add$name_description"))
                        .setRequired(true)
                    )
                .addStringOption(option =>
                    option.setName(i18n("avatarURL"))
                        .setDescription(i18n("characters$add$avatarURL_description"))
                    )
                .addAttachmentOption(option =>
                    option.setName(i18n("avatarFile"))
                        .setDescription(i18n("characters$add$avatarFile_description"))
                    )
            })
            .addSubcommand(subcommand =>
                subcommand.setName(i18n("edit"))
                .setDescription(i18n("characters$edit_description"))
                .addStringOption(option => 
                    option.setName(i18n("character"))
                        .setDescription(i18n("characters$edit$character_description"))
                        .setRequired(true)
                        .addChoices(...options)
                )
                .addStringOption(option =>
                    option.setName(i18n('name'))
                        .setDescription(i18n("characters$edit$name_description"))
                    )
                .addStringOption(option =>
                    option.setName(i18n("avatarURL"))
                        .setDescription(i18n("characters$edit$avatarURL_description"))
                    )
                .addAttachmentOption(option =>
                    option.setName(i18n("avatarFile"))
                        .setDescription(i18n("characters$edit$avatarFile_description"))
                    )
            )
            .addSubcommand(subcommand => {
                return subcommand.setName(i18n("remove"))
                .setDescription(i18n("characters$remove_description"))
                .addStringOption(option =>
                    option.setName(i18n("character"))
                        .setDescription(i18n("characters$remove$character_description"))
                        .setRequired(true)
                        .addChoices(...options)
                    )
            })
    },
    async execute (interaction:ChatInputCommandInteraction){
        const i18n = this.muppetsClient.i18n;
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand(true);
        const channel = interaction.channel;
        if (!channel) throw "Channel information not found. Please try again.";
        const webhook = new MyWebhook(this.muppetsClient.characterService);
        if (subcommand===i18n("add")) {
            const name = interaction.options.getString(i18n("name"), true);
            const avatar_url = interaction.options.getString(i18n("avatarURL"));
            const avatarAttachment = interaction.options.getAttachment(i18n("avatarFile"));
            const avatar = getAvatar(avatar_url, avatarAttachment)
            if (!avatar) throw i18n("invalidAvatar_error");
            const character = {
                name:name,
                avatar:avatar
            }
            await webhook.create(channel, character);
            await interaction.editReply(i18n("characterCreated_log", {charName:character.name}));
        } else if (subcommand===i18n("edit")){
            const charName = interaction.options.getString(i18n("character"), true);
            const name = interaction.options.getString(i18n("name"));
            const avatar_url = interaction.options.getString(i18n("avatarURL"));
            const avatarAttachment = interaction.options.getAttachment(i18n("avatarFile"));
            const newAvatar = getAvatar(avatar_url, avatarAttachment);
            const character = {
                name:name||undefined,
                avatar:newAvatar
            }
            await webhook.init(interaction.client, charName);
            await webhook.editCharacter(character);
            await interaction.editReply(i18n("characterEdited_log", {charName:charName}));
        } else if (subcommand===i18n("remove")){
            const charName = interaction.options.getString(i18n("character"), true);
            await webhook.init(interaction.client, charName);
            await webhook.delete();
            await interaction.editReply({
                content:i18n("characterDeleted_log", {charName:charName})
            });
        }
    }
}