import { ActionRowBuilder, AutocompleteInteraction, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, InteractionType, SelectMenuBuilder, SelectMenuInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import { CharacterService } from '../classes/characterService';
import { Character } from "../models/character";
import { setTimeout } from "node:timers";


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
        await interaction.deferReply({ephemeral:true});
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
                                        const label:string=quote.length>50?quote.slice(0,47)+'...':quote; 
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
                const msg = await interaction.editReply({content:'Choisissez une réplique', components:rows});
                const menuCollector = msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000});
                const ButtonCollector = msg.createMessageComponentCollector({componentType:ComponentType.Button, time:15000});
                menuCollector.on('collect', async i => {
                    await i.update({content:"En attente du webhook...", components:[]});
                    const webhook = new MyWebhook();
                    await webhook.init(i.client);
                    const channel = await i.channel?.fetch();
                    if (channel instanceof TextChannel) {
                        try {
                            await webhook.speak(i.values[0], selectedChar, channel);
                            await i.editReply({content:"Fait :+1:", components:[]});
                        } catch(err) {
                            await i.editReply({content:`An error has occured with the webhook :\`${err}\`.`})
                        }
                    };
                })
                /*
                
                */
            } else {
                await interaction.editReply('Le personnage entré n\'est pas enregistré.')
            }
        }
    }
}
export = command;