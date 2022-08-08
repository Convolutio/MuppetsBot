import { AutocompleteInteraction, ChatInputCommandInteraction, Interaction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'

type slashCommand = SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

export interface MyCommandType {
    buildData:(()=>Promise<slashCommand>);
    execute: ((interaction:any)=>Promise<void>)
}