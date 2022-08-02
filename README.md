# 🤖 ℝ[X] Discord BOT

It is a Discord BOT for a special guild. Features will come with inspiration.

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
