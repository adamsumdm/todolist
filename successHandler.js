const headers = require('./headers');

function successHandler(response, data) {
    response.writeHead(200, headers);
    response.write(JSON.stringify({
        "status": "success",
        "data": data,
    }));
    response.end();
}

module.exports = successHandler;
