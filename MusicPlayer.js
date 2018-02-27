const Discord = require('discord.js');
const ytdl = require('ytdl-core');
//HEX COLORS
const RED = 0xd10000;
const GREEN = 0x00c939;
const YELLOW = 0xe5c300;
// Stream reading options
const YOUTUBE_OPTIONS = {quality: 'highestaudio',filter: 'audioonly'};
const STREAM_OPTIONS = {seek : 0, volume : 0.5, bitrate: 'auto'};

class MusicPlayer{
  constructor(){
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
    if(message.content === '!stop'){
      if(this.connection != null){
        console.log("[MB] Stopped bot");
        response.setColor(GREEN);
        response.setDescription(`Stopped`);
        this.disconnectVoiceChannel();
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
      console.log(`[MB] Connected to voice channel: ${voiceChannel.name}`);
      this.connectToVoiceChannel(voiceChannel,(connection)=>{
        /////////////////////////////////////////////////////////
        connection.on('failed', (error)=>{
          console.log("[MB.connection] Failed: " + error.message);
        })
        connection.on('warn',(string)=>{
          console.log("[MB.connection] Warning: " + string);
        });
        connection.on("error", (error)=>{
          console.log("[MB.connection] Error: " + error.message);
        });
        this.play(url,response,(res)=>{
          textChannel.send(res);
          message.delete();
        });
        /////////////////////////////////////////////////////////
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
    //Attempt to grab song info at URL
    ytdl.getInfo(url,(error, info)=>{
      //First verify if the URL is valid
      if(error){
        console.log("[MB] ytdl error: " + error.message);
        response.setColor(RED);
        response.setTitle(error.message);
        callback(response);
        return;
      }
      //Create object of song
      var song = {
        title:info.title,
        artist:info.author.name,
        thumbnail:info.thumbnail_url,
        url: url
      }
      //Check if the
      for(let i = 0; i < this.musicQueue.length;i++){
        var item = this.musicQueue[i];
        if(item.title == song.title && item.artist == song.artist){
          console.log("[MB] Cannot add duplicate song");
          response.setColor(RED);
          response.setTitle("This song is already in the playlist.");
          callback(response);
          return;
        }
      }
      if(!this.connection.speaking){
        console.log(`[MB] Playing: ${info.title}`);
        var dispatcher = this.connection.playStream(ytdl(url, YOUTUBE_OPTIONS),STREAM_OPTIONS);
        /////////////////////////////////////////////////////////
        dispatcher.on('end',(reason)=>{
          console.log("[MB.dispatcher] ended: " + reason);
        });
        dispatcher.on('speaking', (result)=>{
          console.log("[MB.dispatcher] speaking: " + result);
        });
        /////////////////////////////////////////////////////////
        this.nowPlaying = song;
      }else{
        console.log(`[MB] Added to queue: ${info.title}`);
        this.musicQueue.push(song);
        response.setDescription(`Added to queue: ${song.title}`);
        var list = "";
        for(let i = 0; i < this.musicQueue.length;i++){
          list += `${i+1}: ${this.musicQueue[i].title} - ${this.musicQueue[i].artist}\n`;
        }
        response.addField("**Queue**",list);
      }
      response.setDescription(`**Now Playing**\n${this.nowPlaying.title} - ${this.nowPlaying.artist}`);
      response.setThumbnail(this.nowPlaying.thumbnail);
      response.setColor(GREEN);
      callback(response);
    });
  }

}
module.exports = MusicPlayer;
