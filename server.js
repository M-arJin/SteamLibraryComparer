key = "xxxxxxxxx"

//Packages for hosting webserver
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



//Request from the webserver
app.get(
    "/compareLibraries",
    async function (request, response) {
        //Grabbing the userID's that were passed from the webserver
        let userIDs = request.query.userIDs
        console.log(userIDs)
        userIDs = userIDs.split(",")
        //Separating the two user ID's
        let userid1 = userIDs[0].trim()
        let userid2 = userIDs[1].trim()
    
        //Passing the userID's through functions that will return the user's entire steam library aslong as it is public
        let user1Games = await run(userid1)
        let user2Games = await run(userid2)

        //Creating an array that will hold all games the two users have in common
        let matchingGames = []
        //Looping over all games for user1
        for (let i = 0; i < user1Games.length; i++) {
            let user1AppID = user1Games[i].appid
            //Looping over all games for user2
            for (let j = 0; j < user2Games.length; j++) {
                let user2AppID = user2Games[j].appid
                //If both games match up it will execute the following
                if (user1AppID === user2AppID) {
                    //Running a request to the API for further details regarding the game (i.e. description, images, etc.)
                    let furtherDetails = await fetch(`https://store.steampowered.com/api/appdetails?appids=${user2AppID}`)
                    let requestedDetails = await furtherDetails.json()
                    
                    //If the game is no longer listed on steam it may return a false request (this prevents it from crashing the server)
                    if (requestedDetails[`${user2AppID}`]["success"] === false) {
                        continue
                    }

                    //Setting variables for the game's image and categories
                    let gameImage = requestedDetails[`${user2AppID}`]["data"]["header_image"]
                    let gameCategories = requestedDetails[`${user2AppID}`]["data"]["categories"]
                  
                    //Creating an object for the game that holds all of the data relevant to said game (i.e. the APPID, name of the game, image and categories relevant ot the game)
                    let matchedGame = new Object()
                    matchedGame.appid = user2AppID
                    matchedGame.gameName = user1Games[i].gameName
                    matchedGame.image = gameImage
                    matchedGame.categories = gameCategories
                    matchingGames.push(matchedGame)
                    
        
                }
            }
        }

        //The array holding all of the games the two users have in common is passed back to the webserver
        response.json(matchingGames)


    }

)


//This function using the user's steamID will request their whole game library aslong as it is public
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
