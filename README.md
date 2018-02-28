# Deja-Vu-Bot (v2)  
A successor to the Deja-Vu-Player Discord bot built on Java, before the repository was lost.
Deja-Vu-Bot-v2 is build on Node.js using the Discord API for Javascript [`discord.js`](https://github.com/discordjs/discord.js) and YouTube streaming module [`ytdl-core`](https://github.com/fent/node-ytdl-core).
(Support for other content services may come later...)

## Installation

### Setting up repository
You will need Node.js 9.x and NPM 5.x. 
To grab the latest Node.js/NPM through PPA (I'm following [this guide](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/#)):
###### Pick A) PPA for current release
```
sudo apt-get update
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
```  
###### or B) For LTS release 
```
sudo apt-get update
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
```  
###### Then install Node.js and NPM 
```
sudo apt-get install nodejs
```
![alt text](https://i.imgur.com/VwHCfaR.png "version check")

###### Clone the repository and install dependencies
```
git clone https://github.com/Philam18/Deja-Vu-Bot-v2.git
cd Deja-Vu-Bot-v2
npm install
```
### Creating a new Discord app
Your bot will need to be added to the guild (aka. server). To do this you must first be logged on to the 
[Discord web client](https://discordapp.com/login). After logging in, proceed to the [Discord API dpcs page]
(https://discordapp.com/developers/docs/intro), and under **Applications** on the upper-left, click **My Apps**,
then click **New App** to add an application.  

> ![alt text](https://i.imgur.com/VoqdQKf.png "Creation screen")  
> Feel free to name the new bot whatever you like**- this will be the name that appears in your server.

> ![alt text](https://i.imgur.com/uxLIV2Z.png "Client ID is necessary for later")  
> Keep note of your Client ID for later  

Scroll down to the section **Bot** to convert the application to a Bot-user; this will produce a prompt-  
click **Yes, do it!**. After the bot user is created, click and **reveal the token**.

> ![alt text](https://i.imgur.com/t12MwPr.png "And the bot was born!")  
> **NOTE**: bot tokens are secret- they should never be publicly disclosed!  

#### Keep note of your bot token for later  
You will need this bot token to authenticate your bot-client

### Adding the bot to the server
(_Note: you should still be logged in for this step_)
Head to the [Discord Permissions calculator](https://discordapi.com/permissions.html).
The bot requires the following permissions:
- Read messages
- Read message history 
- Send messages
- Manage messages
- View Channel
- Connect
- Speak
- Use Voice Activity (optional)
Check off these permissions, and enter your **Client ID** into the field. Then click the **Link**.
Alternatively, you can copy this link into your browser and place your Client ID inside:  
_https://discordapp.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=36776960_

> You can add the bot to any server you would like
> ![alt text](https://i.imgur.com/t12MwPr.png "And the bot was born!")

### Setting environment variables
Inside your cloned repository, create a file `.env` and add the line of text  
```
BOT_TOKEN=<PLACE YOUR BOT TOKEN HERE>
```
### Adding the bot to the server















