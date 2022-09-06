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
        const i18n_b = this.muppetsClient.i18n_build;
        return i18n_b(
            new SlashCommandBuilder(),
            "characters",
            "characters_description")
            .addSubcommand(subcommand =>
                i18n_b(subcommand, "add", "characters$add_description") 
                .addStringOption(option =>
                    i18n_b(option, "name", "characters$add$name_description")
                        .setRequired(true)
                    )
                .addStringOption(option =>
                    i18n_b(option, "avatar_url", "characters$add$avatarURL_description")
                    )
                .addAttachmentOption(option =>
                    i18n_b(option, "avatar_file", "characters$add$avatarFile_description")
                    )
            )
            .addSubcommand(subcommand =>
                i18n_b(subcommand, "edit", "characters$edit_description")
                .addStringOption(option => 
                    i18n_b(option, "character", "characters$edit$character_description")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    i18n_b(option, "name", "characters$edit$name_description")
                )
                .addStringOption(option =>
                    i18n_b(option, "avatar_url", "characters$edit$avatarURL_description")
                )
                .addAttachmentOption(option =>
                    i18n_b(option, "avatar_file", "characters$edit$avatarFile_description")
                )
            )
            .addSubcommand(subcommand => 
                i18n_b(subcommand, "remove", "characters$remove_description")
                .addStringOption(option =>
                    i18n_b(option, "character", "characters$remove$character_description")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
            )
    },
    async autocomplete(interaction) {
        this.muppetsClient.characterAutocomplete(interaction);
    },
    async execute (interaction:ChatInputCommandInteraction){
        const i18n = this.muppetsClient.i18n;
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand(true);
        const channel = interaction.channel;
        if (!channel) throw "Channel information not found. Please try again.";
        const webhook = new MyWebhook(this.muppetsClient.characterService);
        if (subcommand==="add") {
            const name = interaction.options.getString("name", true);
            const avatar_url = interaction.options.getString("avatar_url");
            const avatarAttachment = interaction.options.getAttachment("avatar_file");
            const avatar = getAvatar(avatar_url, avatarAttachment)
            if (!avatar) throw i18n("invalidAvatar_error");
            const character = {
                name:name,
                avatar:avatar
            }
            await webhook.create(channel, character);
            await interaction.editReply(i18n("characterCreated_log", {charName:character.name}));
        } else if (subcommand==="edit"){
            const charName = interaction.options.getString("character", true);
            const name = interaction.options.getString("name");
            const avatar_url = interaction.options.getString("avatar_url");
            const avatarAttachment = interaction.options.getAttachment("avatar_file");
            const newAvatar = getAvatar(avatar_url, avatarAttachment);
            const character = {
                name:name||undefined,
                avatar:newAvatar
            }
            await webhook.init(interaction.client, charName);
            await webhook.editCharacter(character);
            await interaction.editReply(i18n("characterEdited_log", {charName:charName}));
        } else if (subcommand==="remove"){
            const charName = interaction.options.getString("character", true);
            await webhook.init(interaction.client, charName);
            await webhook.delete();
            await interaction.editReply({
                content:i18n("characterDeleted_log", {charName:charName})
            });
        }
    }
}