const { Agent, setGlobalDispatcher } = require('undici');
setGlobalDispatcher(new Agent({ headersTimeout: 1200000, bodyTimeout: 1200000 }));
console.log("Undici agent configured!");
