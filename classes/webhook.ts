import { Client, enableValidators, TextChannel, Webhook } from 'discord.js';
import fs from 'node:fs';
import configs from '../config.json';

function editWHKConfigs (whk:{id:string; token:string}) {
    const content = configs;
    content.webhook = whk;
    fs.writeFileSync('../config.json', JSON.stringify(content));
}

export class MyWebhook {
    private webhook!:Webhook;

    constructor(client:Client) {
        if (configs.webhook.id && configs.webhook.token) {
            client.fetchWebhook(configs.webhook.id, configs.webhook.token)
                .then(whk => this.webhook = whk)
                .catch(error => console.error(error))
        } else {
            console.error("You must specify webhook's data in 'config.json' file.")
        }
    }
}