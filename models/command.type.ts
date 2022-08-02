import { ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from 'discord.js'

type commandExecution = ((interaction:Interaction)=>Promise<void>)
| ((interaction:ChatInputCommandInteraction)=>Promise<void>)

type slashCommand = SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>;

export interface MyCommandType {
    data:slashCommand;
    execute: commandExecution
}