const champions = require('../dataset/champions.json')
const traits = require('../dataset/traits.json')
const Fuse = require('fuse.js')

var tmp = {}
traits.forEach(function (elem) {
    tmp[elem.name] = elem
})

module.exports = {
    generateEmbed: function (championName) {
        var data = searchChampionData(championName)

        var fields = []

        data['tr'].forEach(function (trait) {
            fields.push({
                name: trait['name'],
                value: `${trait['innate'] ? `*Innate:* ${trait['innate']}\n*Description*: ` : ""}${trait['description']}`
            })
        })

        return {
            "embed": {
                "color": 5573598,
                "description": "**Cost:** "+data['cost'],
                "footer": {
                    "icon_url": "https://www.escharts.com/storage/app/uploads/public/5d2/355/0d1/5d23550d15183441256444.png",
                    "text": "Set 3"
                },
                "thumbnail": {
                    "url": "https://raw.githubusercontent.com/pepyta/tftcentral-bot/master/dataset/champions/"+ data['name'].split(" ").join("").toLowerCase() +".png"
                },
                "author": {
                    "name": data['name']
                },
                "fields": fields
            }
        }
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

    if(!result[0]) return

    result[0]['item']['traits'].forEach(function (trait) {
        result[0]['item']['tr'] = tmp[trait]
    })
    return result[0]['item']
}