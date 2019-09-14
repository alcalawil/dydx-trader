const rp = require('request-promise');

// URIs - esto se supone que no lo vas a tocar @lucas
const BASE_URI = 'http://localhost:3000'
const MY_ORDERS_URI = BASE_URI + '/api/orders/myorders';
const GET_BID_URI = BASE_URI + '/api/orders/bid';
const GET_ASK_URI = BASE_URI + '/api/orders/ask';
const MY_FILLS_URI = BASE_URI + '/api/orders/myfills';

// Ordenes para poder testear el checkeo, estas se supone seran las o la orden que guardaremos en ram
const testOrders = [
    {
        "id": "0xc26dfea66f7a6b3e5bb07a3c3e2b57e06223e9d77098f7c747e4bb26e2094337",
        "pair": "ETH-DAI",
        "type": "SELL",
        "createdAt": "2019-09-13T20:52:06.483Z",
        "expiresAt": "2019-10-11T20:52:06.000Z",
        "price": 179.91,
        "amount": 50.8554,
        "status": "OPEN"
    },
    {
        "id": "0x2821151c0cc0097124508af421b2c4cbccc58e9f862924c9562e5f1261b2dee5",
        "pair": "ETH-DAI",
        "type": "BUY",
        "createdAt": "2019-09-13T20:52:06.483Z",
        "expiresAt": "2019-10-11T20:52:06.000Z",
        "price": 179.91,
        "amount": 50.8554,
        "status": "OPEN"
    },
    {
        "id": "0x2821151c0cc0097124508af421b2c4cbcerte58e9f862924c9562e5f1261b2dee5",
        "pair": "ETH-DAI",
        "type": "BUY",
        "createdAt": "2019-09-13T20:52:06.483Z",
        "expiresAt": "2019-10-11T20:52:06.000Z",
        "price": 180.91,
        "amount": 13.8554,
        "status": "OPEN"
    }
]
/* ----------------------   PARÁMETROS CONFIGURABLES ------------------------------  */
const SECONDS_INTERVAL = 10; // Cycle interval in seconds

/* ---------------------------------------------------------------------------------- */

const doPostRequest = async ({ uri, body = {} }) => {
    let response = null;
    try {
        response = await rp.post({
            uri,
            body,
            json: true
        });
    } catch (error) {
        console.log(`[${new Date().toISOString()}]`, error.message);
    }

    return response && response.body;
}

const doGetRequest = async ({ uri }) => {
    let response = null;
    try {
        response = await rp.get({
            uri,
            json: true
        });
    } catch (error) {
        console.log(`[${new Date().toISOString()}]`, error.message);
    }

    return response;
}

/* Esta funcion checkea y devuelve en un array las ordenes que siguen OPEN 
y otro array con las ordernes que estan FILLED o PARTIALLYFILL*/
const checkOrders = async () => {
    const fills = await doGetRequest({ uri: MY_FILLS_URI });
    const filledOrPartiallyFilledOrders = [];
    const openOrders = [];
    testOrders.map((order) => {
        const result = fills.filter((fill) => {
            if (order.id === fill.orderId)
                return true;
        });

        if (result.length > 0) {
            order.status = result[0].order.status;
            filledOrPartiallyFilledOrders.push(order);
        }
        else {
            openOrders.push(order);
        }
    });

    return { openOrders, filledOrPartiallyFilledOrders };
}

/*Esta funcion simplemente checkea una sola orden devolviendo un boolean*/
const checkFillOrPartiallyFillOrder = async (order) => {
    const fills = await doGetRequest({ uri: MY_FILLS_URI });
    const result = fills.filter((fill) => {
        if (order.id === fill.orderId)
            return true;
    });
    if (result.length > 0) {
        return true;
    }
    else {
        return false;
    }
}

setInterval(async () => {
    const bid = await doGetRequest({ uri: GET_BID_URI });
    const ask = await doGetRequest({ uri: GET_ASK_URI });
    // Checking many orders
    checkOrders().then(console.log);
    // Checking unfilled order 
    checkFillOrPartiallyFillOrder(testOrders[2]).then(console.log);
    // Checking filled order 
    checkFillOrPartiallyFillOrder(testOrders[0]).then(console.log);
    const orderFilled = fills.find((fill) => order.id === fill.orderId);
    
    if (orderFilled) {
        return true;
    }
    
    return false;
}

// setInterval(async () => {
//     // const bid = await doGetRequest({ uri: GET_BID_URI });
//     // const ask = await doGetRequest({ uri: GET_ASK_URI });
//     // Checking many orders
//     // checkOrders().then(console.log);
//     // Checking unfilled order 
//     console.log(await checkFillOrPartiallyFillOrder(testOrders[0])) ;
//     console.log(await checkFillOrPartiallyFillOrder(testOrders[1]));
//     console.log(await checkFillOrPartiallyFillOrder(testOrders[2]));
// }, SECONDS_INTERVAL * 1000);
