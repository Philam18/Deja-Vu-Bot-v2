//REQUIRE's INSTALLATION OF FFMPEG
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const MusicPlayer = require('./MusicPlayer');
const musicPlayer = new MusicPlayer();
const BOT_TOKEN = process.env.BOT_TOKEN;
//HEX COLORS
const RED = 0xd10000;
const GREEN = 0x00c939;
const YELLOW = 0xe5c300;
//Regular Expressions
const REGEX_PLAY = /^(\!play )/i;
//BOT PERMISSIONS
const REQUIRED_PERMISSIONS = [
  'VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS',
  'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK', 'USE_VAD'
];

/**
-----------------------------------------------------------------------
Connect the bot to the client
-----------------------------------------------------------------------
**/
client.login(BOT_TOKEN);
/**
-----------------------------------------------------------------------
Confirm established connection
-----------------------------------------------------------------------
**/
client.on('ready', ()=>{
  console.log(`${client.user.tag} online!`);
  console.log('----------------------[Bot Servers]----------------------');
  for (let guild of client.guilds){
    console.log(`[${guild[0]}] ${guild[1]}`);
  }
  console.log('----------------------------------------------------------');
  console.log('[START] Listening....');
});

/**
-----------------------------------------------------------------------
MAIN Event listener (message events)
-----------------------------------------------------------------------
**/
client.on('message',(message)=>{
  //Ignore bot messages & DM messages
  if(message.author.bot ||message.channel.type === 'dm') return;
  //If message is stop, or play, send to musicPlayer
  console.log('-------------------------------------------------------------------------');
  console.log('[CLIENT] Message Received:');
  console.log(`   User: ${message.author.username}`);
  console.log(`   Text: ${message.content}`);

  // Music player commands
  if(
    message.content === '!stop' ||          //Command is !stop
    REGEX_PLAY.exec(message.content) ||     //Command is !play <url>
    message.content === '!queue' ||         //Command is !queue
    message.content === '!skip'             //Command is !skip
  ){
    // -------- PRINT OUT MESSAGE ---------
    musicPlayer.command(message);
    return;
  }

  // Wipe Chat history (usually for cleaning up test servers)
  if(message.content === '!clear'){
    var channel = message.channel;
    var response = new Discord.RichEmbed()
    .setTimestamp(message.createdAt)
    .setFooter(`${message.author.username}  ${message.content}`,message.author.avatarURL);
    var botUser = channel.members.find((val)=>val.id == client.user.id);
    var missingPermissions = botUser.missingPermissions(REQUIRED_PERMISSIONS);
    if(missingPermissions.length > 0){
      console.log(`[CLIENT] Can't clear chat- missing permissions: ${missingPermissions}`);
      response.setColor(RED);
      response.setTitle(`${client.user.username} is missing permissions!`);
      var text = "Go to https://discordapi.com/permissions.html to grant permissions.\n";
      text += " Enter \`415324652043239426\` as the Client ID";
      response.setDescription(text);
      response.addField(`Missing:`, `${missingPermissions}`);
      response.addField(`Required:`, `${REQUIRED_PERMISSIONS}\n`);
      channel.send(response);
      return;
    }
    clearMessages(channel,response,(res)=>{
      channel.send(res);
    });
  }
  //Kills the bot: kills connection and destroys client
  if(message.content === "!kill"){
    var response = new Discord.RichEmbed()
    .setTimestamp(message.createdAt)
    .setFooter(`${message.author.username}: ${message.content}`,message.author.avatarURL)
    .setColor(YELLOW)
    .setTitle("Killed process")
    .setDescription("Goodbye!");
    message.channel.send(response).then(()=>{
      message.delete().then(()=>{
        client.destroy().then(()=>{
          process.exit();
        });
      });
    });
  }

  // -------- DEBUGGING --------


});

/**
-----------------------------------------------------------------------
SYSTEM EVENT listeners
-----------------------------------------------------------------------
**/
client.on('warn', (message)=>{
  console.log('[CLIENT] Warning: ' + message);
});
client.on('error', (error)=>{
  console.log('[CLIENT] Error: ' + error.mesage);
});
client.on('reconnecting', ()=>{
  console.log('[CLIENT] Reconnecting...');
});
/**
-----------------------------------------------------------------------
AUXILLIARY FUNCTIONS
-----------------------------------------------------------------------
**/
function clearMessages(channel,response,callback){
  /**
  NOTE: as of Jan 12 2017, the  discord API has been limited to a maximum deletion
  history range of TWO WEEKS (See: https://github.com/discordapp/discord-api-docs/issues/208)
  **/
  channel.fetchMessages({limit:100})
  .then(messages => {
    //Base case: If no more messages to delete, return with callback
    if(messages.size === 0){
      console.log('[CLIENT] Cleared chat!');
      console.log('-------------------------------------------------------------------------');
      response.setColor(GREEN);
      response.setTitle(`Cleaned up chat fully in **${channel.name}**`);
      response.setDescription('**Note**: can only delete messages younger than two weeks');
      if(callback) callback(response);
      return;
    }
    try{
      //Recursive case: If there are still more messages, delete them
      channel.bulkDelete(messages,{filterOld:false}).then(()=>{
        clearMessages(channel, response,callback);
      });
    }catch(error){
      console.log('[CLIENT] Cant clean anymore');
      console.log('-------------------------------------------------------------------------');
      response.setColor(GREEN);
      response.setTitle(`Cleaned up chat in **${channel.name}**`);
      response.setDescription('**Note**: can only delete messages within two weeks');
      if(callback) callback(response);
      return;
    }

  })
  .catch(error=>{
    console.log('[CLIENT] Error Fetching messages: ' + error.message);
    console.log('-------------------------------------------------------------------------');
    response.setColor(RED);
    response.setTitle('Error while fetching messages');
    response.setDescription(error.message);
    if(callback) callback(response);
    return;
  });
}
