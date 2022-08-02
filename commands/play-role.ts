import { ChatInputCommandInteraction, MessagePayload, SlashCommandBuilder, WebhookMessageOptions } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";

const command : MyCommandType = {
    data : new SlashCommandBuilder()
    .setName('faire_parler')
    .setDescription('Fait parler le personnage sélectionné avec la citation demandée.')
    .addStringOption(option =>
        option.setName('personnage')
            .setDescription('Le personnage qu\'il faut faire parler.')
            .setRequired(true)
            .addChoices(
                {name:'Gérard Depardieu', value:'Gérard Depardieu'},
                {name:'Jacques Chirac', value:'Jacques Chirac'}
            )
    ),
    async execute(interaction:ChatInputCommandInteraction) {
        const webhook = new MyWebhook(interaction.client);
        /*
        const webhookMessageOptions : WebhookMessageOptions = {
            username:interaction.options.getString('personnage')||"nothing",
            avatarURL:"https://www.ecosia.org/images?q=g%C3%A9rard%20depardieu#id=3EBB4832DFB1EC6C55B9BB107A74185C09CD3672",
            content:'ça se bouffe, ça ?'
        };
        const response = new MessagePayload(interaction, webhookMessageOptions)
        await interaction.reply(response);
        */
    }
}
export = command;