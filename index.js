const Discord = require('discord.js');
const client = new Discord.Client();
const express = require('express');

const request = require('request');
const app = express();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

// Keep Glitch bot alive, i know it sucks :/
app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen(8080)

// Get server status every 10 seconds
setInterval(() => {
    var url = "https://www.instagram.com/tftcentral";
    request.get(url, function (err, response, body) {
        client.channels.get("642886967100440591").setName(`Instagram followers: ${response.body.split("meta property=\"og:description\" content=\"")[1].split("Followers")[0]}`)
    })

    client.channels.get("642884636539879443").setName(`Discord users: ${client.channels.get("642884636539879443").guild.memberCount}`)
}, 10000)

client.login('NjQyODc5NjgyMDM5MTE5ODky.XcdWxw.fzbPTUp954d9B5eQ2Kw1lGqV0LQ');