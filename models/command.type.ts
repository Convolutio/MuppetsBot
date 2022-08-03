import { AutocompleteInteraction, ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from 'discord.js'

type slashCommand = SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>;

export interface MyCommandType {
    data:slashCommand;
    execute: ((interaction:any)=>Promise<void>)
}