async function getSongs(){
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let respose = await a.text() 
    let div = document.createElement("div")
    div.innerHTML = respose
    let songs = [];
    let array = div.getElementsByTagName("a")
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if(element.href.endsWith("mp3") || element.href.endsWith("m4a") || element.href.endsWith("mp4")){
            songs.push(element.href)
        }
    }
    console.log(songs)
    return songs
}
function createSongCard(song_name,artist_name,index){
//     <ul>
//     <li class="song-card">
//         <img class="invert" src="images/music.svg" alt="">
//         <div class="song-info">
//             <h5>Song Name</h5>
//             <h6>Artist Name</h6>
//         </div>
//         <img class="invert" src="images/play.svg" alt="">
//     </li>
//  </ul>
    let card = document.createElement("li")
    let musicImg = document.createElement("img")
    let songInfo = document.createElement("div")
    let songName = document.createElement("h5")
    let artist = document.createElement("h6")
    let playImg = document.createElement("img")

    card.classList.add("song-card")
    card.setAttribute("song-index",index)
    musicImg.classList.add("invert")
    musicImg.src = "images/music.svg"
    songInfo.classList.add("song-info")
    songName.innerHTML = song_name
    artist.innerHTML = artist_name
    playImg.classList.add("invert")
    playImg.src = "images/play.svg"

    songInfo.appendChild(songName)
    songInfo.appendChild(artist)
    card.appendChild(musicImg)
    card.appendChild(songInfo)
    card.appendChild(playImg)

    document.querySelector(".library-songs-list ul").appendChild(card)
}

let currentSong;
async function main(){
    let songs = await getSongs() 
    currentSong = new Audio(songs[0])
    for (let index = 0; index < songs.length; index++){
        let song_name = songs[index].split("/songs/")[1].split(".")[0].replaceAll("%20"," ") 
        createSongCard(song_name,"Venkat Sai",index)
    }
    let currentSongCard = document.getElementsByClassName("song-card")[0]
    document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
    document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
    document.querySelectorAll(".song-card").forEach(card => {
        card.addEventListener("click",(event)=>{
            let songIndex = event.currentTarget.getAttribute("song-index")
            let currentSongCard = event.currentTarget
            document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
            document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
            if (currentSong && !currentSong.paused){
                currentSong.pause()
            }
            currentSong.src = songs[songIndex]
            console.log(currentSong);
            currentSong.play()
            document.getElementById("playSong").setAttribute("src","/images/pause.svg")
        })
    });
    document.getElementById("playSong").addEventListener("click",()=>{
        let playPause = document.getElementById("playSong");
        if(currentSong && !currentSong.paused){
            currentSong.pause()
            playPause.setAttribute("src","/images/play.svg")
        }else{
            currentSong.play()
            playPause.setAttribute("src","/images/pause.svg")
        }
    })
    let seekbar = document.querySelector(".seek-bar");
    let circle = document.querySelector(".circle");
    let songPlayed = document.querySelector(".seek-color")
    currentSong.addEventListener("timeupdate",()=>{
        let songTime = (currentSong.currentTime/currentSong.duration)*100
        circle.style.left = `${songTime}%`
        songPlayed.style.width = `${songTime}%`;
    })
    seekbar.addEventListener("click",(e)=>{
        let songTime = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = `${songTime}%`
        currentSong.currentTime = (currentSong.duration*songTime)/100;
    })
}
main()

