# Create the contract!

```
val code = Code(
      buildList {
        this.add(Push(Bytes.fromHexString("0x00")))
        this.add(CallDataLoad) // load from position 0
        this.add(Custom(Bytes.fromHexString("0xf6"), "SHAREDSECRET", 1, 1))
        this.add(Push(Bytes.fromHexString("0x11"))) // push jump destination
        this.add(Jumpi) // if custom returns 0, keep going, else go to jumpdest at byte 0x11
        this.add(Push(Bytes.fromHexString("0x00"))) // value
        this.add(Push(Bytes.fromHexString("0x00"))) // location
        this.add(Mstore) // store 0 in memory
        this.add(Push(Bytes.fromHexString("0x01"))) // length
        this.add(Push(Bytes.fromHexString("0x1f"))) // location
        this.add(Return) // return 0
        this.add(JumpDest)
        this.add(Push(Bytes.fromHexString("0x01"))) // value
        this.add(Push(Bytes.fromHexString("0x00"))) // location
        this.add(Mstore) // store 1 in memory
        this.add(Push(Bytes.fromHexString("0x01"))) // length
        this.add(Push(Bytes.fromHexString("0x1f"))) // location
        this.add(Return)
      }
    )
    assertNull(code.validate()?.error)
    println(code.toString())
    println(code.toBytes().toHexString())

    // surround with instructions to deploy.
    val deployment = Code(
      buildList {
        this.add(Push(Bytes32.rightPad(code.toBytes()))) // pad the code with zeros to create a word
        this.add(Push(Bytes.fromHexString("0x00"))) // set the location of the memory to store
        this.add(Mstore)
        this.add(Push(Bytes.ofUnsignedInt(code.toBytes().size().toLong()))) // length
        this.add(Push(Bytes.fromHexString("0x00"))) // location
        this.add(Return) // return the code
      }
    )

    println(deployment.toBytes().toHexString())
```

Here is the code we are producing:
```
0x600035f660115760006000526001601ff35b60016000526001601ff3
```

Now with the deployment wrapper:
```
0x7f600035f660115760006000526001601ff35b60016000526001601ff300000000600052630000001c6000f3
```

# Create the signed transaction

```
$> node deploy.js
```

# Start Besu:
```
/Users/atoulme/w/besu/build/distributions/besu-22.7.0-RC2-SNAPSHOT/bin/besu --genesis-file=genesis.json --rpc-http-enabled --rpc-http-cors-origins=localhost,chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn --Xshared-secret="the quick brown fox" --miner-enabled --miner-coinbase 0xfe3b557e8fb62b89f4916b721be55ceb828dbd73
```

# Deploy the contract

Deploy the contract:
```
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x02f885820539018459682f008459682f0e83024a228080ac7f600035f660115760006000526001601ff35b60016000526001601ff300000000600052630000001c6000f3c001a005d6db58fccc59c2079bddc779db35d344da037482e501c7c0ef17b2b1405b2ca01dc59fe6d3c40831bf60fa4bcce0226aa28b3f372d19d6de192389229454c50f"],"id":1}'
```

Get the transaction receipt - replace the transaction hash:
```
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["0x870dae9321ed591f8499d85598e6d6ff03a5520b2805c4330fb9b0469e82f9de"],"id":1}' http://localhost:8545
```
Check the right code was deployed:
```
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_getCode","params":["0xa50a51c09a5c451c52bb714527e1974b686d8e77","latest"],"id":1,"jsonrpc":"2.0"}'
```

# Call the contract:

With no secret:

```
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_call","params":[{"from":null,"to":"0xa50a51c09a5c451c52bb714527e1974b686d8e77","data":"0x"}, "latest"],"id":1,"jsonrpc":"2.0"}'
```

Replace the data parameter with the keccak256 hash of "the quick brown fox", `0xd06412bc7d16d44130f6787324416250a8a9b72c5b18b7255d2deb93713ecea3`:

```
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_call","params":[{"from":null,"to":"0xa50a51c09a5c451c52bb714527e1974b686d8e77","data":"0xd06412bc7d16d44130f6787324416250a8a9b72c5b18b7255d2deb93713ecea3"}, "latest"],"id":1,"jsonrpc":"2.0"}'
```

# Change the shared secret!
Let's change it to "besu is awesome".

```
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_setSharedSecret","params":["besu is awesome"],"id":1,"jsonrpc":"2.0"}'
```

Now let's try it again.
The hash of "besu is awesome" is `0xe2544f96c2df180b46a909becfc024550e02029d344ac1ce243c85f0daf25285`:

```
curl http://localhost:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_call","params":[{"from":null,"to":"0xa50a51c09a5c451c52bb714527e1974b686d8e77","data":"0xe2544f96c2df180b46a909becfc024550e02029d344ac1ce243c85f0daf25285"}, "latest"],"id":1,"jsonrpc":"2.0"}'
```