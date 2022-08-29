import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AsyncBuiltCommandMethods } from "../models/command.type";

export const command:AsyncBuiltCommandMethods = {
    async buildData() {
        const options = (await this.muppetsClient.characterService.getCharactersNames()).map(
            name => ({name:name, value:name})
        );
        return new SlashCommandBuilder()
        .setName('répliques')
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
            subcommand.setName("modifier")
                .setDescription("Remplace la citation d'un personnage par une nouvelle.")
                .addStringOption(option =>
                    option.setName('personnage')
                        .setDescription("Entrez le nom du personnage concerné.")
                        .setRequired(true)
                        .addChoices(...options)
                    )
                .addStringOption(option =>
                    option.setName("contenu")
                        .setDescription('Entrez ici la nouvelle citation.')
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
        await interaction.deferReply();
        const charService = this.muppetsClient.characterService;
        const subcommand = interaction.options.getSubcommand(true);
        const charName = interaction.options.getString('personnage', true);
        if (subcommand === "ajouter") {
            const quote = interaction.options.getString('contenu', true);
            await charService.addQuote(charName, quote);
            await interaction.editReply({content:'La nouvelle réplique a été créée avec succès.'});
        } else if (subcommand==="modifier") {
            const new_quote = interaction.options.getString('contenu', true);
            await this.muppetsClient.AddQuoteSelector(
                charName, false, 'selectQuoteToEdit',interaction,
                async i => {
                    await i.deferUpdate();
                    const selectedQuoteId = +i.values[0];
                    await charService.editQuote(selectedQuoteId, new_quote);
                    await i.editReply({
                        content:`:+1: La citation sélectionnée de **${charName}** a été supprimé avec succès`,
                        components:[]
                    });
                }
            );
        } else if (subcommand==="supprimer") {
            await this.muppetsClient.AddQuoteSelector(
                charName, false, 'selectQuoteToDelete',interaction,
                async i => {
                    await i.deferUpdate();
                    const selectedQuoteId = +i.values[0];
                    await charService.deleteQuote(selectedQuoteId);
                    await i.editReply({
                        content:`:+1: La citation sélectionnée de **${charName}** a été supprimé avec succès`,
                        components:[]
                    });
                }
            );
        }
    }
}