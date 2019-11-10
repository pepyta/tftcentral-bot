const Discord = require('discord.js');
const client = new Discord.Client();
const express = require('express');
const {XMLHttpRequest} = require("xmlhttprequest")
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
    getJSON('https://www.instagram.com/tftcentral/?__a=1',
        function (err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                client.channels.get("642886967100440591").setName(`Instagram followers: ${JSON.parse(data)['graphql']['user']['edge_followed_by']['count']}`)
            }
        });

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


var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};