const driver = require('bigchaindb-driver');

const node = 'http://localhost:9984/api/v1/';
const user = new driver.Ed25519Keypair();
const pk = user.publicKey;

const data = [
    {
        lat: 51.454110,
        lng: 7.010362,
        id: "0x01",
        price: 1,
        plugType: 1,
        contractType: 1
    },
    {
        lat: 51.452133,
        lng: 7.013019,
        id: "0x02",
        price: 2,
        plugType: 2,
        contractType: 2
    }
];

const transactions = data.map(doc => {
    const condition = driver.Transaction.makeEd25519Condition(user.publicKey);
    const output = [driver.Transaction.makeOutput(condition)];
    const what = { what: doc.id };
    return driver.Transaction.makeCreateTransaction(doc, what, output, pk);
});

// console.log('transactions:', transactions);

const signedTxs = transactions.map(tx => driver.Transaction.signTransaction(tx, user.privateKey));

// console.log('signedTxs:', signedTxs);

const conn = new driver.Connection(node);
// console.log(conn);

signedTxs.forEach(async tx => {
    try {
        console.log('posting', tx.id);
        const postResult = await conn.postTransaction(tx);
        const retrievedTx = await conn.pollStatusAndFetchTransaction(tx.id);
        console.log('successfully posted:', retrievedTx.id);
    } catch (err) {
        console.log('err:', err);
    }

});