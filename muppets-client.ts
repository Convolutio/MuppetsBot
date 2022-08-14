import { Collection, REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js"
import { CharacterService } from "./classes/characterService"
import { AsyncBuiltCommand, AsyncBuiltCommandMethods } from "./models/command.type";
import { AddQuoteSelector } from "./classes/selectors";
import path from 'node:path';
import fs from 'node:fs';
import { token, clientId, guildId } from "./config.json";

export class MuppetsClient {
    characterService = new CharacterService(this);

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
        const rest = new REST({version:"10"}).setToken(token);
        const commandsJSONData:RESTPostAPIApplicationCommandsJSONBody[] = [];
        try {
            console.log(`     Requiring commands' data...`);
            const commands = this.getCommandsObjs();
            for (let command of commands) {
                const data = await (command.buildData)();
                commandsJSONData.push(data.toJSON());
            }
            console.log(`     Started refreshing application (/) commands in ${guildId} guild.`);
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commandsJSONData}
            );
            console.log("     Successfuly reloaded application (/) commands in this server.")
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

    AddQuoteSelector = AddQuoteSelector;
}