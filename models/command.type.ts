import { AutocompleteInteraction, ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from 'discord.js'

type slashCommand = SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>;

export interface MyCommandType {
    buildData:(()=>Promise<slashCommand>);
    execute: ((interaction:any)=>Promise<void>)
}