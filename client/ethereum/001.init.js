Contracts = {}

if(typeof web3 != 'undefined'){
    console.log("Using web3 detected from external source like Metamask")
    web3 = new Web3(web3.currentProvider)
}else{
    web3 = new Web3(new Web3.providers.HttpProvider(Meteor.settings.public.geth.address));
    web3.personal.unlockAccount("0x627306090abaB3A6e1400e9345bC60c78a8BEf57", "", 150000, () => {});
    web3.personal.unlockAccount("0xf17f52151EbEF6C7334FAD080c5704D77216b732", "", 150000, () => {});
    web3.personal.unlockAccount("0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef", "", 150000, () => {});
    web3.personal.unlockAccount("0x821aEa9a577a9b44299B9c15c88cf3087F3b5544", "", 150000, () => {});
}
