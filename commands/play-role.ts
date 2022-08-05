import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, SelectMenuBuilder, SlashCommandBuilder, TextChannel } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import { CharacterService } from '../classes/characterService';


const command : MyCommandType = {
    buildData : (async () => {
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
    }),
        
    async execute(interaction:ChatInputCommandInteraction) {
        const charService = new CharacterService();
        //The command has been submitted.
        await interaction.deferReply({ephemeral:true});
        const charName = interaction.options.getString('personnage');
        if (!charName) throw 'Le nom de personnage à spécifier est introuvable.'
        const selectedChar = await charService.getCharacterWithName(charName);
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
            await webhook.init(i.client, selectedChar.name);
            const channel = await i.channel?.fetch();
            if (channel instanceof TextChannel) {
                try {
                    await webhook.speak(i.values[0],channel);
                    await i.editReply({content:"Fait :+1:", components:[]});
                } catch(err) {
                    await i.editReply({content:`An error has occured with the webhook :\`${err}\`.`})
                }
            };
        })
    }
}
export = command;