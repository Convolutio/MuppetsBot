import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SelectMenuBuilder, SlashCommandBuilder } from "discord.js";
import { CharacterService } from "../classes/characterService";
import { MyCommandType } from "../models/command.type";

const command:MyCommandType = {
    async buildData() {
        const options = (await (new CharacterService()).getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return new SlashCommandBuilder()
        .setName('répliques')
        .setDescription('Ajoute ou supprime une réplique pour un personnage')
        .addSubcommand(subcommand =>
            subcommand.setName("ajouter")
                .setDescription("Enregistre une nouvelle réplique pour le personnage.")
                .addStringOption(option =>
                    option.setName("personnage")
                        .setDescription("Entrez le nom du personnage concerné.")
                        .setRequired(true)
                        .addChoices(...options)
                    )
                .addStringOption(option =>
                    option.setName('contenu')
                        .setDescription('Entrez la réplique à enregistrer.')
                        .setRequired(true)
                    )
            )
        .addSubcommand(subcommand =>
            subcommand.setName("supprimer")
                .setDescription("Supprime la réplique d'un personnage")
                .addStringOption(option =>
                    option.setName("personnage")
                        .setDescription("Entrez le nom du personnage concerné.")
                        .setRequired(true)
                        .addChoices(...options)
                    )
            )
        
    },
    async execute(interaction:ChatInputCommandInteraction) {
        const charService = new CharacterService();
        const subcommand = interaction.options.getSubcommand(true);
        await interaction.deferReply({ephemeral:true});
        const charName = interaction.options.getString('personnage', true);
        if (subcommand === "ajouter") {
            const quote = interaction.options.getString('contenu', true);
            await charService.addQuote(charName, quote);
            await interaction.editReply('La nouvelle réplique a été créée avec succès.')
        } else if (subcommand==="supprimer") {
            const selectedChar = await charService.getCharacterWithName(charName);
            const quotes = selectedChar.quotes||[];
            if (quotes.length>0) {
                const rows = [
                    new ActionRowBuilder<SelectMenuBuilder>()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("selectQuoteToDelete")
                            .setPlaceholder("Sélectionnez la réplique pré-enregistrée.")
                            .addOptions(quotes.map(
                                quote_obj => {
                                    const quote = quote_obj.quote;
                                    const label:string=quote.length>50?quote.slice(0,47)+'...':quote; 
                                    return {
                                        label:label,
                                        value:quote_obj.id.toString()
                                    }
                                }))
                    )
                ];
                const msg = await interaction.editReply({content:'Choisissez une réplique', components:rows});
                msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000})
                    .on('collect', async i => {
                        await i.deferUpdate();
                        if (i.customId!=="selectQuoteToDelete") return;
                        const selectedQuoteId = +i.values[0];
                        await charService.deleteQuote(selectedQuoteId);
                        await i.editReply({
                            content:`:+1: La citation sélectionnée de **${charName}** a été supprimé avec succès`,
                            components:[]
                        })
                    })
            } else {
                await interaction.editReply(`:confused: **${charName}** n'a pas de réplique enregistrée.`)
            }
        }
    }
}

export = command;