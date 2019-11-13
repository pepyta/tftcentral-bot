var champs = []
champions.forEach(function(champion){
    if(champs[champion['cost']] == undefined){
        champs[champion['cost']] = []
    }
    champs[champion['cost']].push(champion)
})

champs.forEach(function(cost){
    
    document.getElementById('champions').innerHTML += `
    <div id="champions-by-cost-${cost[0]['cost']}>${cost[0]['cost']}</div>`
    cost.forEach(function(champ){
        
    })
})