import { ActionRowBuilder, SelectMenuBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, ComponentType, SelectMenuInteraction } from "discord.js";
import { MuppetsClient } from "../muppets-client";

function selector(customId:string, placeholder:string, ...options:{label:string, value:string}[]) {
    return new ActionRowBuilder<SelectMenuBuilder>()
    .addComponents(
        new SelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .addOptions(...options)
    )
}

const to_export = {
    async AddQuoteSelector(this:MuppetsClient, charName:string, returnQuote:boolean,customId:string, interaction:ChatInputCommandInteraction,
        callback:(interaction:SelectMenuInteraction)=>Promise<void>):Promise<void> {
        /*Reply _again_ to the interaction with inviting user to select a character's quote in the selector
        which will be created. The callback argument will be executed when a value of the
        selector is submitted.
        I insist on the _again_ : please deferReply or reply your interaction before run this function.*/
        const quotes = (await this.characterService.getCharacterWithName(charName)).quotes||[];
        if (quotes.length==0) {
            await interaction.editReply({
                content:`:confused: **${charName}** n'a aucune réplique enregistrée.`
            });
        }
        else {
            const rows = [selector(
                customId, "Sélectionnez la réplique pré-enregistrée",...quotes.map(
                quote_obj => {
                    const quote = quote_obj.quote;
                    const label:string=quote.length>50?quote.slice(0,47)+'...':quote; 
                    return {
                        label:label,
                        value:returnQuote?quote:quote_obj.id.toString()
                    }
                }
            ))];
            const msg = await interaction.editReply({
                content:`Veuillez sélectionner la réplique.`,
                components:rows,
            });
            msg.createMessageComponentCollector({componentType:ComponentType.SelectMenu, time:15000})
                .on('collect', async inter => {
                    if (inter.customId!==customId) return ;
                    await callback(inter);
                });
        }
    }
}
export = to_export;