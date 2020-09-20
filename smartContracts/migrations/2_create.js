var Calero = artifacts.require("./CaleroMain.sol");
var Company = artifacts.require("./Company.sol");
var Invoice = artifacts.require("./Invoice.sol");

var createEntities = function(Calero) {
    calero.createCompany(1, "seller", "address11", "address12", "city1", "postalCode1", { from: web3.eth.accounts[1] });
    calero.createCompany(1, "payer", "address22", "address22", "city2", "postalCode2", { from: web3.eth.accounts[2] });
}

module.exports = function(deployer) {
    Calero.deployed().then(createEntities);
};
