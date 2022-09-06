import { ChatInputCommandInteraction, Collection, Interaction, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js"
import { CharacterService } from "./classes/characterService"
import { AsyncBuiltCommand, AsyncBuiltCommandMethods } from "./models/command.type";
import { AddQuoteSelector } from "./classes/selectors";
import path from 'node:path';
import fs from 'node:fs';
import { token, clientId, guildId } from "../config.json";
import {TFunction} from 'i18next';
import { i18n_build, i18n } from "./i18n/i18n";
import { DISCORD_LANGUAGE } from "./models/translation.type";
export class MuppetsClient {
    public characterService = new CharacterService(this);
    public i18n!:TFunction;
    private commands_ids:string[]=[];
    private rest=(new REST({version:'10'})).setToken(token);
    private commands!:Collection<string, AsyncBuiltCommand>;

    constructor(language?:DISCORD_LANGUAGE) {
        this.i18n = i18n(language);
    }

    private handle_error(interaction:ChatInputCommandInteraction, error:unknown) {
        const rep = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
        if (interaction.deferred) {
            interaction.editReply(rep)   
        } else {
            interaction.reply(rep)
        }
    }

    private getCommandsObjs():AsyncBuiltCommand[] {
        const commands:AsyncBuiltCommand[] = [];
        const commandsPath = path.join(__dirname, 'commands');
        const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".ts")||file.endsWith(".js"));
        for (const file of commandsFiles) {
            const filePath = path.join(commandsPath, file);
            const required = require(filePath);
            const commandMethods :AsyncBuiltCommandMethods = required.command;
            const command:AsyncBuiltCommand = {
                muppetsClient:this,
                ...commandMethods
            };
            commands.push(command);
        }
        return commands;
    }

    async deployCommands() {
        const commandsJSONData:RESTPostAPIApplicationCommandsJSONBody[] = [];
        this.commands_ids = []; 
        try {
            console.log(`\nMuppets Bot logging :`)
            console.log(`     Requiring commands' data...`);
            const commands = this.getCommandsObjs();
            for (let command of commands) {
                const data = await (command.buildData)();
                commandsJSONData.push(data.toJSON());
            }
            console.log(`     Started refreshing application (/) commands in ${guildId} guild.`);
            await Promise.all(commandsJSONData.map(async commandJSONData => {
                const res:any = await this.rest.post(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commandJSONData }
                );
                this.commands_ids.push(res.id);
            }));
            console.log("     Successfuly reloaded application (/) commands in this server.")
            console.log("End of Muppets Bot logging.\n")
        } catch(error) {
            console.error(error);
        }
    }

    async initCommandsCollection():Promise<void> {
        const commands = new Collection<string, AsyncBuiltCommand>();
        await this.deployCommands();
        await Promise.all(this.getCommandsObjs().map(async command => {
            const name = (await command.buildData()).name;
            commands.set(name, command); 
        }));
        this.commands = commands;
    }

    treat(interaction:Interaction) {
        if (!(interaction.isChatInputCommand()||interaction.isAutocomplete())) return;
		const selectedCommand = this.commands.get(interaction.commandName);
        if (!selectedCommand) return;
		if (interaction.isAutocomplete() && selectedCommand.autocomplete) {
			selectedCommand.autocomplete(interaction);
			return;
		} else if (interaction.isChatInputCommand()) {
            try {
                selectedCommand.execute(interaction);
            } catch(error) {
                this.handle_error(interaction, error);
            }
        }
    }

    async changeLanguage(language:DISCORD_LANGUAGE) {
        this.i18n = i18n(language);
        console.log("MuppetsClient language has been changed...");
    }

    public AddQuoteSelector = AddQuoteSelector;
    public i18n_build = i18n_build;
}