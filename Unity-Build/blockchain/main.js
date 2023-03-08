let galacticWarContract;
const gwContractAddress = "0xdf7c5d154bA1E7ae19f73ef62935367b22d4D382";
window.building_data = { address: "", buil: [] }

async function load() {
    let jsonFile = await fetch('/blockchain/Maingame.json')
    let abi = (await jsonFile.json()).abi;
    galacticWarContract = await new window.web3.eth.Contract(abi, gwContractAddress);
}

window.connect = async function() {

    if (typeof window.ethereum == 'undefined') {
        alert("Please install metamask")
        return
    }
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
    });
    window.web3 = new Web3(ethereum);
    window.accounts = accounts[0];
    await load();
    myGameInstance.SendMessage("RTS_Camera", "onConnect");
    window.userdata()
};

window.openMarketPlace = () => {
    window.open("https://warmarket.b-cdn.net/");
};

window.startgame = async function() {
    await galacticWarContract.methods.startgame().send({
        from: window.accounts
    })
    myGameInstance.SendMessage('RTS_Camera', 'onDone');
};

let graphkey = {
    0: "miner",
    1: "cannon",
    2: "xbow",
    3: "tesla",
    4: "archer",
    5: "robot",
    6: "valkyriee",
};
const keys = Object.keys(graphkey);
keys.forEach((item, i) => {
    window[graphkey[item]] = 0;
});

window.collectwin = async function(buildingamount) {
    setTimeout(async() => {
        if (buildingamount <= 0) {
            myGameInstance.SendMessage("Button_AD", "showData");
            return
        }
        await galacticWarContract.methods.endwar(buildingamount).send({
            from: window.accounts
        });
        myGameInstance.SendMessage("Button_AD", "showData");
    }, 6500)
};

window.savegame = async function(str) {

    let tee = JSON.parse(str);
    let test = [0, 0, 0, 0]
    for (let i = 0; i < tee.buil.length; i++) {
        let bi = tee.buil[i].buildingIndex
        if (bi < 4) {
            test[bi] = test[bi] + 1
        }
    }

    let miner_id = 0
    if (window.data.user.minerid && window.data.user.minerid.id) {
        miner_id = window.data.user.minerid.id
    }

    await galacticWarContract.methods.lockBase(test, miner_id).send({
        from: window.accounts
    })

    let data = JSON.parse(str)
    data.address = window.accounts
    await fetch('https://rts-api.onrender.com/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    myGameInstance.SendMessage("syncButton", "onSave");
};

window.fetchWar = async function() {
    let building_data = await (await fetch(`https://rts-api.onrender.com/random/${window.accounts}`)).json()
    myGameInstance.SendMessage("WarManager", "onWarData", JSON.stringify(building_data));
}


window.userdata = async function() {

    let query = `query($id: String!) {
    user(id:$id){
        nfts{
          id
          owner {
            id
          }
          locked
          amount
          nft{
            id
            nftid
          }
 
        }
        aureus
        minerid {
          id
          locked
        }
        townhall
      }
  }`
    let variables = {
        id: window.accounts.toLowerCase()
    }

    let data = (await (await fetch('https://api.thegraph.com/subgraphs/name/harshu4/galacticwar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    })).json()).data

    window.data = data

    if (data.user == null || data.user.townhall == null) {
        myGameInstance.SendMessage('RTS_Camera', 'onNewUser');
    } else {
        if (data.user.minerid != null) {
            if (data.user.minerid.locked == false) {
                window.miner = 1;
            }
        }
        window.aureus = data.user.aureus
        for (let i = 0; i < data.user.nfts.length; i++) {
            window[graphkey[parseInt(data.user.nfts[i].nft.id)]] = parseInt(data.user.nfts[i].amount) - parseInt(data.user.nfts[i].locked)
        }

        let building_data = await (await fetch(`https://rts-api.onrender.com/${window.accounts}`)).json()
        if (!building_data.address) {
            console.log("No buildings found!")
            building_data = { address: "", buil: [] }
        }
        window["townhall"] = 1
        for (let bd in building_data.buil) {
            if (bd.buildingIndex == 4) {
                window["townhall"] = 0
            }
        }
        window.building_data = JSON.stringify(building_data)

        myGameInstance.SendMessage("RTS_Camera", "onDone");
    }
};