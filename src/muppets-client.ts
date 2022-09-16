import { ChatInputCommandInteraction, Collection, Interaction, REST, RESTPostAPIApplicationCommandsJSONBody, Routes, SelectMenuInteraction, time } from "discord.js"
import { CharacterService } from "./classes/characterService"
import { AsyncBuiltCommand, AsyncBuiltCommandMethods } from "./models/command.type";
import { AddQuoteSelector, characterAutocomplete } from "./classes/selectors";
import path from 'node:path';
import fs from 'node:fs';
import { token, clientId, guildId } from "../config.json";
import {TFunction} from 'i18next';
import { i18n_build, i18n } from "./i18n/i18n";
import { DISCORD_LANGUAGE } from "./models/translation.type";
import { setTimeout } from "node:timers/promises";
export class MuppetsClient {
    private MAX_USAGE = 5;
    private TIME_BEFORE_FREE_USAGE = 12*3600*1000;
    public characterService = new CharacterService(this);
    public i18n!:TFunction;
    private commands_ids:string[]=[];
    private rest=(new REST({version:'10'})).setToken(token);
    private commands!:Collection<string, AsyncBuiltCommand>;
    private usages:{[userId:string]:{usages:number, reinitDate:Date}}={};
    private happyHour=false;

    constructor(language?:DISCORD_LANGUAGE) {
        this.i18n = i18n(language);
    }

    private async handle_error(interaction:ChatInputCommandInteraction, error:any) {
        let rep:string = `An error has occured when executing this command:\n\`\`\`${error}\`\`\``;
        if (typeof error === "object" && error.name && error.name === "muppetsClientError") {
            rep = error.message;
        }
        if (interaction.replied||interaction.deferred) {
            const msg = await interaction.editReply(rep)
            if (!interaction.ephemeral) {
                await setTimeout(5500);
                await msg.delete();
            }   
        } else {
            await interaction.reply({content:rep, ephemeral:true})
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

    private async deployCommands() {
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

    checkMemberUsages(interaction:ChatInputCommandInteraction):void {
        const userId = interaction.user.id;
        if (!this.happyHour
            &&this.usages[userId]
            &&this.usages[userId].usages===this.MAX_USAGE)
            throw {
                name:"muppetsClientError",
                message:this.i18n("usageLimit_error").replace('{{date}}', time(this.usages[userId].reinitDate))
            };
    }

    setHappyHour():boolean {
        this.happyHour = !this.happyHour;
        return this.happyHour;
    }

    private async displayUsages(userId:string, interaction:ChatInputCommandInteraction):Promise<void> {
        const usages = this.usages[userId].usages;
        const date = time(this.usages[userId].reinitDate)
        const additionalMessage = '\n\n' + ((this.happyHour)?`:partying_face: Happy Hour! :confetti_ball:`:`(\`${usages}/${this.MAX_USAGE}\` ; ${date})`);
        await interaction.editReply({content:(await interaction.fetchReply()).content+additionalMessage})
    }

    private async waitToFreeUsage(userId:string):Promise<void> {
        await setTimeout(this.TIME_BEFORE_FREE_USAGE);
        this.usages[userId].usages=0;
    }
    
    async addMemberUsage(interaction:ChatInputCommandInteraction):Promise<void> {
        const userId = interaction.user.id;
        if (this.happyHour) {

        } else if (!this.usages[userId]||this.usages[userId].usages===0) {
            this.usages[userId] = {usages:1, reinitDate: new Date(Date.now()+this.TIME_BEFORE_FREE_USAGE+60*1000)};
            this.waitToFreeUsage(userId);
        } else if (this.usages[userId].usages<this.MAX_USAGE){
            this.usages[userId].usages++;
        }
        this.displayUsages(userId, interaction);
    }

    async treat(interaction:Interaction) {
        if (!(interaction.isChatInputCommand()||interaction.isAutocomplete())) return;
		const selectedCommand = this.commands.get(interaction.commandName);
        if (!selectedCommand) return;
		if (interaction.isAutocomplete() && selectedCommand.autocomplete) {
			selectedCommand.autocomplete(interaction);
		} else if (interaction.isChatInputCommand()) {
            try {
                await selectedCommand.execute(interaction);
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
    public characterAutocomplete = characterAutocomplete;
    public i18n_build = i18n_build;
}