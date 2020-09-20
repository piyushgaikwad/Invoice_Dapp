module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "5777",
            gas: 6000000,
        },
        rinkeby: {
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            network_id: 4,
            gas: 4612388 // Gas limit used for deploys
        },
        rpc: {
            host: 'localhost',
            post:8080
        }
    }
};