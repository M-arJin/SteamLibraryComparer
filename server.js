key = "xxxxxxxxx"

const express = require("express")
const session = require("express-session")
const path = require("path")


const app = express()

//Hosting the webserver
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

app.use(
    session(
        {
            secret: "puffin",
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 60000 * 60
            }
        }
    )
)


app.use(express.json())

app.listen(3000, function () { console.log("Listening on port 3000") })



app.get(
    "/compareLibraries",
    async function (request, response) {
        let userIDs = request.query.userIDs
        console.log(userIDs)
        userIDs = userIDs.split(",")
        let userid1 = userIDs[0].trim()
        let userid2 = userIDs[1].trim()
    

        let user1Games = await run(userid1)
        let user2Games = await run(userid2)

        let matchingGames = []
        for (let i = 0; i < user1Games.length; i++) {
            let user1AppID = user1Games[i].appid

            for (let j = 0; j < user2Games.length; j++) {
                let user2AppID = user2Games[j].appid

                if (user1AppID === user2AppID) {
                
                    let matchedGame = new Object()
                    matchedGame.appid = user2AppID
                    matchedGame.gameName = user1Games[i].gameName
                    matchingGames.push(matchedGame)
        
                }
            }
        }
        response.json(matchingGames)
    }

)


main()
async function main() {
    
}


async function run(steamID) {
    try {
        //Retrieving user's owned games
        let dataFromAPI = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamID}&format=json`)
        let data = await dataFromAPI.json()

        //Retrieving all steam games
        let gameRequest = await fetch(`http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=${key}&format=json`)
        let gameRequestData = await gameRequest.json()
        let allGames = gameRequestData.applist.apps


        //An array that contains infomraiton regarding all of the games a user has in their library
        let games = []
        playerData = data.response.games
        
        //This loops over all user's games, finding the game's name using its coresponding appid as it loops over all steam games
        for (let i = 0; i < playerData.length; i++) {
            let appID = playerData[i].appid

            for (let j = 0; j < allGames.length; j++) {
                if (allGames[j].appid === appID) {
                    //Creating an object that holds the games appID and game name before storing it into an array
                    let game = new Object()
                    game.appid = appID
                    game.gameName = allGames[j].name
                    
                    games.push(game)
                }
            }
        }
        return games

    } catch {
        console.error("An error occurred:", error);
        return []; // Return empty array on error
    }
        
  
}


async function retrieve_all_games() {
    let dataFromAPI = await fetch(`http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=${key}&format=json`)
    let data = await dataFromAPI.json()

    return data.applist.apps
}

