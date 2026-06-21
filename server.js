const http = require('node:http');
const { v4: uuid4 } = require('uuid');
const headers = require('./headers');
const errorHandler = require('./errorHandler');
const successHandler = require('./successHandler');
// 代辦事件清單陣列
const todos = [];
/*
* 解析 url，取出 id
* @param url
*/
const foundIndex = url => {
    const id = url.split('/').pop();
    const foundIndex = todos.findIndex(element => element.id === id);
    return foundIndex;
};

const requestListener = (request, response) => {
    // 無論將交由哪一支 API 處理， 當 server 接到 request 請求當下，就啟動 data 事件，收取完整 raw json 資料
    if (request.url == '/todos' && request.method == 'GET') {

        response.writeHead(200, headers);
        response.write(JSON.stringify({
            "ststus": "success",
            "data": todos
        }));
        response.end();

    } else if (request.method == 'OPTIONS') {
        // preflight 機制會觸發
        successHandler(response, "preflight passed.");

    } else if (request.url == '/todos' && request.method == 'POST') {

        let body = [];
        // 接收 request 送進來的 body 內容
        request
            .on('data', chunk => {
                body.push(chunk);
            })
            .on('end', () => {
                try {
                    const rawBody = Buffer.concat(body).toString();
                    // 來源端將傳來JSON格式的物件資訊，該字串串流將可以用JSON工具解析（還原）處理
                    const title = JSON.parse(rawBody).title;
                    if (title !== undefined) {
                        // 取出 body 內容，包成代辦事項物件，存進伺服器記憶體的 todos 陣列中（佔一個 index）
                        const todo = {
                            "id": uuid4(),
                            "title": title
                        }
                        todos.push(todo);
                        successHandler(response, todos);

                    } else {
                        errorHandler(response);
                    }
                } catch {
                    errorHandler(response);
                }
            });

    } else if (request.url.startsWith('/todos/') && request.method == 'PATCH') {
        // 需要解析 raw json
        const index = foundIndex(request.url);
        if (index !== -1) {
            try {
                let body = [];
                request
                    .on('data', chunk => {
                        body.push(chunk);
                    })
                    .on('end', () => {
                        const title = JSON.parse(body).title;
                        if (title !== undefined) {
                            todos[index].title = title;
                            successHandler(response, todos);
                        } else {
                            errorHandler(response, "You need to write down the todo title instead.");
                        }
                    });
            } catch {
                errorHandler(response, "There's a problem about parsing raw data into JSON format.");
            }
        } else {
            errorHandler(response, "There's no match any title you want to update.");
        }

    } else if (request.url.startsWith("/todos/") && request.method == "DELETE") {

        if (foundIndex(request.url) !== -1) {
            todos.splice(foundIndex, 1);
            successHandler(response, todos);
        } else {
            errorHandler(response, "The title you want to delet does not exist.");
        }

    } else if (request.url == '/todos' && request.method == 'DELETE') {
        // 清空 todos
        todos.length = 0;
        successHandler(response, `There's nothing in todos: ${todos}`);

    } else {
        errorHandler(response, "No service, please check your end point of URL.");
    }
}

const server = http.createServer(requestListener);
server.listen(3005);