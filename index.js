const Discord = require('discord.js');
const client = new Discord.Client();

const express = require('express');
const app = express();

const { XMLHttpRequest } = require('xmlhttprequest')

const inventory = require('data-store')({ path: 'inventory.json' })
const defaults = require('data-store')({ path: 'defaults.json' })
const messageCounter = require('data-store')({ path: 'messageCounter.json' })
const legends = require('./legends')

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen(8080)


client.on('message', function (msg) {
    if (msg.author.id != 230740886273654786) return
    var value = messageCounter.get(msg.author.id, undefined)
    if (value) {
        value--
        if (value == 0) {
            //var legendId = parseInt(Math.random() * legends.length, 10)
            // Only generate little legend for less hen 3 star units
            var pool = []
            for (var i = 0; i < legends.length; i++) {
                pool.push(i)
            }

            var inv = inventory.get(msg.author.id, [])
            inv.forEach(function (elem) {
                if (elem.level == 3) {
                    for (var i = 0; i < pool.length; i++) {
                        if(i == elem.legendId){
                            pool.splice(i, 1)
                        }
                    }
                }
            })

            var legendId = pool[parseInt(Math.random() * pool.length, 10)]


            msg.author.send(`Congratulations! You've just got a new Little Legend!\nThe eggs content is: **${legends[legendId].name}**\nKeep on being active and you'll recive more rewards!\n`)
            addLittleLegend(legendId, msg.author)
            value = 10
        }
        messageCounter.set(msg.author.id, value)
    } else {
        messageCounter.set(msg.author.id, 5)
    }
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
        setDefault(author.id, legendId)
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
                message += `- ${legends[legend.legendId].emoji} **${legends[legend.legendId].name}**: ${stars} ${legend.legendId == defaults.get(msg.author.id, 0) ? "**(selected)**" : ""}\n`
            })
            message += `\n\nReact with the correct emoji to select it!`

            msg.author.send(message).then(function (msg) {
                var emojis = []

                inv.forEach(function (legend) {
                    msg.react(legends[legend.legendId].emoji)
                    emojis.push(legends[legend.legendId].emoji)
                    console.log("Reacted with: " + legends[legend.legendId].emoji)
                })

                client.on('messageReactionAdd', function (messageReaction, user) {
                    if (messageReaction.message.author.id != user.id) {
                        var legend2
                        inv.forEach(function (legend) {
                            if (legends[legend.legendId].emoji == messageReaction.emoji.name) {
                                setDefault(user.id, legend.legendId)
                                legend2 = legend
                            }
                        })
                        user.send(`Successfully selected **${legends[legend2.legendId].name} ${legends[legend2.legendId].emoji}**!`)
                        msg.delete()
                    }
                })
            })
        }
        if (msg.deletable) {
            msg.delete()
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

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, false); // true for asynchronous
    xmlHttp.send(null);
}

client.on('message', function (msg) {
    /*
    httpGetAsync("https://instagram.com/tftcentral", function (msg) {
        var data = JSON.parse(msg.split("window._sharedData")[1].split(";")[0].replace(" = ", ""))['entry_data']['ProfilePage'][0]
        var followers = data['graphql']['user']['edge_followed_by']['count']
        client.channels.get("642886967100440591").setName(`Instagram followers: ${(followers / 1000 + "").split(".")[0] + ((followers / 1000 + "").split(".")[1].substring(0, 1) > 0 ? "." + (followers / 1000 + "").split(".")[1].substring(0, 1) : "")}k`)
    })*/
    client.channels.get("642884636539879443").setName(`Discord users: ${client.channels.get("642884636539879443").guild.memberCount}`)
})

client.login(process.env.TOKEN);