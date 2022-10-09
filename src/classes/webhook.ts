import { APIInteractionDataResolvedGuildMember, APIRole, Attachment, AttachmentBuilder, BufferResolvable, Client, GuildMember, Message, NewsChannel, Role, TextBasedChannel, TextChannel, User, Webhook } from 'discord.js';
import { Character } from '../models/character.type';
import { CharacterService } from './characterService';
import {clientId} from "../../config.json"

type Mentionable = NonNullable<GuildMember | User | APIInteractionDataResolvedGuildMember | Role | APIRole | null | undefined>;
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
        await this.checkWebhookToMove(channel);
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

    private async checkWebhookToMove(channel:TextChannel|NewsChannel) {
        const channelWebhooks = (await channel.fetchWebhooks()).filter(hook => {
            return (hook.applicationId===clientId && hook.id != this.webhook.id)
        })
        if (channelWebhooks.size===9) {
            const randomWebhook = channelWebhooks.random();
            if (randomWebhook) {
                let randomChannel:TextChannel|NewsChannel|undefined=undefined;
                let i:number = 0;
                const guildChannels = channel.guild.channels.cache.map(c => c);
                while (!randomChannel && i<guildChannels.length) {
                    const thechannel = guildChannels[i];
                    if (
                        thechannel.isTextBased() &&
                        !(thechannel.isDMBased() || thechannel.isThread() || thechannel.isVoiceBased())
                        && thechannel.id !== channel.id
                    ) {
                        if ((await thechannel.fetchWebhooks()).size < 9) {
                            randomChannel = thechannel;
                        }
                    }
                    i++;
                }
                if (!randomChannel) throw "Random text or news channel not found";
                await randomWebhook.edit({channel:randomChannel});
            }
        }
    }

    private async changeChannel(channel:TextBasedChannel):Promise<void> {
        if (channel.isDMBased() || channel.isThread() || channel.isVoiceBased()) 
            throw "Cannot use webhook in this kind of channel";
        await this.checkWebhookToMove(channel);
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
    async speak(message:string, channel:TextBasedChannel, attachments:BufferResolvable[]):Promise<Message> {
        if (!this.isInitiated) throw "The MyWebhook instance hasn't been initiated.";
        //Makes the character linked to the webhook speak in the specified channel
        if (this.webhook.channelId!=channel.id) {
            await this.changeChannel(channel);
        }
        if (attachments.length>0) {
            return await this.webhook.send({content:message, files:attachments});
        } else {
            return await this.webhook.send(message);
        }
    }
}