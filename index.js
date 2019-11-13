const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');
const express = require('express');
const app = express();

const { XMLHttpRequest } = require('xmlhttprequest')
const emojiStrip = require('emoji-strip')

const legends = require('./legends')
const SERVER_ID = '642389197239353354'

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen(8080)


client.on('message', function (msg) {
    if (msg.author.id != 230740886273654786) return
    readData("messageCounter.json", msg.author.id).then(function (value) {
        if (value) {
            value--
            if (value == 0) {
                //var legendId = parseInt(Math.random() * legends.length, 10)
                // Only generate little legend for less hen 3 star units
                var pool = []
                for (var i = 0; i < legends.length; i++) {
                    pool.push(i)
                }

                readData("inventory.json", msg.author.id).then(function (inv) {
                    inv.forEach(function (elem) {
                        if (elem.level == 3) {
                            for (var i = 0; i < pool.length; i++) {
                                if (i == elem.legendId) {
                                    pool.splice(i, 1)
                                }
                            }
                        }
                    })
                })

                var legendId = pool[parseInt(Math.random() * pool.length, 10)]


                msg.author.send(`Congratulations! You've just got a new Little Legend!\nThe eggs content is: **${legends[legendId].name}**\nKeep on being active and you'll recive more rewards!\n`)
                addLittleLegend(legendId, msg.author)
                value = 10
            }
            updateData("messageCounter.json", msg.author.id, value)
        } else {
            updateData("messageCounter.json", msg.author.id, 5)
        }

    })
})

function addLittleLegend(legendId, author) {
    readData("inventory.json", author.id).then(function (inv) {
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

        readData("defaults.json", author.id).then(function(value){
            if(value == {} || value == legendId){
                setDefault(author.id, legendId)
            }
        })

        updateData("inventory.json", author.id, inv)
    })
}

function setDefault(userId, legendId) {
    updateData("defaults.json", userId, legendId)
    readData("inventory.json", userId).then(function (inv) {
        var id = '644285009494016013' // 3 star
        var emoji = legends[legendId].emoji
        inv.forEach(function (elem) {
            // 1 star: 644284912865771541
            // 2 star: 644284951403036678
            // 3 star: 644285009494016013
            if (elem.legendId == legendId) {
                if (elem.level == 1) {
                    644284912865771541
                } else if (elem.level == 2) {
                    id = '644284951403036678'
                } else if (elem.level == 3) {
                    id = '644285009494016013'
                }
            }
        })

        var currentUser = client.guilds.get(SERVER_ID).members.get(userId)
        currentUser.removeRole('644284912865771541')
        currentUser.removeRole('644284951403036678')
        currentUser.removeRole('644285009494016013')
        currentUser.addRole(id)

        var name = `${emojiStrip(currentUser.displayName)} ${emoji}`
        currentUser.setNickname(name)
    })
}

client.on('message', function (msg) {
    if (msg.author.id != 230740886273654786) return
    if (msg.content.startsWith('!addLittleLegend ')) {
        var content = msg.content.replace("!addLittleLegend ", "").split(" ")
        var userId = {
            id: content[0]
        }
        var legendId = content[1]

        addLittleLegend(legendId, userId)
    }
})

client.on('guildMemberAdd', function (member) {
    // Remove emojis on joining the server
    member.setNickname(emojiStrip(member.displayName))
})

client.on('message', function (msg) {
    if (msg.content.startsWith("!legend")) {
        readData("inventory.json", msg.author.id).then(function (inv) {

            if (inv.length == 0) {
                msg.author.send(`I'm sorry but you don't have any little legend yet!`)
            } else {
                var message = `Select which little legend do you want to use:\n`
                inv.forEach(function (legend) {
                    var stars = ""
                    for (var i = 0; i < legend.level; i++) {
                        stars += '⭐'
                    }
                    readData("default.json", msg.author.id).then(function(def){
                        message += `- ${legends[legend.legendId].emoji} **${legends[legend.legendId].name}**: ${stars} ${legend.legendId == def ? "**(selected)**" : ""}\n`
                    })
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

        })
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


function saveToFile(fileName, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(fileName, JSON.stringify(data), function (result, err) {
            if (err) reject(err)
            resolve(result)
        })
    })
}

function readFromFile(file, fallback) {
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(file)) {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) resolve({})
                resolve(JSON.parse(data))
            })
        } else {
            resolve(fallback)
        }
    })
}

function readData(file, key) {
    return new Promise(function (resolve, reject) {
        readFromFile(file, {}).then(function (result, err) {
            if (err) reject(err)

            resolve(result[key])
        })
    })
}

function updateData(file, key, value) {
    return new Promise(function (resolve, reject) {
        readFromFile(file, fallback).then(function (result, err) {
            if (err) reject(err)
            result[key] = value

            saveToFile(file, result).then(function (result, err) {
                if (err) reject(err)
                resolve(result)
            })
        })
    })
}
client.login(process.env.TOKEN);