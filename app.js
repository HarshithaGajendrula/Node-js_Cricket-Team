const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketTeam.db')

const app = express()

app.use(express.json())

let database = null

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at hhtp://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayersQuery = `INSERT INTO
  cricket_team (player_name, jersey_number, role)
  VALUES
  ('${playerName}','${jerseyNumber}', '${role}'); `
  const player = await database.run(postPlayersQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `SELECT * FROM cricket_team
  WHERE player_id = ${playerId};`
  const player = await database.get(getPlayersQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayersQuery = `UPDATE cricket_team
  SET
  player_name = '${playerName}',
  jersey_number = '${jerseyNumber}',
  role = '${role}'
  WHERE 
  player_id = ${playerId};`
  await database.run(updatePlayersQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayersQuery = `DELETE FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`
  await database.run(deletePlayersQuery)
  response.send('Player Removed')
})

module.exports = app
