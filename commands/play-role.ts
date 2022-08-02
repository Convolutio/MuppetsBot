import { ChatInputCommandInteraction, MessagePayload, SlashCommandBuilder, WebhookMessageOptions } from "discord.js";
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
        /*
        const webhookMessageOptions : WebhookMessageOptions = {
            username:interaction.options.getString('personnage')||interaction.,
        };
        const response = new MessagePayload(interaction, )*/
    }

}