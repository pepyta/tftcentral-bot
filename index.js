const Discord = require('discord.js');
const client = new Discord.Client();
const followers = require('instagram-followers');
const express = require('express');
const app = express();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen(8080)

setInterval(() => {
    followers('tftcentral').then(no => {
        console.log(no)
    })
    client.channels.get("642884636539879443").setName(`Discord users: ${client.channels.get("642884636539879443").guild.memberCount}`)
}, 10000)

client.on('ready', () => {
    client.user.setStatus('available')
    client.user.setPresence({
        game: {
            name: 'with Teamfight Tactics',
            type: "PLAYING"
        }
    });
});

client.login(process.env.TOKEN);