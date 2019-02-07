const _md5 = require('../utils.js').md5
const _ecbCrypt = require('../utils.js').ecbCrypt

module.exports = class Track {
  constructor(body){
    this.id = body.SNG_ID
    this.title = `${body.SNG_TITLE}${body.VERSION ? ` ${body.VERSION}`: ""}`
    this.duration = body.DURATION
    this.MD5 = body.MD5_ORIGIN
    this.mediaVersion = body.MEDIA_VERSION
    if (parseInt(this.id)<0){
      this.filesize = body.FILESIZE
      this.album = {id: 0, title: body.ALB_TITLE, picture: body.ALB_PICTURE}
      this.artist = {id: 0, name: body.ART_NAME}
      this.artists = [this.artist]
      this.recordType = -1
    }else{
      this.filesize = {
        default: parseInt(body.FILESIZE),
        mp3_128: parseInt(body.FILESIZE_MP3_128),
        mp3_320: parseInt(body.FILESIZE_MP3_320),
        flac: parseInt(body.FILESIZE_FLAC),
      }
			this.fallbackId = (body.FALLBACK ? (body.FALLBACK.SNG_ID ? body.FALLBACK.SNG_ID : 0) : 0)
      this.album = {id: body.ALB_ID, title: body.ALB_TITLE, picture: body.ALB_PICTURE}
      this.artist = {id: body.ART_ID, name: body.ART_NAME, picture: body.ART_PICTURE ? body.ART_PICTURE : null}
			if (body.PHYSICAL_RELEASE_DATE) {
				this.date = {
	        day: body.PHYSICAL_RELEASE_DATE.slice(8,10),
	        month: body.PHYSICAL_RELEASE_DATE.slice(5,7),
	        year: body.PHYSICAL_RELEASE_DATE.slice(0, 4)
	      }
			}
			if (body.ARTISTS){
				this.artists = []
	      body.ARTISTS.forEach(artist=>{
	        if (artist.__TYPE__ == "artist") this.artists.push({
	          id: artist.ART_ID,
	          name: artist.ART_NAME,
	          picture: artist.ART_PICTURE
	        })
	      })
			}else{
				this.artistsString = []
				if (body.SNG_CONTRIBUTORS.main_artist){
	        this.artistsString = this.artistsString.concat(body.SNG_CONTRIBUTORS.main_artist)
	      }else if (body.SNG_CONTRIBUTORS.mainartist){
	        this.artistsString = this.artistsString.concat(body.SNG_CONTRIBUTORS.mainartist)
	      }
				if (body.SNG_CONTRIBUTORS.featuredartist) {
					this.artistsString = this.artistsString.concat(body.SNG_CONTRIBUTORS.featuredartist)
				}
	      if (body.SNG_CONTRIBUTORS.associatedperformer) {
	        this.artistsString = this.artistsString.concat(body.SNG_CONTRIBUTORS.associatedperformer)
	      }
			}
      this.gain = body.GAIN
      this.discNumber = body.DISK_NUMBER
      this.trackNumber = body.TRACK_NUMBER
      this.explicit = body.EXPLICIT_LYRICS
      this.ISRC = body.ISRC
      this.contributor = body.SNG_CONTRIBUTORS
      this.lyricsId = body.LYRICS_ID
			this.copyright = body.COPYRIGHT
	    this.recordType = body.TYPE
	    this.contributor = body.SNG_CONTRIBUTORS
			if (body.LYRICS){
	      this.unsyncLyrics = {
	  			description: "",
	  			lyrics: body.LYRICS.LYRICS_TEXT
	  		}
				if (body.LYRICS.LYRICS_SYNC_JSON){
					this.syncLyrics = ""
	        for(let i=0; i < body.LYRICS.LYRICS_SYNC_JSON.length; i++){
	  				if(body.LYRICS.LYRICS_SYNC_JSON[i].lrc_timestamp){
	  					this.syncLyrics += body.LYRICS.LYRICS_SYNC_JSON[i].lrc_timestamp + body.LYRICS.LYRICS_SYNC_JSON[i].line+"\r\n";
	  				}else if(i+1 < body.LYRICS.LYRICS_SYNC_JSON.length){
	  					this.syncLyrics += body.LYRICS.LYRICS_SYNC_JSON[i+1].lrc_timestamp + body.LYRICS.LYRICS_SYNC_JSON[i].line+"\r\n";
	  				}
	  			}
				}
	    }
    }
  }

  getDownloadUrl(format){
    var urlPart = this.MD5+"¤"+format+"¤"+this.id+"¤"+this.mediaVersion
    var md5val = _md5(urlPart)
    urlPart = _ecbCrypt('jo6aey6haid2Teih', md5val+"¤"+urlPart+"¤")
    return "https://e-cdns-proxy-" + this.MD5.substring(0, 1) + ".dzcdn.net/mobile/1/" + urlPart
  }
}
