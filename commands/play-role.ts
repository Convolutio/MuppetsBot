import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import { CharacterService } from '../classes/characterService';
import { AddQuoteSelector } from "../classes/selectors";

const command : MyCommandType = {
    async buildData() {
        const options = (await (new CharacterService()).getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return new SlashCommandBuilder()
        .setName('faire_parler')
        .setDescription('Fait parler le personnage sélectionné avec la citation demandée.')
        .addStringOption(option =>
            option.setName("personnage")
                .setDescription("Entrez le nom du personnage qui doit parler.")
                .setRequired(true)
                .addChoices(...options)
            )
        .addStringOption(option =>
            option.setName('contenu')
                .setDescription('(Optionnel) Remplissez ce champ pour personnaliser votre contenu.')
                .setRequired(false)
            )
    },
        
    async execute(interaction:ChatInputCommandInteraction) {
        //The command has been submitted.
        await interaction.reply({content:`En attente du webhook...`,ephemeral:true});
        const charName = interaction.options.getString('personnage', true);
        const webhook = new MyWebhook();
        await webhook.init(interaction.client, charName);
        const channel = await interaction.channel?.fetch();
        if (!channel) throw "Channel information not found. Please try again."
        const textContent = interaction.options.getString('contenu');
        if (textContent) {
            await webhook.speak(textContent, channel);
            await interaction.editReply({content:`:+1: Fait !`, components:[]});
        } else {
            await AddQuoteSelector(
                charName, true, 'selectQuoteToTell', interaction,
                async i => {
                    await i.deferUpdate();
                    await webhook.speak(i.values[0], channel);
                    await i.editReply({content:`:+1: Fait !`, components:[]});
                }
            );
        }
    }
}
export = command;