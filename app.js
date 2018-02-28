//REQUIRE's INSTALLATION OF FFMPEG
require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const MusicPlayer = require('./MusicPlayer');
const musicPlayer = new MusicPlayer(this.client);
const BOT_TOKEN = process.env.BOT_TOKEN;
//HEX COLORS
const RED = 0xd10000;
const GREEN = 0x00c939;
const YELLOW = 0xe5c300;
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
MessageEvent listener
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
  if(
    message.content === '!stop' ||
    /^(\!play )/i.exec(message.content) ||
    message.content === '!queue'
  ){
    // -------- PRINT OUT MESSAGE ---------
    musicPlayer.command(message);
    return;
  }
  //Clear/Wipe history
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
      // channel.send(res);
      channel.send(res);
    });
  }

  // -------- DEBUGGING --------
  if(message.content === '!test1'){
    message.channel.send(`[Test] My voice channel is **${musicPlayer.getChannelName()}**`);
    message.delete();
  }
  if(message.content === '!test2'){
    message.channel.send(
      {
        embed: {
          color: 0xf44242,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: "This is an embed",
          url: "http://google.com",
          description: "Video: https://www.youtube.com/watch?v=OoI57NeMwCc",
          fields: [{
              name: "Fields",
              value: "They can have different fields with small headlines."
            },
            {
              name: "Masked links",
              value: "You can put [masked links](http://google.com) inside of rich embeds."
            },
            {
              name: "Markdown",
              value: "You can put all the *usual* **__Markdown__** inside of them."
            }
          ],
          timestamp: new Date(),
          footer: {
            icon_url: client.user.avatarURL,
            text: "Type `!help` for a list of commands"
          }
        }
      }
    );
  }
  if(message.content === '!test3'){
    message.channel.send({
      embed: {
        color: GREEN,
        fields : []
      }
    });
  }
  if(message.content === '!test4'){
    var obj = musicPlayer.connection;
    if(obj){
      console.log(musicPlayer.connection.dispatcher.stream);
      console.log('-------------------------------------------------------------------------');
      return;
    }else{
      console.log(null);
    }
  }
  if(message.content === '!test5'){
    musicPlayer.connection.dispatcher.end();
  }

  /**
  NOTE: as of Jan 12 2017, the  discord API has been limited to a maximum deletion
  history range of TWO WEEKS (See: https://github.com/discordapp/discord-api-docs/issues/208)
  **/
  function clearMessages(channel,response,callback){
    channel.fetchMessages({limit:100})
    .then(messages => {
      //Base case: If no more messages to delete, return with callback
      if(messages.size === 0){
        console.log('[CLIENT] Cleared chat!');
        console.log('-------------------------------------------------------------------------');
        response.setColor(GREEN);
        response.setTitle(`Cleaned up chat fully in **${channel.name}**`);
        response.setDescription('**Note**: can only delete messages younger than two weeks');
        callback(response);
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
        response.setDescription('**Note**: can only delete messages younger than two weeks');
        callback(response);
        return;
      }

    })
    .catch(error=>{
      console.log('[CLIENT] Error1 Fetching messages: ' + error.message);
      console.log('-------------------------------------------------------------------------');
      response.setColor(RED);
      response.setTitle('Error while fetching messages');
      response.setDescription(error.message);
      callback(response);
      return;
    });
  }
});

client.on('warn', (message)=>{
  console.log('[CLIENT] Warning: ' + message);
});
