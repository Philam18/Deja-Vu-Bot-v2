const Discord = require('discord.js');
const ytdl = require('ytdl-core');
//HEX COLORS
const RED = 0xd10000;
const GREEN = 0x00c939;
const YELLOW = 0xe5c300;

class MusicPlayer{
  constructor(client){
    this.client = client;
    this.connection = null;
    this.musicQueue = [];
    this.nowPlaying = {};
  }

  command(message){
    var voiceChannel = message.member.voiceChannel;
    var textChannel = message.channel;
    //Embed response template
    var response = new Discord.RichEmbed()
    .setTimestamp(message.createdAt)
    .setFooter(`${message.author.username}  ${message.content}`,message.author.avatarURL);

    //-----------------------------------------------------------------------
    if(message.content ==='!start'){
      if (voiceChannel == null){
        console.log(`${message.author.username} is not in a voice channel`);
        response.setColor(RED);
        response.setDescription(`**${message.author.username}** is not in a voice channel.`);
        textChannel.send(response);
        message.delete();
        return;
      }
      this.connectToVoiceChannel(voiceChannel);
      console.log("Connected to voice channel");
      response.setColor(GREEN);
      response.setDescription(`Joined **${voiceChannel.name}**`);
      textChannel.send(response);
      message.delete();
      return;
    }
    //-----------------------------------------------------------------------
    if(message.content === '!stop'){
      if(this.connection != null){
        response.setColor(GREEN);
        response.setDescription(`Stopped`);
        this.disconnectVoiceChannel();
        textChannel.send(response);
        message.delete();
      }else{
        response.setColor(RED);
        response.setDescription(`Already stopped.`);
        textChannel.send(response);
        message.delete();
      }
    }
    //-----------------------------------------------------------------------
    if(/^(\!play )/i.exec(message.content)){
      if(voiceChannel == null){
        console.log(`${message.author.username} is not in a voice channel`);
        response.setColor(RED);
        response.setDescription(`**${message.author.username}** is not in a voice channel.`);
        textChannel.send(response);
        message.delete();
        return;
      }
      var url = message.content.replace(/^(\!play )/i,'');
      console.log(`Connected to voice channel ${voiceChannel.name}`);
      this.connectToVoiceChannel(voiceChannel,connection=>{
        this.play(url,response,(res)=>{
          textChannel.send(res);
          message.delete();
        });
      });
      return;
    }
    //-----------------------------------------------------------------------

    //-------------------   END   ----------------------
  }

  connectToVoiceChannel(voiceChannel, callback){
    voiceChannel.join().then(connection=>{
      this.connection = connection;
      if(callback) callback(connection);
    });
  }

  disconnectVoiceChannel(){
    this.connection.channel.leave();
    this.connection = null;
  }

  getChannelName(){
    if(this.connection != null) return this.connection.channel.name;
    return null;
  }

  play(url,response,callback){
    ytdl.getInfo(url,(error, info)=>{
      if(error){
        console.log(error.message);
        response.setColor(RED);
        response.setTitle(error.message);
        callback(response);
        return;
      }
      var song = {
        title:info.title,
        artist:info.author.name,
        thumbnail:info.thumbnail_url,
        url: url
      }
      for(let i = 0; i < this.musicQueue.length;i++){
        var item = this.musicQueue[i];
        if(item.title == song.title && item.artist == song.artist){
          console.log("Song is already in playlist");
          response.setColor(RED);
          response.setTitle("This song is already in the playlist.");
          callback(response);
          return;
        }
      }
      if(!this.connection.speaking){
        console.log(`Playing ${info.title}`);
        this.connection.playStream(ytdl(url, {quality: 'highestaudio',filter: 'audioonly'}),{seek : 0, volume : 0.5, bitrate: 'auto'});
        this.musicQueue.push(song);
        this.nowPlaying = song;
      }else{
        console.log(`Adding to queue: ${info.title}`);
        this.musicQueue.push(song);
        response.setDescription(`Added to queue: ${song.title}`);
      }
      response.setTitle(`Now Playing: ${this.nowPlaying.title}`);
      response.setThumbnail(this.nowPlaying.thumbnail);
      response.setColor(GREEN);
      for(let i = 0; i < this.musicQueue.length;i++){
        response.addField(`${i+1}: ${this.musicQueue[i].title}`, this.musicQueue[i].artist);
      }
      callback(response);
    });
  }



}
module.exports = MusicPlayer;
