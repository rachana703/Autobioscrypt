var Autobioscrypt = artifacts.require('./Autobioscrypt')

module.exports = function (deployer) {
  deployer.deploy(Autobioscrypt);
};