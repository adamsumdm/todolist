const headers = require('./headers');

function errorHandler(response, message) {

    response.writeHead(400, headers);
    response.write(JSON.stringify({
        "status": "false",
        "message": message,
    }));
    response.end();
};

module.exports = errorHandler;