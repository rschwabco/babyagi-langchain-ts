# BabyAGI with LangChain (Typescript) and Pinecone

Based on the [LangChain](https://python.langchain.com/en/latest/index.html) [Python implementation](https://python.langchain.com/en/latest/use_cases/agents/baby_agi.html?highlight=babyagi) of [BabyAGI](https://github.com/yoheinakajima/babyagi/tree/main) by [Yohei Nakajima](https://twitter.com/yoheinakajima)

## How to run

1. Create an OpenAI and Pinecone accounts.
2. Create a `babyagi` index in Pinecone
3. Create a `.env` file based on the `.env.example` file and update your keys
4. Run `npm install`
5. Run `npm run local:watch`

## TODO

- [ ] Add tool support to `executeTask`
- [ ] Add tests
- [ ] Create a UI
