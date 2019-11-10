const Discord = require('discord.js');
const client = new Discord.Client();
let Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram()
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
    Instagram.getCsrfToken().then((csrf) => {
        Instagram.csrfToken = csrf;
    }).then(() => {
        return Instagram.auth(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD).then(sessionId => {
            Instagram.sessionId = sessionId

            return Instagram.getUserDataByUsername('tftcentral').then((t) => {
                var followers = t['graphql']['user']['edge_followed_by']['count']
                client.channels.get("642886967100440591").setName(`Instagram followers: ${(followers/1000+"").split(".")[0]+((followers/1000+"").split(".")[1].substring(0,1) > 0 ? "."+(followers/1000+"").split(".")[1].substring(0,1) : "")}k`)
                console.log(`${(followers/1000+"").split(".")[0]+((followers/1000+"").split(".")[1].substring(0,1) > 0 ? "."+(followers/1000+"").split(".")[1].substring(0,1) : "")}k`)
            })

        })
    }).catch(console.error);
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