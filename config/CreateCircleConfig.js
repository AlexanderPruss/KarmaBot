const fs = require('fs');

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

async function main () {
    fs.writeFile('config/circleci.json', `
    {
  "slack": {
    "appId": "${process.env.appId}",
    "clientId": "${process.env.clientId}",
    "clientSecret": "${process.env.clientSecret}",
    "signingSecret": "${process.env.signingSecret}",
    "botSecret" : "${process.env.botSecret}"
  },
  "mongo": {
    "connectionString": "${process.env.cloudAtlasConnection}"
  }
}`);
    await sleep(1000);
}

main();
