var Calero = artifacts.require("./CaleroMain.sol");
var Company = artifacts.require("./Company.sol");
var Invoice = artifacts.require("./Invoice.sol");

module.exports = function(deployer) {
    deployer.deploy(Calero, "0x63447af77faaab3059c0b5f42c955ce136d054d4");
};
