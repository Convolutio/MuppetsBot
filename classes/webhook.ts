import { Client, TextChannel, Webhook } from 'discord.js';
import fs from 'node:fs';
import configs from '../config.json';
import { Character } from '../models/character';
import { CharacterService } from './characterService';

function editWHKConfigs (whk:{id:string; token:string}) {
    const content = configs;
    content.webhook = whk;
    fs.writeFileSync('../config.json', JSON.stringify(content));
}

export class MyWebhook {
    //Please use init asynchronous method to init the webhook;
    private webhook!:Webhook;
    private currentCharacter!:Character;

    constructor() {
    }

    async init(client:Client):Promise<void> {
        if (configs.webhook.id && configs.webhook.token) {
            const whk = await client.fetchWebhook(configs.webhook.id, configs.webhook.token);
            this.webhook = whk;
            const character = await (new CharacterService()).getCharacterWithName(whk.name);
            character? this.currentCharacter=character : this.currentCharacter={name:whk.name, avatar:whk.avatar}
        } else {
            throw "You must specify webhook's data in 'config.json' file."
        }
    }
    private async changeChannel(channel:TextChannel) {
        try {
            await this.webhook.edit({
                channel:channel
            });
        } catch(error) {
            console.error(error);
        }
    }
    private async changeCharacter(character:Character) {
        try {
            await this.webhook.edit({
                name:character.name,
                avatar:character.avatar
            });
        } catch(error) {
            console.error(error);
        }
    }
    async speak(message:string, character:Character, channel:TextChannel): Promise<void> {
        //Makes the mentionned character speak in the specified channel
        try {
            if (this.webhook.channelId!=channel.id) {
                await this.changeChannel(channel);
            }
            if (this.currentCharacter.name != character.name) {
                await this.changeCharacter(character);
            }
            await this.webhook.send(message);
        } catch(error) {
            throw error;
        }
    }
}