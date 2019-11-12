const Discord = require('discord.js');
const client = new Discord.Client();
let Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram()
const express = require('express');
const app = express();

const inventory = require('data-store')({ path: process.cwd() + '/inventory.json' })
const defaults = require('data-store')({ path: process.cwd() + '/defaults.json' })
const messageCounter = require('data-store')({ path: process.cwd() + '/messageCounter.json' })
const legends = require('./legends')

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen(8080)


client.on('message', function (msg) {
    if (msg.author.id !== 230740886273654786) return
    var value = messageCounter.get(msg.author.id, undefined)
    if (value) {
        value--
        if (value == 0) {
            var legendId = parseInt(Math.random() * legends.length, 10)
            msg.author.send(`Congratulations! You've just got a new Little Legend!\nThe eggs content is: **${legends[legendId].name}**\nKeep on being active and you'll recive more rewards!`)
            addLittleLegend(legendId, msg.author)
            msg.author.send(inventory.get(msg.author.id))
            value = 6
        }
        messageCounter.set(msg.author.id, value)
    } else {
        messageCounter.set(msg.author.id, 5)
    }
    msg.author.send(JSON.stringify(inventory.get(msg.author.id)))
    msg.author.send(defaults.get(msg.author.id))
    msg.author.send(messageCounter.get(msg.author.id))
})

function addLittleLegend(legendId, author) {
    var inv = inventory.get(author.id, [])
    /*
    elem: {
        legendId: 5,
        level: [1-3]    
    }
    */
    var has = false
    inv.forEach(function (elem) {
        if (elem.legendId == legendId) {
            has = true
        }
    })

    if (has) {
        inv.forEach(function (elem) {
            if (elem.legendId == legendId) {
                elem.level++
            }
        })
    } else {
        inv.push({
            legendId: legendId,
            level: 1
        })
    }

    if (!defaults.get(author.id, undefined)) {
        defaults.set(author.id, legendId)
    }

    inventory.set(author.id, inv)
}

function setDefault(userId, legendId) {
    defaults.set(userId, legendId)
}

client.on('message', function (msg) {
    if (msg.content.startsWith("!legend")) {
        var inv = inventory.get(msg.author.id, [])
        if (inv.length == 0) {
            msg.author.send(`I'm sorry but you don't have any little legend yet!`)
        } else {
            var message = `Select which little legend do you want to use:\n`
            inv.forEach(function (legend) {
                var stars = ""
                for (var i = 0; i < legend.level; i++) {
                    stars += '⭐'
                }
                message += `- ${legends[legend.legendId].emoji} **${legends[legend.legendId].name}**: ${stars}\n`
            })
            message += `\n\nReact with the correct emoji`
            msg.author.send(message, function (msg) {
                inv.forEach(function (legend) {
                    msg.react(legend.emoji)

                    msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                        .then(collected => {
                            const reaction = collected.first();

                            console.log(reaction.emoji.name)
                        })
                        .catch(collected => {
                            console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
                            message.reply('you didn\'t react with neither a thumbs up, nor a thumbs down.');
                        });
                })
            })
            msg.author.send(`\nReact with the correct emoji to use it!`)
        }
    }
})

client.on('ready', () => {
    client.user.setStatus('available')
    client.user.setPresence({
        game: {
            name: 'with Teamfight Tactics',
            type: "PLAYING"
        }
    });
});

setInterval(() => {
    Instagram.getCsrfToken().then((csrf) => {
        Instagram.csrfToken = csrf;
    }).then(() => {
        return Instagram.auth(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD).then(sessionId => {
            Instagram.sessionId = sessionId

            return Instagram.getUserDataByUsername('tftcentral').then((t) => {
                var followers = t['graphql']['user']['edge_followed_by']['count']
                client.channels.get("642886967100440591").setName(`Instagram followers: ${(followers / 1000 + "").split(".")[0] + ((followers / 1000 + "").split(".")[1].substring(0, 1) > 0 ? "." + (followers / 1000 + "").split(".")[1].substring(0, 1) : "")}k`)
                console.log(`${(followers / 1000 + "").split(".")[0] + ((followers / 1000 + "").split(".")[1].substring(0, 1) > 0 ? "." + (followers / 1000 + "").split(".")[1].substring(0, 1) : "")}k`)
            })

        })
    }).catch(console.error);
    client.channels.get("642884636539879443").setName(`Discord users: ${client.channels.get("642884636539879443").guild.memberCount}`)
}, 10000)

client.login(process.env.TOKEN);