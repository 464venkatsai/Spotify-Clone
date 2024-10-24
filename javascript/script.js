// Fetching All Songs From The Folder
async function getSongs(folder) {
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)
    let respose = await a.text()
    let div = document.createElement("div")
    div.innerHTML = respose
    let songs = [];
    let array = div.getElementsByTagName("a")
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.href.endsWith("mp3") || element.href.endsWith("m4a") || element.href.endsWith("mp4")) {
            songs.push(element.href)
        }
    }
    return songs
}

async function getAlbums() {
    // Fetching Albums
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let respose = await a.text()
    let div = document.createElement("div")
    div.innerHTML = respose
    let albums = [];
    let array = div.getElementsByTagName("a")
    let container = document.querySelector(".cardContainer");
    Array.from(array).forEach(async e => {
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/songs/")[1]
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let respose = await a.json()
            console.log(respose);
            createAlbumCard(respose.imageURL,respose.title,respose.description,folder);
        }
    });
    return albums
}

// Creates Song Card Dynamically
function createSongCard(song_name, artist_name, index) {
    let card = document.createElement("li");
    card.innerHTML = `    
            <img class="invert" src="images/music.svg" alt="">
            <div class="song-info">
                <h5>${song_name}</h5>
                <h6>${artist_name}</h6>
            </div>
            <img class="invert" src="images/play.svg" alt="">
            `
    card.classList.add("song-card")
    card.setAttribute("song-index", index)
    document.querySelector(".library-songs-list ul").appendChild(card)
}
// // Creates Album Card dyanmically
function createAlbumCard(imageLink,cardTitle,description,folderName) {
    let container = document.querySelector(".cardContainer")
    let card = document.createElement("div")
    card.classList.add("card")
    card.innerHTML = `
                        <img src=${imageLink} alt="Album-img">
                        <section class="cardDetails">
                            <h2>${cardTitle}</h2>
                            <p>${description}</p>
                        </section>
                        <div class="play">
                        <img src="/images/play-button-arrowhead.svg" alt="play">
                        </div>
                    `
    card.setAttribute("data-folder", folderName)
    container.appendChild(card)
}

function getTimeInMinutes(time) {
    return Math.round(time) / 100
}

let currentSong;
let currentFolder = "Liked_Songs"
async function main() {
    // Loading All The Songs
    let albums = await getAlbums();
    let songs = await getSongs(currentFolder)
    currentSong = new Audio(songs[0])

    // Generating Song Cards
    for (let index = 0; index < songs.length; index++) {
        let song_name = songs[index].replaceAll("%20", " ").split(`/songs/${currentFolder}/`)[1].split(".")[0]
        createSongCard(song_name, "Venkat Sai", index)
    }

    // Setting the frist song as song[0] and getting the details of the song
    let currentSongCard = document.getElementsByClassName("song-card")[0]
    document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
    document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".playbar section h6").textContent = `${getTimeInMinutes(currentSong.currentTime)} / ${getTimeInMinutes(currentSong.duration)}`
    })

    // Adding an event listener to Song Cards
    document.querySelectorAll(".song-card").forEach(card => {
        card.addEventListener("click", (event) => {
            let songIndex = event.currentTarget.getAttribute("song-index")
            let currentSongCard = event.currentTarget
            document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
            document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
            if (currentSong && !currentSong.paused) {
                currentSong.pause()
            }
            currentSong.src = songs[songIndex]
            currentSong.play()
            document.getElementById("playSong").setAttribute("src", "/images/pause.svg")
        })
    });

    // Adding an event listener to Playbar - play and pause the song
    document.getElementById("playSong").addEventListener("click", () => {
        let playPause = document.getElementById("playSong");
        if (currentSong && !currentSong.paused) {
            currentSong.pause()
            playPause.setAttribute("src", "/images/play.svg")
        } else {
            currentSong.play()
            playPause.setAttribute("src", "/images/pause.svg")
        }
    })


    let seekbar = document.querySelector(".seek-bar");
    let circle = document.querySelector(".circle");
    let songPlayed = document.querySelector(".seek-color")

    // Calculating the song width and time
    currentSong.addEventListener("timeupdate", () => {
        let songTime = (currentSong.currentTime / currentSong.duration) * 100
        circle.style.left = `${songTime}%`
        songPlayed.style.width = `${songTime}%`;
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".playbar section h6").textContent = `${getTimeInMinutes(currentSong.currentTime)} / ${getTimeInMinutes(currentSong.duration)}`
        }
    })

    // Adding an event listener to seekbar 
    seekbar.addEventListener("click", (e) => {
        let songTime = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = `${songTime}%`
        currentSong.currentTime = (currentSong.duration * songTime) / 100;
    })

    // Adding an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        let left = document.querySelector(".left");
        if (left.style.left === "0.5rem") {
            left.style.left = "-100%"
        } else {
            left.style.left = "0.5rem"
        }
        document.querySelector(".left").style.width = "70%";
    })

    // Adding an event listener to Previous Button
    document.getElementById("previous").addEventListener("click", () => {
        let songIdx = songs.indexOf(currentSong.src);
        if (songIdx > 0) {
            let currentSongCard = document.querySelector(`.song-card[song-index="${songIdx + 1}"]`)
            document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
            document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
            currentSong.src = songs[songIdx - 1]
            currentSong.play()
        }
    })
    // Adding an event listener to Next Button
    document.getElementById("next").addEventListener("click", () => {
        let songIdx = songs.indexOf(currentSong.src);
        if (songIdx < songs.length - 1) {
            currentSong.src = songs[songIdx + 1]
            let currentSongCard = document.querySelector(`.song-card[song-index="${songIdx + 1}"]`)
            document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
            document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
            currentSong.play()
        }
    })

    //  Load the library when the user clicks on the folder
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            currentFolder = item.currentTarget.dataset.folder
            songs = await getSongs(currentFolder)
            document.querySelector(".library-songs-list ul").innerHTML = ""
            for (let index = 0; index < songs.length; index++) {
                let song_name = songs[index].split(`/songs/${currentFolder}/`)[1].split(".")[0].replaceAll("%20", " ")
                createSongCard(song_name, "Venkat Sai", index)
            }
            document.querySelectorAll(".song-card").forEach(card => {
                card.addEventListener("click", (event) => {
                    let songIndex = event.currentTarget.getAttribute("song-index")
                    let currentSongCard = event.currentTarget
                    document.querySelector(".current-song-info h5").textContent = currentSongCard.querySelector("h5").textContent
                    document.querySelector(".current-song-info p").textContent = currentSongCard.querySelector("h6").textContent
                    if (currentSong && !currentSong.paused) {
                        currentSong.pause()
                    }
                    currentSong.src = songs[songIndex]
                    currentSong.play()
                    document.getElementById("playSong").setAttribute("src", "/images/pause.svg")
                })
            });
        })
    });
}
main()

