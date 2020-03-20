const list = [
    "fuck",
    "cunt",
    "hoe",
    "nigger",
    "nigga",
    "ass",
    "bitch",
    "shit",
    "whore",
    "crap"
]

const max = 5
const file = require('data-store')({ path: 'moderation.json' })

module.exports = {
    filter: function (msg) {
        var found = false;
        list.forEach(function (elem) {
            if (msg.match(elem)) {
                found = true
                return
            }
        })
        return found;
    },
    generateEmbed: function (authorId) {
        file.set(authorId, file.get(authorId, 0)++)

        return {
            "embed": {
                "description": "You've used some of the forbidden words on the server. Please keep in mind that you are forbiddent to swear on this server.\n\nYou have **" + (5 - file.get(authorId, 0)) + "** warnings left before permaban!",
                "url": "https://discordapp.com",
                "color": 15597568,
                "author": {
                    "name": "Swear detection system",
                    "icon_url": "https://img.icons8.com/cute-clipart/344/warning-shield.png"
                }
            }
        }
    },
    checkIfBanNeeded: function(authorId){
        return file.get(authorId, 0) >= max;
    },
    maxWarning: max
}