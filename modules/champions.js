const champions = require('../dataset/champions.json')
const traits = require('../dataset/traits.json')
const Fuse = require('fuse.js')
var Vibrant = require('node-vibrant')

var tmp = {}
traits.forEach(function (elem) {
    tmp[elem.name] = elem
})

module.exports = {
    generateEmbed: function (championName) {
        return new Promise(function (resolve, reject) {

            var data = searchChampionData(championName)

            var fields = ""

            data['tr'].forEach(function (trait) {
                if(!trait) return
                fields += `\n\n**${trait['name']}**\n${`${trait['innate'] ? `*Innate:* ${trait['innate']}\n*Description*: ` : ""}${trait['description']}`}`
            })


            Vibrant.from("https://raw.githubusercontent.com/pepyta/tftcentral-bot/master/dataset/champions/" + data['name'].split(" ").join("").toLowerCase() + ".png").getPalette().then(function (palette) {
                resolve({
                    "embed": {
                        "color": parseInt(palette['LightVibrant'].hex.substring(1, 7), 16),
                        "description": "**Cost:** " + data['cost'] + fields,
                        "footer": {
                            "icon_url": "https://www.escharts.com/storage/app/uploads/public/5d2/355/0d1/5d23550d15183441256444.png",
                            "text": "Set 3"
                        },
                        "thumbnail": {
                            "url": "https://raw.githubusercontent.com/pepyta/tftcentral-bot/master/dataset/champions/" + data['name'].split(" ").join("").toLowerCase() + ".png"
                        },
                        "author": {
                            "name": data['name']
                        }
                    }
                })
            })
        })
    }
}

function searchChampionData(champion) {
    let options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 1,
        minMatchCharLength: 1,
        keys: [
            "name",
            "championId"
        ]
    }

    let fuse = new Fuse(champions, options)
    let result = fuse.search(champion)

    if (!result[0]) return
    result[0]['item']['tr'] = []

    result[0]['item']['traits'].forEach(function (trait) {
        result[0]['item']['tr'].push(tmp[trait])
    })
    return result[0]['item']
}