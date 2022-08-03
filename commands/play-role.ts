import { AutocompleteInteraction, ChatInputCommandInteraction, InteractionType, SlashCommandBuilder, TextChannel } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import { CharacterService } from '../classes/characterService';
import { Character } from "../models/character";

const command : MyCommandType = {
    data : new SlashCommandBuilder()
        .setName('faire_parler')
        .setDescription('Fait parler le personnage sélectionné avec la citation demandée.')
        .addStringOption(option =>
            option.setName("personnage")
                .setDescription("Entrez le nom du personnage qui doit parler.")
                .setRequired(true)
                .setAutocomplete(true)
            )
        .addStringOption(option =>
            option.setName("réplique")
                .setDescription("Entrez la phrase que vous souhaitez faire dire.")
                .setRequired(true)
                .setAutocomplete(true)),
        
    async execute(interaction:AutocompleteInteraction|ChatInputCommandInteraction) {
        const charService = new CharacterService();
        if (interaction.type===InteractionType.ApplicationCommandAutocomplete) {
            let choices:string[]=[];
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name==="personnage"){
                choices = await charService.getCharactersName();
            } else if (focusedOption.name=="réplique") {
                console.log(interaction.options.data);
                const charName = interaction.options.getString("personnage");
                if (charName) {
                    const selectedChar = await charService.getCharacterWithName(charName);
                    if (selectedChar) {
                        choices = selectedChar.quotes||[];
                        choices.push("Custom Message");
                    }
                }
            } else {return;}
            const filtered = choices.filter(choice => 
                choice.toLocaleUpperCase().includes(focusedOption.value.toLocaleUpperCase())
                );
            await interaction.respond(
                filtered.map(choice => ({name:choice, value:choice})),
            );
        } else {
            const charName = interaction.options.getString('personnage');
            const quote = interaction.options.getString("réplique");
            if (quote && charName) {
                const selectedChar = await charService.getCharacterWithName(charName);
                if (selectedChar) {
                    const webhook = new MyWebhook(interaction.client);
                    const channel = await interaction.channel?.fetch();
                    (channel instanceof TextChannel)?await webhook.speak(quote, selectedChar, channel):{};
                }
            }
        }
    }
}
export = command;