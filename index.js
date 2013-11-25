
/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , request = require('superagent')
  , marked = require('marked')
  , store = require('store')
  , classes = require('classes');

/**
 * Expose `MarkdownView`.
 */

module.exports = MarkdownView;

/**
 * Inherit from `Emitter`.
 */

Emitter(MarkdownView.prototype);

/**
 * MarkdownView.
 *
 * @param {String} url
 * @param {DOMElement} el
 * @return {MarkdownView}
 */

function MarkdownView(url, el) {
  if (!(this instanceof MarkdownView)) {
    return new MarkdownView(url, el);
  }

  this.url = url;
  this.el = el || document.createElement('article');
  classes(this.el).add('hide');

  // Default options
  this.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    smartLists: true,
    smartypants: true
  });

  request
    .get(url)
    .end(this.render.bind(this));

  return this;
}

/**
 * Expose `marked.setOptions`.
 */

MarkdownView.prototype.setOptions = marked.setOptions;

/**
 * Render.
 *
 * - Uses localStorage to cache the parsed result.
 * - Error-messages from superagent are used as is.
 *
 * @param {Response} res
 * @return void
 */

MarkdownView.prototype.render = function(res) {
  var el = this.el
    , url = this.url
    , html = '';

  switch (res.status) {
    case 304:
      html = store(url);
      break;
    case 200:
      html = marked(res.text);
      store(url, html);
      break;
    default:
      html = '<h3>' + res.error + '</h3>';
  }

  if (res.ok) {
    el.innerHTML = html;
  }

  classes(el).remove('hide');
  this.emit('load');
};

