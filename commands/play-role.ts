import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, InteractionType, SelectMenuBuilder, SelectMenuInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import { CharacterService } from '../classes/characterService';
import { Character } from "../models/character";


const command : MyCommandType = {
    buildData : (async () => {
        const options = (await (new CharacterService()).getCharactersName()).map(
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
    }),
        
    async execute(interaction:ChatInputCommandInteraction) {
        const charService = new CharacterService();
        //The command has been submitted.
        //await interaction.deferReply({ephemeral:true});
        const charName = interaction.options.getString('personnage');
        if (charName) {
            const selectedChar = await charService.getCharacterWithName(charName);
            if (selectedChar) {
                const quotes = selectedChar.quotes;
                const rows= [
                    new ActionRowBuilder<SelectMenuBuilder>()
                        .addComponents(
                            new SelectMenuBuilder()
                                .setCustomId("1")
                                .setPlaceholder("Sélectionnez la réplique pré-enregistrée.")
                                .addOptions(quotes?quotes.map(
                                    quote => {
                                        const label :string=quote; 
                                        return {
                                            label:label,
                                            value:quote
                                        }
                                    }
                                ):[])
                        ),
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId("2")
                                .setLabel("Personnaliser")
                                .setStyle(ButtonStyle.Primary)
                        ),
                ];
                await interaction.reply({content:'Choisissez une réplique', components:rows});
                /*
                const webhook = new MyWebhook();
                await webhook.init(interaction.client);
                const channel = await interaction.channel?.fetch();
                if (channel instanceof TextChannel) {
                    try {
                        await webhook.speak(quote, selectedChar, channel);
                        await interaction.editReply({content:"Fait :+1:"});
                    } catch(err) {
                        await interaction.editReply({content:`An error has occured with the webhook :\`${err}\`.`})
                    }
                    
                };
                */
            } else {
                await interaction.editReply('Le personnage entré n\'est pas enregistré.')
            }
        }
    }
}
export = command;