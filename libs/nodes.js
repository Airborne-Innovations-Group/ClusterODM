const Node = require('./classes/Node');
const fs = require('fs');
const logger = require('./logger');
let nodes = [];
let initialized = false;

module.exports = {
    initialize: async function(){
        if (initialized) throw new Error("Already initialized");

        await this.loadFromDisk();
        this.updateInfo();
        logger.info(`Loaded ${nodes.length} nodes`);

        setInterval(() => {
            this.updateInfo()
        }, 60 * 1000);

        initialized = true;
    },

    add: function(hostname, port, token){
        if (!hostname || !port) return false;

        if (!nodes.find(n => n.hostname === hostname && n.port === port)){
            const node = new Node({hostname, port, token, info: {}});
            nodes.push(node);
            this.saveToDisk();
            return node;
        }else{
            return false;
        }
    },

    remove: function(node){
        if (node){
            nodes = nodes.filter(n => n !== node);
            this.saveToDisk();
            return true;
        }else{
            return false;
        }
    },

    all: function(){
        return nodes;
    },

    nth: function(n){
        n = parseInt(n);
        if (isNaN(n)) return null;

        n -= 1;
        if (n >= 0 && n < nodes.length){
            return nodes[n];
        }else return null;
    },

    online: function(){
        return nodes.filter(n => n.isOnline());
    },

    updateInfo: async function(){
        return await Promise.all(nodes.map(n => n.updateInfo()));
    },

    // Reference node is the one used to generate
    // node information for the proxy (for example,
    // when returning calls to /info or /options)
    referenceNode: function(){
        return nodes.find(n => n.isOnline());
    },

    findBestAvailableNode: function(numImages){
        const candidates = onlineNodes.filter(n => n.isOnline() && 
                                                   (n.getInfo().maxImages < 0 || n.getInfo().maxImages >= numImages));
        let scores = candidates.map(n => {
            return {
                node: n, 
                score: (n.getInfo().maxParallelTasks - n.getInfo().taskQueueCount)
            } 
        });

        // TODO: sort scores, choose best.
    },

    saveToDisk: async function(){
        return new Promise((resolve, reject) => {
            fs.writeFile('data/nodes.json', JSON.stringify(nodes), (err) => {
                if (err){
                    logger.warn("Cannot save nodes to disk: ${err.message}");
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    },

    loadFromDisk: async function(){
        return new Promise((resolve, reject) => {
            fs.exists("data/nodes.json", (exists) => {
                if (exists){
                    fs.readFile("data/nodes.json", (err, json) => {
                        if (err){
                            logger.warn("Cannot read nodes from disk: ${err.message}");
                            reject(err);
                        }else{
                            const nodesjson = JSON.parse(json);
                            nodes = nodesjson.map(n => new Node(n));
                            resolve();
                        }
                    });
                }else{
                    resolve();
                }
            });
        });
    },

    cleanup: async function(){
        try{
            await this.saveToDisk();
            logger.info("Saved nodes to disk");
        }catch(e){
            logger.warn(e);
        }
    }
};