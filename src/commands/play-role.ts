import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, ModalMessageModalSubmitInteraction, ModalSubmitInteraction, SelectMenuInteraction, SlashCommandBuilder } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { CommandMethodsType } from "../models/command.type";
import { createContentForm } from "../classes/contentForm";

export const command:CommandMethodsType = {
    buildData() {
        return this.muppetsClient.i18n_build(
            new SlashCommandBuilder(),
            "play",
            "play_description")
        .addStringOption(option =>
            this.muppetsClient.i18n_build(option,"character", "play$character_description")
                .setRequired(true)
                .setAutocomplete(true)
            )
        .addMentionableOption(option =>
            option.setName('mention')
            .setDescription("Make the character mention somebody at the end of its message.")
        )
        .addAttachmentOption(option =>
            option.setName('attachment')
            .setDescription("Attach a file to the message you want the character to send."))
        }
    ,
    async autocomplete(interaction) {
        this.muppetsClient.characterAutocomplete(interaction)
    },
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        //The command has been submitted.
        this.muppetsClient.checkMemberUsages(interaction);
        await interaction.deferReply({ephemeral:true});
        const charName = interaction.options.getString("character", true);
        const webhook = new MyWebhook(this.muppetsClient.characterService);
        await webhook.init(interaction.client, charName);
        const channel = interaction.channel;
        if (!channel) throw "Channel information not found. Please try again."
        const mention = interaction.options.getMentionable('mention')||undefined;
        const attachment = interaction.options.getAttachment('attachment')||undefined;
        const button = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("customButton")
                .setLabel("Customize")
                .setStyle(ButtonStyle.Primary)
        );
        const reply = await this.muppetsClient.AddQuoteSelector(
            charName, true, 'selectQuoteToTell');
        if (reply.components) {
            reply.components.push(button)
        } else {
            reply.components = [button]
        }
        const msg = await interaction.editReply(reply);
        const speak = async (i:SelectMenuInteraction|ModalMessageModalSubmitInteraction,
            content:string) => {
                await i.update({content:this.muppetsClient.i18n("webhookAwaited_log"), components:[]});
                await webhook.speak(content, channel, mention, attachment);
                await i.editReply({content:this.muppetsClient.i18n("done")});
                this.muppetsClient.addMemberUsage(interaction)
        };
        msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000})
            .on('collect', async inter => {
                if (inter.customId!=="selectQuoteToTell") return ;
                await speak(inter, inter.values[0]);
            });
        msg.createMessageComponentCollector({componentType:ComponentType.Button, time:15000})
            .on('collect', async inter => {
                if (inter.customId!=="customButton") return;
                await createContentForm(inter, "Write a custom speech.",
                    async (submission, textInput)=> {
                        if (!submission.isFromMessage()) return;
                        await speak(submission, textInput);
                    }
                )
            })
    }
}
