# Frontend
## Development

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


## Deployment
### Create a bucket

- Create a bucket named purchasing-power using the default settings.
- In the page of the bucket, in the "Properties" tab, enable "Static website hosting" and set the index document and the error document to index.html.
- Then allow public access and add a bucket policy to allow public read access to the objects in the bucket: follow this quick [guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteAccessPermissionsReqd.html#bucket-policy-static-site).


### Build the app

In the frontend's dev Docker container, run this below and the static files will appear in the `dist` directory at the root of the Vite app directory.
```bash
npm run build /app/frontend/app
```


### Upload the build files to the bucket

Upload the contents of the `dist` directory (not the directory itself, just its contents) to the bucket using the AWS Console.


