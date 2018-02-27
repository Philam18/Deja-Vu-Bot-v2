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
  for (let item of client.guilds){
    var id =  item[0];
    var name = item[1].name;
    console.log(`[${id}] ${name}`);
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
  if(
    message.content === '!stop' ||
    /^(\!play )/i.exec(message.content)
  ){
    // -------- PRINT OUT MESSAGE ---------
    console.log('[CLIENT] Message Received:');
    console.log(` ${message.author.username}: ${message.content}`);
    console.log('-------------------------------------------------------------------------');
    musicPlayer.command(message);
    return;
  }

  //Clear/Wipe history
  if(message.content === '!clear'){
    console.log("[CLIENT] Clearing chat history...");
    var channel = message.channel;
    var response = new Discord.RichEmbed()
    .setTimestamp(message.createdAt)
    .setFooter(`${message.author.username}  ${message.content}`,message.author.avatarURL);
    var botUser = channel.members.find((val)=>val.id == client.user.id);
    var missingPermissions = botUser.missingPermissions(REQUIRED_PERMISSIONS);
    if(missingPermissions.length > 0){
      console.log(`[CLIENT] Missing permissions: ${missingPermissions}`);
      response.setColor(RED);
      response.setTitle(`${client.user.username} is missing permissions!`);
      response.setDescription(`Go to https://discordapi.com/permissions.html to grant permissions.\n Enter \`415324652043239426\` as the Client ID`);
      response.addField(`Missing:`, `${missingPermissions}`);
      response.addField(`Required:`, `${REQUIRED_PERMISSIONS}\n`);
      channel.send(response);
      return;
    }
    clearMessages(channel,response,(res)=>{
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
      return;
    }else{
      console.log(null);
    }
  }

  function clearMessages(channel,response,callback){
    channel.fetchMessages({limit:100})
    .catch(error=>{
      console.log('0 ' + error.message);
      response.setColor(RED);
      response.setDescription(error.message);
      callback(response);
      return;
    })
    .then(messages => {
      if(messages.size === 0){
        console.log('[CLIENT] Done clearing chat!');
        response.setColor(GREEN);
        response.setDescription(`Cleaned up chat in **${channel.name}**`);
        callback(response);
        return;
      }
      channel.bulkDelete(messages,{filterOld:false}).catch(error=>{
        console.log('1 ' + error.message);
        response.setColor(RED);
        response.setDescription(error.message);
        callback(response);
        return;
      })
      .then(()=>{
        clearMessages(channel, response,callback);
      });
    });
  }


});
