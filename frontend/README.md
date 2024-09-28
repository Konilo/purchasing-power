# Frontend

The frontend is a React app created with Vite.
```bash
npm create vite@latest app -- --template react
cd app
npm install
```

For Windows: add this to the config to allow HMR with Docker & WSL2:
```js
server: {
    watch: {
      usePolling: true,
    },
  },
```
