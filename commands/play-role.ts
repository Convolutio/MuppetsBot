import { ActionRowBuilder, ChatInputCommandInteraction, ComponentType, SelectMenuBuilder, SelectMenuInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { MyWebhook } from "../classes/webhook";
import { MyCommandType } from "../models/command.type";
import { CharacterService } from '../classes/characterService';

async function executeWebhook(interaction:ChatInputCommandInteraction|SelectMenuInteraction, charName:string, textContent:string) {
    const webhook = new MyWebhook();
    await webhook.init(interaction.client, charName);
    const channel = await interaction.channel?.fetch();
    if (channel instanceof TextChannel) {
        try {
            await webhook.speak(textContent,channel);
            await interaction.editReply("Fait :+1:");
        } catch(err) {
            await interaction.editReply({content:`An error has occured with the webhook :\`${err}\`.`});
        }
    }
}

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
        const charService = new CharacterService();
        //The command has been submitted.
        await interaction.deferReply({ephemeral:true});
        const charName = interaction.options.getString('personnage');
        const textContent = interaction.options.getString('contenu');
        if (!charName) throw 'Le nom de personnage à spécifier est introuvable.'
        const selectedChar = await charService.getCharacterWithName(charName);
        const quotes = selectedChar.quotes||[];
        if (textContent) {
            await executeWebhook(interaction, charName, textContent)
        } else if (quotes.length>0) {
            const rows = [
                new ActionRowBuilder<SelectMenuBuilder>()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId("1")
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
            const menuCollector = msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000});
            menuCollector.on('collect', async i => {
                await i.update({content:"En attente du webhook...", components:[]});
                await executeWebhook(interaction, charName, quotes.find(val => val.id===+i.values[0])?.quote||'');
            });
        } else {
            await interaction.editReply(`:grimacing: **${charName}** n'a aucune réplique enregistrée.\nVeuillez en enregistrer une via la commande \`/ajouter_réplique\` ou bien remplir le paramètre \`contenu\` de la commande actuelle avec votre message personnalisé.`);
        }
    }
}
export = command;