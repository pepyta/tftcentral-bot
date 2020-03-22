const Discord = require('discord.js')
const client = new Discord.Client()

const express = require('express')
const app = express()

const inventory = require('data-store')({ path: 'inventory.json' })
const defaults = require('data-store')({ path: 'defaults.json' })
const messageCounter = require('data-store')({ path: 'messageCounter.json' })
const legends = require('./legends')

const champions = require('./modules/champions')
const swear = require('./modules/swear')
const emojiStrip = require('emoji-strip')

const SERVER_ID = '642389197239353354'
const GENERAL_CHANNEL = '642469846155788288' // #general

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

app.get("/", (request, response) => {
    response.sendStatus(200)
})
app.listen(8080)

client.on('message', function (msg) {
    if (!msg.content.startsWith('!test')) return
    let guild = client.guilds.get('596789121729429524')

    if (guild.member(msg.member.id)) {
        msg.member.addRole('655727992617566237')
    }
})


/*
Anti-swear system autoban
*/
client.on('message', function (msg) {
    if (!swear.filter(msg.content)) return;

    msg.channel.send(swear.generateEmbed(msg.author.id)).then((msg2) => {
        setTimeout(() => {
            if (!msg2.deletable) return
            msg2.delete()
        }, 10000);

        if (swear.checkIfBanNeeded(msg.author.id)) {
            msg.member.ban({
                reason: "Anti-swear system autoban"
            })
        }
    })

    if (msg.deletable) {
        msg.delete()
    }
})


/*
    Send TFT champions in chat 
*/
client.on('message', function (msg) {
    if (!msg.content.includes('{') || !msg.content.includes('}')) return
    champions.generateEmbed(msg.content.substring(msg.content.indexOf('{') + 1, msg.content.indexOf('}'))).then(function (result) {
        if (!result) return
        msg.channel.send(result)
    })
})

/*
    Tacter role
*/
client.on('guildMemberAdd', function (member) {
    let guild = client.guilds.get('596789121729429524')

    if (guild.member(member.id)) {
        member.addRole('655727992617566237')
    }
})

client.on('message', function (msg) {
    if (msg.author.id != '230740886273654786') return
    if (!msg.content.startsWith('!bot-send')) return
    msg.channel.send(msg.content.replace('!bot-send', ''))
})

client.on('message', function(msg){
    if(!msg.content.startsWith('!joinTest')) return
    var member = msg.member
    var legendId = generatePool()[parseInt(Math.random() * pool.length, 10)]

    member.user.send(`Hello ${member.displayName}!\n\nWelcome to the **TFTCentral**'s official Discord server! I'm the server's bot or some would say little helper. I will guide you through the server's mysteries. First of all you should read everything in the #welcome channel. You will have time for it as you will have to wait 90 seconds until you can reach the other channels. We have dedicated channels for dedicated purposes. Their names are pretty meaningful, but if you have any questions just ask some of the moderators or admins.\n\nFirst everyone is getting a free little legend when they join the server.\nYour first little legends is a **${legends[legendId].name}**!\nGotcha! It's a nice catch, congratulations!\n\nI hope you will have a nice day!\nGLHF summoner!`)
    addLittleLegend(legendId, member.user)
    member.addRole('644284912865771541')
})

client.on('guildMemberAdd', function (member) {
    var legendId = generatePool()[parseInt(Math.random() * pool.length, 10)]

    member.user.send(`Hello ${member.displayName}!\n\nWelcome to the **TFTCentral**'s official Discord server! I'm the server's bot or some would say little helper. I will guide you through the server's mysteries. First of all you should read everything in the #welcome channel. You will have time for it as you will have to wait 90 seconds until you can reach the other channels. We have dedicated channels for dedicated purposes. Their names are pretty meaningful, but if you have any questions just ask some of the moderators or admins.\n\nFirst everyone is getting a free little legend when they join the server.\nYour first little legends is a **${legends[legendId].name}**!\nGotcha! It's a nice catch, congratulations!\n\nI hope you will have a nice day!\nGLHF summoner!`)
    addLittleLegend(legendId, member.user)
    member.addRole('644284912865771541')
})

function generatePool() {
    // Only generate little legend for less hen 3 star units
    var pool = []
    for (var i = 0; i < legends.length; i++) {
        pool.push(i)
    }

    // only in December add winter emojis
    var d = new Date()
    if (d.getMonth() != 11) {
        for (var i = 0; i < pool.length; i++) {
            if (pool[i] >= 8 && pool[i] <= 10) {
                pool.splice(i, 1)
            }
        }
    }

    // only add Valentine's day emojis in February
    if (d.getMonth != 1) {
        for (var i = 0; i < pool.length; i++) {
            if (pool[i] == 11) {
                pool.splice(i, 1)
            }
        }
    }

    var inv = inventory.get(msg.author.id, [])
    inv.forEach(function (elem) {
        if (elem.level == 3) {
            for (var i = 0; i < pool.length; i++) {
                if (pool[i] == elem.legendId) {
                    pool.splice(i, 1)
                }
            }
        }
    })

    return pool
}

client.on('message', function (msg) {
    if (msg.author.id == client.user.id) return // Don't give TFTCentral any more little legend!
    //if (msg.author.id != 230740886273654786) return
    var value = messageCounter.get(msg.author.id, undefined)
    if (value) {
        value--
        if (value == 0) {
            var pool = generatePool()

            if (pool.length == 0) return // Don't generate more little legend when you have them all already
            var legendId = pool[parseInt(Math.random() * pool.length, 10)]


            msg.author.send(`Congratulations! You've just got a new Little Legend!\nThe eggs content is: **${legends[legendId].name}**\nKeep on being active and you'll recive more rewards!\n`).catch(function () {
                msg.channel.send(`Congratulations! You've just got a new Little Legend!\nThe eggs content is: **${legends[legendId].name}**\nKeep on being active and you'll recive more rewards!\n`).then(function (msg) {
                    setTimeout(msg.delete, 10000)
                })
            })
            addLittleLegend(legendId, msg.author)
            value = 45
        }
        messageCounter.set(msg.author.id, value)
    } else {
        messageCounter.set(msg.author.id, 14)
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

    var shouldUpdate = false
    if (has) {
        inv.forEach(function (elem) {
            if (elem.legendId == legendId) {
                if (elem.level > 2) {
                    author.send("Ewh crap, you already have this little legend :/")
                    return
                }
                elem.level++
                if (elem.legendId == defaults.get(author.id, -1)) {
                    shouldUpdate = true
                }

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
    if (shouldUpdate) {
        setDefault(author.id, legendId)
    }
}

function setDefault(userId, legendId) {
    defaults.set(userId, legendId)
    var inv = inventory.get(userId, [])
    var id = '644284912865771541'
    var emoji = legends[legendId].emoji
    inv.forEach(function (elem) {
        // 1 star: 644284912865771541
        // 2 star: 644284951403036678
        // 3 star: 644285009494016013
        if (elem.legendId == legendId) {
            if (elem.level == 2) {
                id = '644284951403036678'
            } else if (elem.level == 3) {
                id = '644285009494016013'
            }
        }
    })

    // Remove roles then add it
    var currentUser = client.guilds.get(SERVER_ID).members.get(userId)
    currentUser.removeRole('644284912865771541').then(function () {
        currentUser.removeRole('644284951403036678').then(function () {
            currentUser.removeRole('644285009494016013').then(function () {
                currentUser.addRole(id)
            })
        })
    })

    /*
    var counter = 0
    legends.forEach(function(legend){
        currentUser.removeRole(legend.role).then(function(){
            counter++
            if(counter == legends.length){
                currentUser.addRole(legends[legendId].role)
            }
        })
    })
    */

    assignLittleLegendRole(currentUser, legends, 0, legendId).then(function (result) { console.log("Successfully updated roles") })
    var name = `${emojiStrip(currentUser.displayName).trim()} ${emoji}`
    currentUser.setNickname(name).catch(function () { console.log("Admin tried to change nickname") })
}

function assignLittleLegendRole(currentUser, legends, legendId, pickedLittleLegend) {
    return new Promise(function (resolve, reject) {
        if (legendId < legends.length) {
            if (currentUser.roles.has(legends[legendId].role)) {

                currentUser.removeRole(legends[legendId].role).then(function () {
                    assignLittleLegendRole(currentUser, legends, legendId + 1, pickedLittleLegend).then(function () {
                        resolve()
                    })
                }).catch(function () {
                    assignLittleLegendRole(currentUser, legends, legendId, pickedLittleLegend).then(function () {
                        resolve()
                    })
                })
            } else {
                assignLittleLegendRole(currentUser, legends, legendId + 1, pickedLittleLegend).then(function () {
                    resolve()
                })
            }
        } else {
            currentUser.addRole(legends[pickedLittleLegend].role).then(function () {
                resolve("done")
            }).catch(function () {
                assignLittleLegendRole(currentUser, legends, legendId, pickedLittleLegend).then(function () {
                    resolve()
                })
            })
        }
    })
}

client.on('message', function (msg) {
    if (!msg.content.startsWith("!ranklist")) return
    const allInv = inventory.get()

    var ranks = []
    console.log(allInv)
    Object.keys(allInv).forEach(function (key) {
        if (key != client.user.id && key != 520994932828143639) {
            var sum = 0
            allInv[key].forEach(function (legend) {
                sum += legend.level
            })

            ranks.push({
                id: key,
                value: sum
            })
        }
    })

    ranks.sort(function (a, b) {
        return b.value - a.value
    })

    if (msg.deletable) {
        msg.delete()
    }
    msg.channel.send({
        embed: {
            title: "Ranklist",
            description: `🥇 **${client.guilds.get(SERVER_ID).members.get(ranks[0].id).displayName}** (${ranks[0].value} little legends)\n
            🥈 **${client.guilds.get(SERVER_ID).members.get(ranks[1].id).displayName}** (${ranks[1].value} little legends)\n
            🥉 **${client.guilds.get(SERVER_ID).members.get(ranks[2].id).displayName}** (${ranks[2].value} little legends)`
        }
    })
})

client.on('message', function (msg) {
    if (!msg.guild) return
    const legendId = defaults.get(msg.author.id, -1)
    if (legendId < 0) {
        msg.member.setNickname(`${emojiStrip(msg.member.displayName).trim()}`).catch(function () { console.log("Admin tried to change nickname") })
    } else {
        msg.member.setNickname(`${emojiStrip(msg.member.displayName).trim()} ${legends[legendId].emoji}`).catch(function () { console.log("Admin tried to change nickname") })
    }
})

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

client.on('message', function (msg) {
    if (msg.content.startsWith('!about')) {
        msg.channel.send({
            embed: {
                author: {
                    name: client.user.username,
                    url: "https://newhope.hu",
                    icon_url: ""
                },
                color: 5663164,
                fields: [{
                    name: "Username",
                    value: client.user.username,
                    inline: true
                }, {
                    name: "Version",
                    value: "TFTCentral Bot v" + require('./package.json').version,
                    inline: true
                }, {
                    name: "Developer",
                    value: "Gál Péter (pepyta)",
                    inline: true
                }, {
                    name: "GitHub",
                    value: "[https://github.com/pepyta/tftcentral-bot](https://github.com/pepyta/tftcentral-bot)",
                    inline: true
                }],
                thumbnail: {
                    url: client.user.displayAvatarURL
                }
            }
        })
    }
})

client.on('guildMemberAdd', function (member) {
    // Remove emojis on joining the server
    member.setNickname(emojiStrip(member.displayName))
})

client.on('message', function (msg) {
    if (msg.content.startsWith("!legend")) {
        var inv = inventory.get(msg.author.id, [])
        if (inv.length == 0) {
            msg.author.send(`I'm sorry but you don't have any little legend yet!`).catch(function () {
                msg.channel.send(`Enable server DM's in order to use this function!`).then(function (msg) {
                    setTimeout(msg.delete, 10000)
                })
            })
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
            }).catch(function () {
                msg.channel.send(`Enable server DM's in order to use this function!`).then(function (msg) {
                    setTimeout(msg.delete, 10000)
                })
            })
        }
        if (msg.deletable) {
            msg.delete()
        }
    }
})


client.on('messageReactionAdd', function (messageReaction, user) {
    var inv = inventory.get(user.id, [])
    if (client.user.id == user.id) return
    if (messageReaction.message.author.id != client.user.id) return
    var legend2
    inv.forEach(function (legend) {
        if (legends[legend.legendId].emoji == messageReaction.emoji.name) {
            setDefault(user.id, legend.legendId)
            legend2 = legend
        }
    })

    if (messageReaction.message.deletable) {
        messageReaction.message.delete()
    }

    if (!legend2) return // Fix possible bad emoji
    user.send(`Successfully selected **${legends[legend2.legendId].name} ${legends[legend2.legendId].emoji}**!`)
    setDefault(user.id, legend2.legendId)
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

var lastGm
setInterval(function () {
    var d = new Date()
    if (d.getHours() == 7 && (!lastGm || lastGm.getDate() != d.getDate())) {
        client.channels.get("642469846155788288").send(`Good morning everyone! ☕`)
        lastGm = d
    }
}, 10000)

var tips = require('./tips')
var noSpamTip = 0
client.on('message', function (msg) {
    if (msg.channel.id == GENERAL_CHANNEL) {
        noSpamTip++
        if (noSpamTip > 20) {
            var pos = parseInt(Math.random() * tips.length, 10)
            client.channels.get(GENERAL_CHANNEL).send({
                "embed": {
                    "title": "Tip",
                    "color": 16312092,
                    "description": tips[pos]
                }
            })
            noSpamTip = 0
        }

    }
})

client.on('message', function (msg) {
    client.channels.get("642884636539879443").setName(`Discord users: ${client.channels.get("642884636539879443").guild.memberCount}`)
})

client.login(process.env.TOKEN);
