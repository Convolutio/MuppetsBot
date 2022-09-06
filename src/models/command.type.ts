import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import { MuppetsClient } from '../muppets-client';

type slashCommandBuilders = SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

export class AsyncBuiltCommand {
    muppetsClient!:MuppetsClient;
    buildData!:(()=>Promise<slashCommandBuilders>);
    autocomplete?:((interaction:AutocompleteInteraction)=>Promise<void>)
    execute!: ((interaction:ChatInputCommandInteraction)=>Promise<void>);
}

export interface AsyncBuiltCommandMethods {
    buildData:((this:AsyncBuiltCommand)=>Promise<slashCommandBuilders>);
    autocomplete?:((this:AsyncBuiltCommand, interaction:AutocompleteInteraction)=>Promise<void>)
    execute: ((this:AsyncBuiltCommand, interaction:ChatInputCommandInteraction)=>Promise<void>);
}