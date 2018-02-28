const Discord = require('discord.js');
const ytdl = require('ytdl-core');
//HEX COLORS
const RED = 0xd10000;
const GREEN = 0x00c939;
const YELLOW = 0xe5c300;
// Stream reading options
const YOUTUBE_OPTIONS = {quality: 'highestaudio',filter: 'audioonly'};
const STREAM_OPTIONS = {seek : 0, volume : 0.3, bitrate: 'auto'};

class MusicPlayer{
  constructor(client){
    this.client = client;
    this.connection = null;
    this.nowPlaying = {};
    this.textChannel = {};
    this.guildMusicQueue = new Map();
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
      if(this.connection != null && message.guild == this.connection.channel.guild){
        console.log("[MusicPlayer] Stopped bot");
        this.guildMusicQueue.set(this.textChannel.guild.id,[]);
        response.setColor(GREEN);
        response.setDescription(`Stopped`);
        this.disconnectVoiceChannel();
        this.textChannel.send(response);
        message.delete();
      }
      return;
    }
    //-----------------------------------------------------------------------
    if(/^(\!play )/i.exec(message.content)){
      if(voiceChannel == null){
        console.log(`[MusicPlayer] user not in voice channel: ${message.author.username}`);
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
    if(message.content === '!queue'){
      response.setColor(GREEN);
      response.setTitle("Current queue");
      var queue = this.guildMusicQueue.get(this.textChannel.guild.id);
      if (queue != null && queue.length > 0){
        for(let i = 0; i < queue.length; i++){
          response.addField(`${i+1}`, `${queue[i].title} - ${queue[i].artist}`);
        }
      }else{
        response.setDescription('Queue is empty');
      }
      this.textChannel.send(response);
    }
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
      //Fetch the textChannel's guild's music queue
      var musicQueue = this.guildMusicQueue.get(this.textChannel.guild.id);
      if(!musicQueue){
        this.guildMusicQueue.set(this.textChannel.guild.id,[]);
        musicQueue = this.guildMusicQueue.get(this.textChannel.guild.id);
      }
      console.log(musicQueue.length);
      //Create object of song with information about title, artist, thumbnail
      var song = {
        title:info.title,
        artist:info.author.name,
        thumbnail:info.thumbnail_url,
        url: url
      }

      /**
      Checking duplicates is commented out because it might be desireable to have it
      in some cases; if unwanted, just uncomment the check.

      //Check if the song is already in the playlist
      for(let i = 0; i < this.musicQueue.length;i++){
        var item = this.musicQueue[i];
        //We cant use URL to check here because of stringQueries in URLs
        //(eg. time seek, playlists, etc, inside the URL)
        //So instead we simply check title and artist
        if(item.title == song.title && item.artist == song.artist){
          console.log("[MusicPlayer] Cannot add duplicate song");
          response.setColor(RED);
          response.setTitle("This song is already in the playlist.");
          if(callback) callback(response);
          return;
        }
      }
      **/

      if(!this.connection.speaking){
        var dispatcher = this.connection.playStream(ytdl(url, YOUTUBE_OPTIONS),STREAM_OPTIONS);
        dispatcher.on('end',(reason)=>{
          console.log('-------------------------------------------------------------------------');
          console.log(`[MusicPlayer.Dispatcher] Stopped: ${reason}`);
          // If the reason is not null, try to play the next song
          // Only when the user gives a disconnect command the reason is null, even
          // from a different server
          if(reason != null || reason == 'user'){
            var nextSong = musicQueue.shift();
            if(nextSong){
              //If the queue still has music, play it
              this.play(nextSong.url, new Discord.RichEmbed(), (res)=>{
                this.textChannel.send(res);
              });
            }else{
              //Otherwise stop the bot
              this.disconnectVoiceChannel();
              var msg = new Discord.RichEmbed().
              setColor(GREEN)
              .setTitle("Done playing.")
              .setDescription("Queue empty");
              this.textChannel.send(msg);
              console.log('[MusicPlayer] Disconnecting channel: finished queue');
            }
          }
          return;
        });
        this.nowPlaying = song;
        console.log(`[MusicPlayer] Playing song: ${info.title}`);
      }else{
        console.log(`[MusicPlayer] Added song to queue: ${info.title}`);
        musicQueue.push(song);
        response.addField('Added to queue',`${song.title} - ${song.artist}`);
      }
      if(musicQueue.length > 0){
        for(let i = 0; i < musicQueue.length; i++){
          response.addField(`${i+1}`,`${musicQueue[i].title} - ${musicQueue[i].artist}`);
        }
      }
      response.setTitle(`Now Playing`);
      response.setDescription(`${this.nowPlaying.title} - ${this.nowPlaying.artist}`);
      response.setThumbnail(this.nowPlaying.thumbnail);
      response.setColor(GREEN);
      if(callback) callback(response);
    });
  }

}
module.exports = MusicPlayer;
