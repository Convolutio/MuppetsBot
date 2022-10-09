import { ActionRowBuilder, BufferResolvable, ButtonBuilder, ButtonStyle, ComponentType, ModalMessageModalSubmitInteraction, SelectMenuInteraction, SlashCommandBuilder } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { CommandMethodsType } from "../models/command.type";
import { setTimeout } from "node:timers/promises";
import toBuffer from "blob-to-buffer";

const TIME_TO_WAIT = 135000;

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
                .setLabel(this.muppetsClient.i18n("buttonCustomize"))
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("customAndSaveButton")
                .setLabel(this.muppetsClient.i18n("buttonCustomizeAndSave"))
                .setStyle(ButtonStyle.Success)
        );
        const reply = await this.muppetsClient.AddQuoteSelector(
            charName, 'selectQuoteToTell');
        if (reply.components) {
            reply.components.push(button)
        } else {
            reply.components = [button]
        }
        const msg = await interaction.editReply(reply);
        let has_spoken:boolean = false;
        const speak = async (i:SelectMenuInteraction|ModalMessageModalSubmitInteraction,
            content:string, savedAttachment?:BufferResolvable) => {
                await i.update({content:this.muppetsClient.i18n("webhookAwaited_log"), components:[]});
                has_spoken = true;
                const attachments:BufferResolvable[] = [];
                if (savedAttachment) attachments.push(savedAttachment);
                if (attachment?.url) attachments.push(attachment?.url);
                const message = await webhook.speak(content, channel, attachments);
                await i.editReply({content:this.muppetsClient.i18n("done")});
                this.muppetsClient.addMemberUsage(interaction)
                return message
        };
        msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:TIME_TO_WAIT})
            .on('collect', async inter => {
                if (inter.customId!=="selectQuoteToTell") return ;
                const quote_id = inter.values[0];
                const quote = await this.muppetsClient.characterService.getQuote(quote_id);
                let buffer:BufferResolvable|undefined;
                let content:string = quote.quote;
                if (mention) content+="\n"+mention.toString();
                if (quote.attachment && typeof quote.attachment!=="string") {
                    buffer = Buffer.from(quote.attachment);
                    const msg = await speak(inter, content, buffer);
                    const url = msg.attachments.first()?.url;
                    if (!url) throw "The attachment has not been sent";
                    await this.muppetsClient.characterService.addAttachmentUrl(quote_id, url);
                } else {
                    buffer = quote.attachment||undefined;
                    await speak(inter, content, buffer);
                }
            })
            .on("ignore", async inter => {
                if (inter.customId!=="selectQuoteToTell"||!has_spoken) return ;
                await inter.update({content:"The request has expired.", components:[]})
            });
        msg.createMessageComponentCollector({componentType:ComponentType.Button, time:TIME_TO_WAIT})
            .on('collect', async inter => {
                if (inter.customId==="customButton") {
                    await this.muppetsClient.createContentForm(inter,
                        async (submission, textInput) => {
                            if (!submission.isFromMessage()) return;
                            let content:string = textInput;
                            if (mention) content+="\n"+mention.toString(); 
                            await speak(submission, content);
                        }
                    )
                } else if (inter.customId==="customAndSaveButton") {
                    await this.muppetsClient.createContentForm(inter,
                        async (submission, textInput) => {
                            if (!submission.isFromMessage()) return;
                            let content:string = textInput;
                            if (mention) content+="\n"+mention.toString();
                            const msg = await speak(submission, content);
                            await this.muppetsClient.characterService.addQuote(charName, content, attachment, msg.attachments.first()?.url);
                        }
                    )
                } else return;
            })
        await setTimeout(TIME_TO_WAIT);
        if (!has_spoken) {
            await interaction.editReply({content:"The request has expired.", components:[]})
        }
    }
}
