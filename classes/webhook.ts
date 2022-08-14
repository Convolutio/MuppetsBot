import { BufferResolvable, Client, TextBasedChannel, Webhook } from 'discord.js';
import { Character } from '../models/character';
import { CharacterService } from './characterService';

export class MyWebhook {
    //Please use init asynchronous method to init the webhook;
    private webhook!:Webhook;
    private currentCharacter!:Character;
    private isInitiated=false;

    constructor(private characterService:CharacterService){}

    async init(client:Client, characterName:string):Promise<void> {
        //Init the MyWebhook instance corresponding to the specified character.
        this.currentCharacter=await this.characterService.getCharacterWithName(characterName);
        this.webhook=await client.fetchWebhook(this.currentCharacter.webhook_data.id, this.currentCharacter.webhook_data.token);
        if (this.webhook.name!==this.currentCharacter.name) {
            await this.editWebhook({name:this.currentCharacter.name});
        }
        this.isInitiated=true;
    }
    async create(channel:TextBasedChannel, character:{name:string, avatar:BufferResolvable}):Promise<void> {
        //Create a new Webhook for the character to create, and add this new character to the database
        if (channel.isDMBased()||channel.isThread()||channel.isVoiceBased())
            throw "Cannot create a webhook outside a text/news channel. Please run this command in another channel.";
        this.webhook = await channel.createWebhook({...character, reason:"Adding of a new character in the guild."});
        if (this.webhook.token) {
            this.currentCharacter = {...character, webhook_data:{id:this.webhook.id, token:this.webhook.token}}
            await this.characterService.addCharacter(this.currentCharacter);
            this.isInitiated=true;
        } else {
            throw 'Fail in webhook creation : The created webhook\'s token is unavailable.'
        }
    }
    async delete() {
        if (!this.isInitiated) throw "The MyWebhook instance hasn't been initiated";
        await this.characterService.deleteCharacter(this.webhook.name);
        await this.webhook.delete();
    }
    private async changeChannel(channel:TextBasedChannel):Promise<void> {
        if (channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) 
            throw "Cannot use webhook in this kind of channel";
        await this.webhook.edit({channel:channel});
    }
    private async editWebhook(character:{name?:string, avatar?:BufferResolvable}) {
        const newName:string = character.name?character.name:this.webhook.name;
        let newAvatar:BufferResolvable|null = this.webhook.avatarURL();
        if (character.avatar) {
            newAvatar = character.avatar;
        }
        try {
            await this.webhook.edit({
                name:newName,
                avatar:newAvatar
            });
        } catch (error) {console.error(error); throw error}
    }
    async editCharacter(character:{name?:string, avatar?:BufferResolvable}) {
        if (!this.isInitiated) throw "The MyWebhook instance hasn't been initiated";
        await this.editWebhook(character);
        if (character.name) {
            await this.characterService.editCharacterName(this.webhook.id, character.name);
        }
    }
    async speak(message:string, channel:TextBasedChannel): Promise<void> {
        if (!this.isInitiated) throw "The MyWebhook instance hasn't been initiated.";
        //Makes the character linked to the webhook speak in the specified channel
        if (this.webhook.channelId!=channel.id) {
            await this.changeChannel(channel);
        }
        await this.webhook.send(message);
    }
}