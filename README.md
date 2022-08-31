# 🤖🎭 Discord Muppets Bot

Language: ![TypeScript](https://img.shields.io/badge/TypeScript-black?style=flat&logo=typescript)

This is a set of commands enabling your Discord bot to create custom characters in a guild and make them tell custom speeches, defined by users.

## List of commands and features demonstration

![Commands List](./assets/commands_screenshot.png)

## ⚙Config

Your bot must have the following scopes in the guild :

- `bot`, with the permissions below :
  - Manage Webhooks
  - Send Messages
- `application.commands`

First and foremost, run `npm install` in the repository's root directory.

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

**⚠In javascript :** if you want to compil the typescript project, you must place the database in the built folder. If the database isn't initiated yet, you therefore can run the `utils/init_db.js` script to do that.

## Run the BOT

### ts-node

If you want your bot to just use the commands in this repository, executing the `index.ts` will carry out the job :

```bash
ts-node index.ts
```

### 🧩Incorporating these features in your bot

If you're developing your own typescript or javascript Discord Bot and want to add the Muppets Bot features to your bot's ones, the `index.ts` file describes an example of easy use, but we can sum the methodology up with these instructions :

> I advise to fork the repository in a folder in your project repository. Here is an example of project structure :  
>
> ```bash
> BotProject/
>    main.ts
>    Muppets Bot/
>       muppets-client.ts
>       ...
>    ...
> ```
>
> Then, you should once get the commands with this code and make them run like this, thanks to the `getCommandsCollection()` asynchronous method the `MuppetsClient` class provides :
>
> ```ts
> //For instance, in the main.ts file
> import { MuppetsClient } from './Muppets Bot/muppets-client';
>
> async () => {
>    const muppetsClientCommands = await (new MuppetsClient()).getCommandsCollection();
>    //You can here import your own commands
>    client.on('interactionCreate', async (i:Interaction) => {
>       const selectedMuppetCommand = muppetsClientCommands.get(i.commandName);
>       await selectedMuppetCommand?.execute(i);
>       //Here you can execute your own commands in addition to the muppetsClient's ones
>    });
> }
> ```

_Please be aware the commands are built and deployed (and even deployed again, sometimes) asynchronously, in addition to be executed in this way. Moreover, the collection contains all commands with an `AsyncBuiltCommand` type I've developed to cleanly use the `MuppetsClient` internal properties. This is why the internal code is quite far from the conventional Discord Bot js and ts programs and you should follow the instructions I've described above. The `MuppetClient` in the `muppet-client.ts` main file has therefore been designed to be easily used in any other Discord projects, like as an extension._

### Delete a command from the guild

This is a manual task (normally useless) which can be carried out by executing the `delete-command.ts` file after having set the `config.json` file with the command id.

## 🌐Internationalization

![Commands List](./assets/internationalization_demo.png)

All the commands names, descriptions, logs and options are translatable in other languages. To display another language than english, you must specify the language as a `MuppetsClient` constructor's argument. There is also an asynchronous `changeLanguage` method to change the language to be displayed (be free to call it whenever you want, for instance in a command changing your bot's language).

```ts
//if nothing is specified, English will be chosen
const muppetsClient = new MuppetsClient('fr');
//...
await muppetsClient.changeLanguage('en');
```

### Supported languages

Just french (`"fr"` option) and english (`"en"` option) is here supported, but adding other languages is quite easy :

1. In the repository's `/i18n` folder, duplicate the `/en` folder and rename it with the abbreviation of the language you want to add.
2. Then, overwrite each value of `translation.json` file with the sentences in the language to be added (I advise to be careful to keep interpolation in the sentences, if it is present).
