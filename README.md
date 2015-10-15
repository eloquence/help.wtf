# help.wtf: what is this I don't even

help.wtf is a cheatsheet service.

It operates on the basis of JSON files with markdown and syntax highlighting support.

help.wtf is pretty minimalist:
- koa, which doesn't really do anything
- no database, it's all loaded into memory
- no auth (yet, we might add favstars or something)
- no client side JS libraries, except for the composer
  (which uses bootstrap + json-editor)

Want to contribute your own cheatsheets? Visit http://help.wtf/_compose to use
the composer, or just submit a pull request.

To install locally:
- You need Node.js 4+ since we're using fancy ES6 features
- Run `npm install` to fetch required dependencies
- `node index.js [port]` to launch the service (default port is 8000)
- Use gulp to launch under nodemon if so desired.

Ensure the queue/ directory is writable by the node process if you'd like
to accept submissions through the /_compose command.