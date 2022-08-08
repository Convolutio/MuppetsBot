# 🤖 ℝ[X] Discord BOT

It is a Discord BOT for a special guild. Features will come with inspiration.

## Config

You must create in the repository's root directory a `config.json` file following this schema:

```json
{
    "token":"<Your bot token>",
    "clientId":"<Your application id>",
    "guildId":"<The id of the single guild where the bot will run>",
    "commandToDelete_id":"", //Let "" if you don't need it
}
```

You also must create an sqlite `database.db` file, just by once executing the `utils/init_db.ts` file.

```bash
ts-node utils/init_db.ts
```

## ts-node

### Run the bot

```bash
ts-node index.ts
```

### Delete a command from the guild

This is a manual task which can be carried out by executing the `delete-command.ts` file
