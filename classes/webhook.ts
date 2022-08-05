import { BufferResolvable, Client, TextChannel, Webhook } from 'discord.js';
import { Character } from '../models/character';
import { CharacterService } from './characterService';

export class MyWebhook {
    //Please use init asynchronous method to init the webhook;
    private webhook!:Webhook;
    private characterService=new CharacterService();
    private currentCharacter!:Character;
    private isInitiated=false;

    async init(client:Client, characterName:string):Promise<void> {
        //Init the MyWebhook instance corresponding to the specified character.
        this.currentCharacter=await this.characterService.getCharacterWithName(characterName);
        this.webhook=await client.fetchWebhook(this.currentCharacter.webhook_data.id, this.currentCharacter.webhook_data.token);
        if (this.webhook.name!==this.currentCharacter.name) {
            await this.editWebhook(this.currentCharacter);
        }
        this.isInitiated=true;
    }
    async create(channel:TextChannel, character:{name:string, avatar:BufferResolvable}):Promise<void> {
        //Create a new Webhook for the character to create, and add this new character to the database
        this.webhook = await channel.createWebhook({...character, reason:"Adding of a new character in the guild."});
        if (this.webhook.token) {
            this.currentCharacter = {...character, webhook_data:{id:this.webhook.id, token:this.webhook.token}}
            await this.characterService.addCharacter(this.currentCharacter);
            this.isInitiated=true;
        } else {
            throw 'Fail in webhook creation : The created webhook\'s token is unavailable.'
        }
    }
    private async changeChannel(channel:TextChannel):Promise<void> {
        await this.webhook.edit({channel:channel});
    }
    private async editWebhook(character:{name:string, avatar:BufferResolvable}) {
        await this.webhook.edit({
            name:character.name,
            avatar:character.avatar
        });
    }
    async editCharacter(character:{name:string, avatar:BufferResolvable}) {
        await this.editWebhook(character);
    }
    async speak(message:string, channel:TextChannel): Promise<void> {
        if (!this.isInitiated) throw "The MyWebhook hasn't been initiated.";
        //Makes the character linked to the webhook speak in the specified channel
        if (this.webhook.channelId!=channel.id) {
            await this.changeChannel(channel);
        }
        await this.webhook.send(message);
    }
}