import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CharacterService } from "../classes/characterService";
import { MyCommandType } from "../models/command.type";

const command:MyCommandType = {
    async buildData() {
        const options = (await (new CharacterService()).getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return new SlashCommandBuilder()
        .setName('ajouter_réplique')
        .setDescription('Enregistre une nouvelle réplique pour le personnage.')
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
    },
    async execute(interaction:ChatInputCommandInteraction) {
        await interaction.deferReply({ephemeral:true});
        const charName = interaction.options.getString('personnage', true);
        const quote = interaction.options.getString('contenu', true);
        await (new CharacterService()).addQuote(charName, quote);
        await interaction.editReply('La nouvelle réplique a été créée avec succès.')
    }
}

export = command;