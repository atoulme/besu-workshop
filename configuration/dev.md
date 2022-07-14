# Run Hyperledger Besu on the dev network:

```
$> bin/besu --network=dev --rpc-http-enabled --rpc-http-cors-origins=localhost,chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn
```

## Use Curl:

Use curl to request the balance of an account:

```
$> curl http://localhost:8545/ \                                     
  -X POST \
  -H "Content-Type: application/json" \
  --data '{
           "method":"eth_getBalance",
           "params":["0x627306090abaB3A6e1400e9345bC60c78a8BEf57", "latest"],
           "id":1,
           "json-rpc":"2.0"
         }'
```

JSON-RPC will return something like:
```
{
  "jsonrpc" : "2.0",
  "id" : 1,
  "result" : "0x130ee8e7179044400000"
}
```

## Use MetaMask:

In MetaMask, select the network "localhost 8545".