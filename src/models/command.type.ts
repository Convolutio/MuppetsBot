import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'
import { MuppetsClient } from '../muppets-client';

type slashCommandBuilders = SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand'|'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

export class CommandType {
    muppetsClient!:MuppetsClient;
    buildData!:(()=>(slashCommandBuilders|ContextMenuCommandBuilder));
    autocomplete?:((interaction:AutocompleteInteraction)=>Promise<void>)
    execute!: ((interaction:ChatInputCommandInteraction|ContextMenuCommandInteraction)=>Promise<void>);
}

export interface CommandMethodsType {
    buildData:((this:CommandType)=>(slashCommandBuilders|ContextMenuCommandBuilder));
    autocomplete?:((this:CommandType, interaction:AutocompleteInteraction)=>Promise<void>)
    execute: ((this:CommandType, interaction:ChatInputCommandInteraction|ContextMenuCommandInteraction)=>Promise<void>);
}