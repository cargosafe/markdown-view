
# markdown-view

  Load and parse markdown on the client.

## Installation

  Install with [component(1)](http://component.io):

    $ component install cargosafe/markdown-view

## API

```javascript
var view = new MarkdownView(url, [el])
content.appendChild(view.el)
```

The parsed result is stored in `localStorage` and used from `localStorage`
if the request is `(302) not modified`.

## License

  MIT
