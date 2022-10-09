import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

import { get_locales } from "../i18n/i18n";
import { CommandMethodsType } from "../models/command.type";

export const command:CommandMethodsType = {
    buildData() {
        return new ContextMenuCommandBuilder()
            .setName('edit')
            .setNameLocalizations(get_locales("edit"))
            .setType(ApplicationCommandType.Message)
    },
    async execute(interaction) {
        if (!interaction.isMessageContextMenuCommand()) return;
        const target = interaction.targetMessage;
        try {
            const whk = await interaction.client.fetchWebhook(target.author.id);
            await this.muppetsClient.createContentForm(interaction,
                async (submission, textInput) => {
                    await whk.editMessage(target.id, textInput);
                    await submission.reply({content:this.muppetsClient.i18n("messageEdited_log"), ephemeral:true});
                },
                target.content);
        } catch(err:any) {
            console.error(err);
        }
    }
}