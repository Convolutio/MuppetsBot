# 🤖 ℝ[X] Discord BOT

It is a Discord BOT for a special guild. Features will come with inspiration.

## Config

You must create a webhook in your server.
You must then create a `config.json` file following this schema:

```json
{
    "token":"<Your bot token>",
    "clientId":"<Your application id>",
    "guildId":"<The id of the single guild where the bot will run>",
    "commandToDelete_id":"", //Let "" if you don't need it
    "webhook": {
        "id":"<webhook's id>",
        "token":"<webhook's token>"
    }
}
```

## ts-node

### Run the bot

```bash
ts-node index.ts
```

### Register commands to the guild

Program the commands with the required syntax in the `./commands` folder, then set the concerned guild's id
in the `config.json` file and then run the `deploy-command.ts` file :

```bash
::In the repository folder
ts-node deploy-command.ts
```

### Delete a command from the guild

Execute the `delete-command.ts` file (_to develop_)
