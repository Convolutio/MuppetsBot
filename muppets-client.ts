import { Collection, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js"
import { CharacterService } from "./classes/characterService"
import { AsyncBuiltCommand, AsyncBuiltCommandMethods } from "./models/command.type";
import { AddQuoteSelector } from "./classes/selectors";
import path from 'node:path';
import fs from 'node:fs';
import { token, clientId, guildId } from "./config.json";
import {TFunction} from 'i18next';
import { i18n } from "./i18n/i18n";
export class MuppetsClient {
    public characterService = new CharacterService(this);
    public i18n!:TFunction;
    private commands_ids:string[]=[];
    private rest=(new REST({version:'10'})).setToken(token);

    constructor(language?:string) {
        this.i18n = i18n(language);
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

    async getCommandsCollection():Promise<Collection<string, AsyncBuiltCommand>> {
        const commands = new Collection<string, AsyncBuiltCommand>();
        await this.deployCommands();
        await Promise.all(this.getCommandsObjs().map(async command => {
            const name = (await command.buildData()).name;
            commands.set(name, command); 
        }));
        return commands;
    }

    async changeLanguage(language:string) {
        console.log("Changing MuppetsClient language...");
        Promise.all(this.commands_ids.map(async command_id => {
            await this.rest.delete(Routes.applicationGuildCommand(clientId, guildId, command_id))
        }));
        this.i18n = i18n(language);
        await this.deployCommands();
    }

    public AddQuoteSelector = AddQuoteSelector;
}