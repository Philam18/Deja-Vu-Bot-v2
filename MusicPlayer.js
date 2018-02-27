const Discord = require('discord.js');
const ytdl = require('ytdl-core');
//HEX COLORS
const RED = 0xd10000;
const GREEN = 0x00c939;
const YELLOW = 0xe5c300;
// Stream reading options
const YOUTUBE_OPTIONS = {quality: 'highestaudio',filter: 'audioonly'};
const STREAM_OPTIONS = {seek : 0, volume : 0.1, bitrate: 'auto'};

class MusicPlayer{
  constructor(client){
    this.client = client;
    this.connection = null;
    this.musicQueue = [];
    this.nowPlaying = {};
    this.textChannel = {};

    for (let guild of client.guilds){
      console.log(";) " + guild.id);
      this.musicQueue.push({
        id:guild.id,
        queue:[]
      });
    }

  }

  command(message){
    this.textChannel = message.channel;
    var voiceChannel = message.member.voiceChannel;
    //Embed response template
    var response = new Discord.RichEmbed()
    .setTimestamp(message.createdAt)
    .setFooter(`${message.author.username}  ${message.content}`,message.author.avatarURL);
    //-----------------------------------------------------------------------
    if(message.content === '!stop'){
      if(this.connection != null){
        console.log("[MusicPlayer] Stopped bot");
        console.log('-------------------------------------------------------------------------');
        response.setColor(GREEN);
        response.setDescription(`Stopped`);
        this.disconnectVoiceChannel();
        this.textChannel.send(response);
        message.delete();
      }
    }
    //-----------------------------------------------------------------------
    if(/^(\!play )/i.exec(message.content)){
      if(voiceChannel == null){
        console.log(`[MusicPlayer] user not in voice channel: ${message.author.username}`);
        console.log('-------------------------------------------------------------------------');
        response.setColor(RED);
        response.setDescription(`**${message.author.username}** is not in a voice channel.`);
        this.textChannel.send(response);
        message.delete();
        return;
      }
      var url = message.content.replace(/^(\!play )/i,'');
      console.log(`[MusicPlayer] Connected to voice channel: ${voiceChannel.name}`);
      this.connectToVoiceChannel(voiceChannel,()=>{
        this.play(url,response,(responseBack)=>{
          this.textChannel.send(responseBack);
          message.delete();
        });
      });
      return;
    }
    //-----------------------------------------------------------------------

    //-------------------   END   ----------------------
  }

  connectToVoiceChannel(voiceChannel, callback){
    voiceChannel.join().then((connection)=>{
      this.connection = connection;
      if(callback) callback();
    });
  }

  disconnectVoiceChannel(){
    this.connection.channel.leave();
    this.broadcast = null;
    this.connection = null;
  }

  getChannelName(){
    if(this.connection != null) return this.connection.channel.name;
    return null;
  }

  play(url, response, callback){
    //Attempt to grab song info at URL
    ytdl.getInfo(url,(error, info)=>{
      //First verify if the URL is valid
      if(error){
        console.log("[MusicPlayer] ytdl error: " + error.message);
        console.log('-------------------------------------------------------------------------');
        response.setColor(RED);
        response.setTitle(error.message);
        if(callback) callback(response);
        return;
      }
      //Create object of song with information about title, artist, thumbnail
      var song = {
        title:info.title,
        artist:info.author.name,
        thumbnail:info.thumbnail_url,
        url: url
      }
      Check if the song is already in the playlist
      for(let i = 0; i < this.musicQueue.length;i++){
        var item = this.musicQueue[i];
        //We cant use URL to check here because of stringQueries in URLs
        //(eg. time seek, playlists, etc, inside the URL)
        //So instead we simply check title and artist
        if(item.title == song.title && item.artist == song.artist){
          console.log("[MusicPlayer] Cannot add duplicate song");
          console.log('-------------------------------------------------------------------------');
          response.setColor(RED);
          response.setTitle("This song is already in the playlist.");
          if(callback) callback(response);
          return;
        }
      }
      If the connection is playing anything right now
      if(!this.connection.speaking){
        var dispatcher = this.connection.playStream(ytdl(url, YOUTUBE_OPTIONS),STREAM_OPTIONS);
        dispatcher.on('end',(reason)=>{
          console.log(`[MusicPlayer.Dispatcher] Finished: ${reason}`);
          //If the reason is not null, try to play the next song
          //(Only when the user gives a disconnect commant the reason is null)
          if(reason != null || 'user'){
            var nextSong = this.musicQueue.shift();
            if(nextSong){
              this.play(nextSong.url, new Discord.RichEmbed(), (res)=>{
                this.textChannel.send(res);
              });
            }else{
              this.disconnectVoiceChannel();
              var msg = new Discord.RichEmbed().
              setColor(GREEN)
              .setTitle("Stopped")
              .setDescription("Music queue is empty");
              this.textChannel.send(msg);
            }
          }
        });
        this.nowPlaying = song;
        console.log(`[MusicPlayer] Playing song: ${info.title}`);
        console.log('-------------------------------------------------------------------------');
      }else{
        console.log(`[MusicPlayer] Added song to queue: ${info.title}`);
        console.log('-------------------------------------------------------------------------');
        this.musicQueue.push(song);
      }
      response.setDescription(`Added to queue: ${song.title}`);
      var list = "";
      if(this.musicQueue.length >= 1){
        for(let i = 0; i < this.musicQueue.length;i++){
          list += `${i+1}: ${this.musicQueue[i].title} - ${this.musicQueue[i].artist}\n`;
        }
      }else{
        list = "Empty";
      }
      response.addField("**Queue**",list);
      response.setDescription(`**Now Playing**\n${this.nowPlaying.title} - ${this.nowPlaying.artist}`);
      response.setThumbnail(this.nowPlaying.thumbnail);
      response.setColor(GREEN);
      if(callback) callback(response);
    });
  }



}
module.exports = MusicPlayer;
