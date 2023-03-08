const contract = "0xF5c053e0E9792EA6674C45E3fb5d1c364F450712"


async function buy(id, amount) {
    let jsonFile = await fetch('../Maingame.json')

    await window.connect();

    let abi = (await jsonFile.json()).abi;
    galacticWarContract = await new window.web3.eth.Contract(abi, contract);


    await galacticWarContract.methods.mintERC1155(id).send({
        from: window.accounts
    })
    alert("Buy Successfully")

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

};