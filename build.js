
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-marked/lib/marked.js", Function("exports, require, module",
"/**\n\
 * marked - a markdown parser\n\
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)\n\
 * https://github.com/chjj/marked\n\
 */\n\
\n\
;(function() {\n\
\n\
/**\n\
 * Block-Level Grammar\n\
 */\n\
\n\
var block = {\n\
  newline: /^\\n\
+/,\n\
  code: /^( {4}[^\\n\
]+\\n\
*)+/,\n\
  fences: noop,\n\
  hr: /^( *[-*_]){3,} *(?:\\n\
+|$)/,\n\
  heading: /^ *(#{1,6}) *([^\\n\
]+?) *#* *(?:\\n\
+|$)/,\n\
  nptable: noop,\n\
  lheading: /^([^\\n\
]+)\\n\
 *(=|-){3,} *\\n\
*/,\n\
  blockquote: /^( *>[^\\n\
]+(\\n\
[^\\n\
]+)*\\n\
*)+/,\n\
  list: /^( *)(bull) [\\s\\S]+?(?:hr|\\n\
{2,}(?! )(?!\\1bull )\\n\
*|\\s*$)/,\n\
  html: /^ *(?:comment|closed|closing) *(?:\\n\
{2,}|\\s*$)/,\n\
  def: /^ *\\[([^\\]]+)\\]: *([^\\s]+)(?: +[\"(]([^\\n\
]+)[\")])? *(?:\\n\
+|$)/,\n\
  table: noop,\n\
  paragraph: /^([^\\n\
]+\\n\
?(?!hr|heading|lheading|blockquote|tag|def))+\\n\
*/,\n\
  text: /^[^\\n\
]+/\n\
};\n\
\n\
block.bullet = /(?:[*+-]|\\d+\\.)/;\n\
block.item = /^( *)(bull) [^\\n\
]*(?:\\n\
(?!\\1bull )[^\\n\
]*)*/;\n\
block.item = replace(block.item, 'gm')\n\
  (/bull/g, block.bullet)\n\
  ();\n\
\n\
block.list = replace(block.list)\n\
  (/bull/g, block.bullet)\n\
  ('hr', /\\n\
+(?=(?: *[-*_]){3,} *(?:\\n\
+|$))/)\n\
  ();\n\
\n\
block._tag = '(?!(?:'\n\
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'\n\
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'\n\
  + '|span|br|wbr|ins|del|img)\\\\b)\\\\w+(?!:/|@)\\\\b';\n\
\n\
block.html = replace(block.html)\n\
  ('comment', /<!--[\\s\\S]*?-->/)\n\
  ('closed', /<(tag)[\\s\\S]+?<\\/\\1>/)\n\
  ('closing', /<tag(?:\"[^\"]*\"|'[^']*'|[^'\">])*?>/)\n\
  (/tag/g, block._tag)\n\
  ();\n\
\n\
block.paragraph = replace(block.paragraph)\n\
  ('hr', block.hr)\n\
  ('heading', block.heading)\n\
  ('lheading', block.lheading)\n\
  ('blockquote', block.blockquote)\n\
  ('tag', '<' + block._tag)\n\
  ('def', block.def)\n\
  ();\n\
\n\
/**\n\
 * Normal Block Grammar\n\
 */\n\
\n\
block.normal = merge({}, block);\n\
\n\
/**\n\
 * GFM Block Grammar\n\
 */\n\
\n\
block.gfm = merge({}, block.normal, {\n\
  fences: /^ *(`{3,}|~{3,}) *(\\w+)? *\\n\
([\\s\\S]+?)\\s*\\1 *(?:\\n\
+|$)/,\n\
  paragraph: /^/\n\
});\n\
\n\
block.gfm.paragraph = replace(block.paragraph)\n\
  ('(?!', '(?!' + block.gfm.fences.source.replace('\\\\1', '\\\\2') + '|')\n\
  ();\n\
\n\
/**\n\
 * GFM + Tables Block Grammar\n\
 */\n\
\n\
block.tables = merge({}, block.gfm, {\n\
  nptable: /^ *(\\S.*\\|.*)\\n\
 *([-:]+ *\\|[-| :]*)\\n\
((?:.*\\|.*(?:\\n\
|$))*)\\n\
*/,\n\
  table: /^ *\\|(.+)\\n\
 *\\|( *[-:]+[-| :]*)\\n\
((?: *\\|.*(?:\\n\
|$))*)\\n\
*/\n\
});\n\
\n\
/**\n\
 * Block Lexer\n\
 */\n\
\n\
function Lexer(options) {\n\
  this.tokens = [];\n\
  this.tokens.links = {};\n\
  this.options = options || marked.defaults;\n\
  this.rules = block.normal;\n\
\n\
  if (this.options.gfm) {\n\
    if (this.options.tables) {\n\
      this.rules = block.tables;\n\
    } else {\n\
      this.rules = block.gfm;\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Expose Block Rules\n\
 */\n\
\n\
Lexer.rules = block;\n\
\n\
/**\n\
 * Static Lex Method\n\
 */\n\
\n\
Lexer.lex = function(src, options) {\n\
  var lexer = new Lexer(options);\n\
  return lexer.lex(src);\n\
};\n\
\n\
/**\n\
 * Preprocessing\n\
 */\n\
\n\
Lexer.prototype.lex = function(src) {\n\
  src = src\n\
    .replace(/\\r\\n\
|\\r/g, '\\n\
')\n\
    .replace(/\\t/g, '    ')\n\
    .replace(/\\u00a0/g, ' ')\n\
    .replace(/\\u2424/g, '\\n\
');\n\
\n\
  return this.token(src, true);\n\
};\n\
\n\
/**\n\
 * Lexing\n\
 */\n\
\n\
Lexer.prototype.token = function(src, top) {\n\
  var src = src.replace(/^ +$/gm, '')\n\
    , next\n\
    , loose\n\
    , cap\n\
    , item\n\
    , space\n\
    , i\n\
    , l;\n\
\n\
  while (src) {\n\
    // newline\n\
    if (cap = this.rules.newline.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      if (cap[0].length > 1) {\n\
        this.tokens.push({\n\
          type: 'space'\n\
        });\n\
      }\n\
    }\n\
\n\
    // code\n\
    if (cap = this.rules.code.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      cap = cap[0].replace(/^ {4}/gm, '');\n\
      this.tokens.push({\n\
        type: 'code',\n\
        text: !this.options.pedantic\n\
          ? cap.replace(/\\n\
+$/, '')\n\
          : cap\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // fences (gfm)\n\
    if (cap = this.rules.fences.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'code',\n\
        lang: cap[2],\n\
        text: cap[3]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // heading\n\
    if (cap = this.rules.heading.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'heading',\n\
        depth: cap[1].length,\n\
        text: cap[2]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // table no leading pipe (gfm)\n\
    if (top && (cap = this.rules.nptable.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      item = {\n\
        type: 'table',\n\
        header: cap[1].replace(/^ *| *\\| *$/g, '').split(/ *\\| */),\n\
        align: cap[2].replace(/^ *|\\| *$/g, '').split(/ *\\| */),\n\
        cells: cap[3].replace(/\\n\
$/, '').split('\\n\
')\n\
      };\n\
\n\
      for (i = 0; i < item.align.length; i++) {\n\
        if (/^ *-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'right';\n\
        } else if (/^ *:-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'center';\n\
        } else if (/^ *:-+ *$/.test(item.align[i])) {\n\
          item.align[i] = 'left';\n\
        } else {\n\
          item.align[i] = null;\n\
        }\n\
      }\n\
\n\
      for (i = 0; i < item.cells.length; i++) {\n\
        item.cells[i] = item.cells[i].split(/ *\\| */);\n\
      }\n\
\n\
      this.tokens.push(item);\n\
\n\
      continue;\n\
    }\n\
\n\
    // lheading\n\
    if (cap = this.rules.lheading.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'heading',\n\
        depth: cap[2] === '=' ? 1 : 2,\n\
        text: cap[1]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // hr\n\
    if (cap = this.rules.hr.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'hr'\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // blockquote\n\
    if (cap = this.rules.blockquote.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      this.tokens.push({\n\
        type: 'blockquote_start'\n\
      });\n\
\n\
      cap = cap[0].replace(/^ *> ?/gm, '');\n\
\n\
      // Pass `top` to keep the current\n\
      // \"toplevel\" state. This is exactly\n\
      // how markdown.pl works.\n\
      this.token(cap, top);\n\
\n\
      this.tokens.push({\n\
        type: 'blockquote_end'\n\
      });\n\
\n\
      continue;\n\
    }\n\
\n\
    // list\n\
    if (cap = this.rules.list.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      this.tokens.push({\n\
        type: 'list_start',\n\
        ordered: isFinite(cap[2])\n\
      });\n\
\n\
      // Get each top-level item.\n\
      cap = cap[0].match(this.rules.item);\n\
\n\
      next = false;\n\
      l = cap.length;\n\
      i = 0;\n\
\n\
      for (; i < l; i++) {\n\
        item = cap[i];\n\
\n\
        // Remove the list item's bullet\n\
        // so it is seen as the next token.\n\
        space = item.length;\n\
        item = item.replace(/^ *([*+-]|\\d+\\.) +/, '');\n\
\n\
        // Outdent whatever the\n\
        // list item contains. Hacky.\n\
        if (~item.indexOf('\\n\
 ')) {\n\
          space -= item.length;\n\
          item = !this.options.pedantic\n\
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')\n\
            : item.replace(/^ {1,4}/gm, '');\n\
        }\n\
\n\
        // Determine whether item is loose or not.\n\
        // Use: /(^|\\n\
)(?! )[^\\n\
]+\\n\
\\n\
(?!\\s*$)/\n\
        // for discount behavior.\n\
        loose = next || /\\n\
\\n\
(?!\\s*$)/.test(item);\n\
        if (i !== l - 1) {\n\
          next = item[item.length-1] === '\\n\
';\n\
          if (!loose) loose = next;\n\
        }\n\
\n\
        this.tokens.push({\n\
          type: loose\n\
            ? 'loose_item_start'\n\
            : 'list_item_start'\n\
        });\n\
\n\
        // Recurse.\n\
        this.token(item, false);\n\
\n\
        this.tokens.push({\n\
          type: 'list_item_end'\n\
        });\n\
      }\n\
\n\
      this.tokens.push({\n\
        type: 'list_end'\n\
      });\n\
\n\
      continue;\n\
    }\n\
\n\
    // html\n\
    if (cap = this.rules.html.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: this.options.sanitize\n\
          ? 'paragraph'\n\
          : 'html',\n\
        pre: cap[1] === 'pre',\n\
        text: cap[0]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // def\n\
    if (top && (cap = this.rules.def.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.links[cap[1].toLowerCase()] = {\n\
        href: cap[2],\n\
        title: cap[3]\n\
      };\n\
      continue;\n\
    }\n\
\n\
    // table (gfm)\n\
    if (top && (cap = this.rules.table.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      item = {\n\
        type: 'table',\n\
        header: cap[1].replace(/^ *| *\\| *$/g, '').split(/ *\\| */),\n\
        align: cap[2].replace(/^ *|\\| *$/g, '').split(/ *\\| */),\n\
        cells: cap[3].replace(/(?: *\\| *)?\\n\
$/, '').split('\\n\
')\n\
      };\n\
\n\
      for (i = 0; i < item.align.length; i++) {\n\
        if (/^ *-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'right';\n\
        } else if (/^ *:-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'center';\n\
        } else if (/^ *:-+ *$/.test(item.align[i])) {\n\
          item.align[i] = 'left';\n\
        } else {\n\
          item.align[i] = null;\n\
        }\n\
      }\n\
\n\
      for (i = 0; i < item.cells.length; i++) {\n\
        item.cells[i] = item.cells[i]\n\
          .replace(/^ *\\| *| *\\| *$/g, '')\n\
          .split(/ *\\| */);\n\
      }\n\
\n\
      this.tokens.push(item);\n\
\n\
      continue;\n\
    }\n\
\n\
    // top-level paragraph\n\
    if (top && (cap = this.rules.paragraph.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'paragraph',\n\
        text: cap[0]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // text\n\
    if (cap = this.rules.text.exec(src)) {\n\
      // Top-level should never reach here.\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'text',\n\
        text: cap[0]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    if (src) {\n\
      throw new\n\
        Error('Infinite loop on byte: ' + src.charCodeAt(0));\n\
    }\n\
  }\n\
\n\
  return this.tokens;\n\
};\n\
\n\
/**\n\
 * Inline-Level Grammar\n\
 */\n\
\n\
var inline = {\n\
  escape: /^\\\\([\\\\`*{}\\[\\]()#+\\-.!_>|])/,\n\
  autolink: /^<([^ >]+(@|:\\/)[^ >]+)>/,\n\
  url: noop,\n\
  tag: /^<!--[\\s\\S]*?-->|^<\\/?\\w+(?:\"[^\"]*\"|'[^']*'|[^'\">])*?>/,\n\
  link: /^!?\\[(inside)\\]\\(href\\)/,\n\
  reflink: /^!?\\[(inside)\\]\\s*\\[([^\\]]*)\\]/,\n\
  nolink: /^!?\\[((?:\\[[^\\]]*\\]|[^\\[\\]])*)\\]/,\n\
  strong: /^__([\\s\\S]+?)__(?!_)|^\\*\\*([\\s\\S]+?)\\*\\*(?!\\*)/,\n\
  em: /^\\b_((?:__|[\\s\\S])+?)_\\b|^\\*((?:\\*\\*|[\\s\\S])+?)\\*(?!\\*)/,\n\
  code: /^(`+)([\\s\\S]*?[^`])\\1(?!`)/,\n\
  br: /^ {2,}\\n\
(?!\\s*$)/,\n\
  del: noop,\n\
  text: /^[\\s\\S]+?(?=[\\\\<!\\[_*`]| {2,}\\n\
|$)/\n\
};\n\
\n\
inline._inside = /(?:\\[[^\\]]*\\]|[^\\]]|\\](?=[^\\[]*\\]))*/;\n\
inline._href = /\\s*<?([^\\s]*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*/;\n\
\n\
inline.link = replace(inline.link)\n\
  ('inside', inline._inside)\n\
  ('href', inline._href)\n\
  ();\n\
\n\
inline.reflink = replace(inline.reflink)\n\
  ('inside', inline._inside)\n\
  ();\n\
\n\
/**\n\
 * Normal Inline Grammar\n\
 */\n\
\n\
inline.normal = merge({}, inline);\n\
\n\
/**\n\
 * Pedantic Inline Grammar\n\
 */\n\
\n\
inline.pedantic = merge({}, inline.normal, {\n\
  strong: /^__(?=\\S)([\\s\\S]*?\\S)__(?!_)|^\\*\\*(?=\\S)([\\s\\S]*?\\S)\\*\\*(?!\\*)/,\n\
  em: /^_(?=\\S)([\\s\\S]*?\\S)_(?!_)|^\\*(?=\\S)([\\s\\S]*?\\S)\\*(?!\\*)/\n\
});\n\
\n\
/**\n\
 * GFM Inline Grammar\n\
 */\n\
\n\
inline.gfm = merge({}, inline.normal, {\n\
  escape: replace(inline.escape)('])', '~])')(),\n\
  url: /^(https?:\\/\\/[^\\s]+[^.,:;\"')\\]\\s])/,\n\
  del: /^~{2,}([\\s\\S]+?)~{2,}/,\n\
  text: replace(inline.text)\n\
    (']|', '~]|')\n\
    ('|', '|https?://|')\n\
    ()\n\
});\n\
\n\
/**\n\
 * GFM + Line Breaks Inline Grammar\n\
 */\n\
\n\
inline.breaks = merge({}, inline.gfm, {\n\
  br: replace(inline.br)('{2,}', '*')(),\n\
  text: replace(inline.gfm.text)('{2,}', '*')()\n\
});\n\
\n\
/**\n\
 * Inline Lexer & Compiler\n\
 */\n\
\n\
function InlineLexer(links, options) {\n\
  this.options = options || marked.defaults;\n\
  this.links = links;\n\
  this.rules = inline.normal;\n\
\n\
  if (!this.links) {\n\
    throw new\n\
      Error('Tokens array requires a `links` property.');\n\
  }\n\
\n\
  if (this.options.gfm) {\n\
    if (this.options.breaks) {\n\
      this.rules = inline.breaks;\n\
    } else {\n\
      this.rules = inline.gfm;\n\
    }\n\
  } else if (this.options.pedantic) {\n\
    this.rules = inline.pedantic;\n\
  }\n\
}\n\
\n\
/**\n\
 * Expose Inline Rules\n\
 */\n\
\n\
InlineLexer.rules = inline;\n\
\n\
/**\n\
 * Static Lexing/Compiling Method\n\
 */\n\
\n\
InlineLexer.output = function(src, links, opt) {\n\
  var inline = new InlineLexer(links, opt);\n\
  return inline.output(src);\n\
};\n\
\n\
/**\n\
 * Lexing/Compiling\n\
 */\n\
\n\
InlineLexer.prototype.output = function(src) {\n\
  var out = ''\n\
    , link\n\
    , text\n\
    , href\n\
    , cap;\n\
\n\
  while (src) {\n\
    // escape\n\
    if (cap = this.rules.escape.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += cap[1];\n\
      continue;\n\
    }\n\
\n\
    // autolink\n\
    if (cap = this.rules.autolink.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      if (cap[2] === '@') {\n\
        text = cap[1][6] === ':'\n\
          ? this.mangle(cap[1].substring(7))\n\
          : this.mangle(cap[1]);\n\
        href = this.mangle('mailto:') + text;\n\
      } else {\n\
        text = escape(cap[1]);\n\
        href = text;\n\
      }\n\
      out += '<a href=\"'\n\
        + href\n\
        + '\">'\n\
        + text\n\
        + '</a>';\n\
      continue;\n\
    }\n\
\n\
    // url (gfm)\n\
    if (cap = this.rules.url.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      text = escape(cap[1]);\n\
      href = text;\n\
      out += '<a href=\"'\n\
        + href\n\
        + '\">'\n\
        + text\n\
        + '</a>';\n\
      continue;\n\
    }\n\
\n\
    // tag\n\
    if (cap = this.rules.tag.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += this.options.sanitize\n\
        ? escape(cap[0])\n\
        : cap[0];\n\
      continue;\n\
    }\n\
\n\
    // link\n\
    if (cap = this.rules.link.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += this.outputLink(cap, {\n\
        href: cap[2],\n\
        title: cap[3]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // reflink, nolink\n\
    if ((cap = this.rules.reflink.exec(src))\n\
        || (cap = this.rules.nolink.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
      link = (cap[2] || cap[1]).replace(/\\s+/g, ' ');\n\
      link = this.links[link.toLowerCase()];\n\
      if (!link || !link.href) {\n\
        out += cap[0][0];\n\
        src = cap[0].substring(1) + src;\n\
        continue;\n\
      }\n\
      out += this.outputLink(cap, link);\n\
      continue;\n\
    }\n\
\n\
    // strong\n\
    if (cap = this.rules.strong.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<strong>'\n\
        + this.output(cap[2] || cap[1])\n\
        + '</strong>';\n\
      continue;\n\
    }\n\
\n\
    // em\n\
    if (cap = this.rules.em.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<em>'\n\
        + this.output(cap[2] || cap[1])\n\
        + '</em>';\n\
      continue;\n\
    }\n\
\n\
    // code\n\
    if (cap = this.rules.code.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<code>'\n\
        + escape(cap[2], true)\n\
        + '</code>';\n\
      continue;\n\
    }\n\
\n\
    // br\n\
    if (cap = this.rules.br.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<br>';\n\
      continue;\n\
    }\n\
\n\
    // del (gfm)\n\
    if (cap = this.rules.del.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<del>'\n\
        + this.output(cap[1])\n\
        + '</del>';\n\
      continue;\n\
    }\n\
\n\
    // text\n\
    if (cap = this.rules.text.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += escape(cap[0]);\n\
      continue;\n\
    }\n\
\n\
    if (src) {\n\
      throw new\n\
        Error('Infinite loop on byte: ' + src.charCodeAt(0));\n\
    }\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Compile Link\n\
 */\n\
\n\
InlineLexer.prototype.outputLink = function(cap, link) {\n\
  if (cap[0][0] !== '!') {\n\
    return '<a href=\"'\n\
      + escape(link.href)\n\
      + '\"'\n\
      + (link.title\n\
      ? ' title=\"'\n\
      + escape(link.title)\n\
      + '\"'\n\
      : '')\n\
      + '>'\n\
      + this.output(cap[1])\n\
      + '</a>';\n\
  } else {\n\
    return '<img src=\"'\n\
      + escape(link.href)\n\
      + '\" alt=\"'\n\
      + escape(cap[1])\n\
      + '\"'\n\
      + (link.title\n\
      ? ' title=\"'\n\
      + escape(link.title)\n\
      + '\"'\n\
      : '')\n\
      + '>';\n\
  }\n\
};\n\
\n\
/**\n\
 * Mangle Links\n\
 */\n\
\n\
InlineLexer.prototype.mangle = function(text) {\n\
  var out = ''\n\
    , l = text.length\n\
    , i = 0\n\
    , ch;\n\
\n\
  for (; i < l; i++) {\n\
    ch = text.charCodeAt(i);\n\
    if (Math.random() > 0.5) {\n\
      ch = 'x' + ch.toString(16);\n\
    }\n\
    out += '&#' + ch + ';';\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Parsing & Compiling\n\
 */\n\
\n\
function Parser(options) {\n\
  this.tokens = [];\n\
  this.token = null;\n\
  this.options = options || marked.defaults;\n\
}\n\
\n\
/**\n\
 * Static Parse Method\n\
 */\n\
\n\
Parser.parse = function(src, options) {\n\
  var parser = new Parser(options);\n\
  return parser.parse(src);\n\
};\n\
\n\
/**\n\
 * Parse Loop\n\
 */\n\
\n\
Parser.prototype.parse = function(src) {\n\
  this.inline = new InlineLexer(src.links, this.options);\n\
  this.tokens = src.reverse();\n\
\n\
  var out = '';\n\
  while (this.next()) {\n\
    out += this.tok();\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Next Token\n\
 */\n\
\n\
Parser.prototype.next = function() {\n\
  return this.token = this.tokens.pop();\n\
};\n\
\n\
/**\n\
 * Preview Next Token\n\
 */\n\
\n\
Parser.prototype.peek = function() {\n\
  return this.tokens[this.tokens.length-1] || 0;\n\
};\n\
\n\
/**\n\
 * Parse Text Tokens\n\
 */\n\
\n\
Parser.prototype.parseText = function() {\n\
  var body = this.token.text;\n\
\n\
  while (this.peek().type === 'text') {\n\
    body += '\\n\
' + this.next().text;\n\
  }\n\
\n\
  return this.inline.output(body);\n\
};\n\
\n\
/**\n\
 * Parse Current Token\n\
 */\n\
\n\
Parser.prototype.tok = function() {\n\
  switch (this.token.type) {\n\
    case 'space': {\n\
      return '';\n\
    }\n\
    case 'hr': {\n\
      return '<hr>\\n\
';\n\
    }\n\
    case 'heading': {\n\
      return '<h'\n\
        + this.token.depth\n\
        + '>'\n\
        + this.inline.output(this.token.text)\n\
        + '</h'\n\
        + this.token.depth\n\
        + '>\\n\
';\n\
    }\n\
    case 'code': {\n\
      if (this.options.highlight) {\n\
        var code = this.options.highlight(this.token.text, this.token.lang);\n\
        if (code != null && code !== this.token.text) {\n\
          this.token.escaped = true;\n\
          this.token.text = code;\n\
        }\n\
      }\n\
\n\
      if (!this.token.escaped) {\n\
        this.token.text = escape(this.token.text, true);\n\
      }\n\
\n\
      return '<pre><code'\n\
        + (this.token.lang\n\
        ? ' class=\"lang-'\n\
        + this.token.lang\n\
        + '\"'\n\
        : '')\n\
        + '>'\n\
        + this.token.text\n\
        + '</code></pre>\\n\
';\n\
    }\n\
    case 'table': {\n\
      var body = ''\n\
        , heading\n\
        , i\n\
        , row\n\
        , cell\n\
        , j;\n\
\n\
      // header\n\
      body += '<thead>\\n\
<tr>\\n\
';\n\
      for (i = 0; i < this.token.header.length; i++) {\n\
        heading = this.inline.output(this.token.header[i]);\n\
        body += this.token.align[i]\n\
          ? '<th align=\"' + this.token.align[i] + '\">' + heading + '</th>\\n\
'\n\
          : '<th>' + heading + '</th>\\n\
';\n\
      }\n\
      body += '</tr>\\n\
</thead>\\n\
';\n\
\n\
      // body\n\
      body += '<tbody>\\n\
'\n\
      for (i = 0; i < this.token.cells.length; i++) {\n\
        row = this.token.cells[i];\n\
        body += '<tr>\\n\
';\n\
        for (j = 0; j < row.length; j++) {\n\
          cell = this.inline.output(row[j]);\n\
          body += this.token.align[j]\n\
            ? '<td align=\"' + this.token.align[j] + '\">' + cell + '</td>\\n\
'\n\
            : '<td>' + cell + '</td>\\n\
';\n\
        }\n\
        body += '</tr>\\n\
';\n\
      }\n\
      body += '</tbody>\\n\
';\n\
\n\
      return '<table>\\n\
'\n\
        + body\n\
        + '</table>\\n\
';\n\
    }\n\
    case 'blockquote_start': {\n\
      var body = '';\n\
\n\
      while (this.next().type !== 'blockquote_end') {\n\
        body += this.tok();\n\
      }\n\
\n\
      return '<blockquote>\\n\
'\n\
        + body\n\
        + '</blockquote>\\n\
';\n\
    }\n\
    case 'list_start': {\n\
      var type = this.token.ordered ? 'ol' : 'ul'\n\
        , body = '';\n\
\n\
      while (this.next().type !== 'list_end') {\n\
        body += this.tok();\n\
      }\n\
\n\
      return '<'\n\
        + type\n\
        + '>\\n\
'\n\
        + body\n\
        + '</'\n\
        + type\n\
        + '>\\n\
';\n\
    }\n\
    case 'list_item_start': {\n\
      var body = '';\n\
\n\
      while (this.next().type !== 'list_item_end') {\n\
        body += this.token.type === 'text'\n\
          ? this.parseText()\n\
          : this.tok();\n\
      }\n\
\n\
      return '<li>'\n\
        + body\n\
        + '</li>\\n\
';\n\
    }\n\
    case 'loose_item_start': {\n\
      var body = '';\n\
\n\
      while (this.next().type !== 'list_item_end') {\n\
        body += this.tok();\n\
      }\n\
\n\
      return '<li>'\n\
        + body\n\
        + '</li>\\n\
';\n\
    }\n\
    case 'html': {\n\
      return !this.token.pre && !this.options.pedantic\n\
        ? this.inline.output(this.token.text)\n\
        : this.token.text;\n\
    }\n\
    case 'paragraph': {\n\
      return '<p>'\n\
        + this.inline.output(this.token.text)\n\
        + '</p>\\n\
';\n\
    }\n\
    case 'text': {\n\
      return '<p>'\n\
        + this.parseText()\n\
        + '</p>\\n\
';\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Helpers\n\
 */\n\
\n\
function escape(html, encode) {\n\
  return html\n\
    .replace(!encode ? /&(?!#?\\w+;)/g : /&/g, '&amp;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;')\n\
    .replace(/\"/g, '&quot;')\n\
    .replace(/'/g, '&#39;');\n\
}\n\
\n\
function replace(regex, opt) {\n\
  regex = regex.source;\n\
  opt = opt || '';\n\
  return function self(name, val) {\n\
    if (!name) return new RegExp(regex, opt);\n\
    val = val.source || val;\n\
    val = val.replace(/(^|[^\\[])\\^/g, '$1');\n\
    regex = regex.replace(name, val);\n\
    return self;\n\
  };\n\
}\n\
\n\
function noop() {}\n\
noop.exec = noop;\n\
\n\
function merge(obj) {\n\
  var i = 1\n\
    , target\n\
    , key;\n\
\n\
  for (; i < arguments.length; i++) {\n\
    target = arguments[i];\n\
    for (key in target) {\n\
      if (Object.prototype.hasOwnProperty.call(target, key)) {\n\
        obj[key] = target[key];\n\
      }\n\
    }\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Marked\n\
 */\n\
\n\
function marked(src, opt) {\n\
  try {\n\
    return Parser.parse(Lexer.lex(src, opt), opt);\n\
  } catch (e) {\n\
    e.message += '\\n\
Please report this to https://github.com/chjj/marked.';\n\
    if ((opt || marked.defaults).silent) {\n\
      return 'An error occured:\\n\
' + e.message;\n\
    }\n\
    throw e;\n\
  }\n\
}\n\
\n\
/**\n\
 * Options\n\
 */\n\
\n\
marked.options =\n\
marked.setOptions = function(opt) {\n\
  marked.defaults = opt;\n\
  return marked;\n\
};\n\
\n\
marked.defaults = {\n\
  gfm: true,\n\
  tables: true,\n\
  breaks: false,\n\
  pedantic: false,\n\
  sanitize: false,\n\
  silent: false,\n\
  highlight: null\n\
};\n\
\n\
/**\n\
 * Expose\n\
 */\n\
\n\
marked.Parser = Parser;\n\
marked.parser = Parser.parse;\n\
\n\
marked.Lexer = Lexer;\n\
marked.lexer = Lexer.lex;\n\
\n\
marked.InlineLexer = InlineLexer;\n\
marked.inlineLexer = InlineLexer.output;\n\
\n\
marked.parse = marked;\n\
\n\
if (typeof module !== 'undefined') {\n\
  module.exports = marked;\n\
} else if (typeof define === 'function' && define.amd) {\n\
  define(function() { return marked; });\n\
} else {\n\
  this.marked = marked;\n\
}\n\
\n\
}).call(function() {\n\
  return this || (typeof window !== 'undefined' ? window : global);\n\
}());\n\
//@ sourceURL=component-marked/lib/marked.js"
));
require.register("RedVentures-reduce/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Reduce `arr` with `fn`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @param {Mixed} initial\n\
 *\n\
 * TODO: combatible error handling?\n\
 */\n\
\n\
module.exports = function(arr, fn, initial){  \n\
  var idx = 0;\n\
  var len = arr.length;\n\
  var curr = arguments.length == 3\n\
    ? initial\n\
    : arr[idx++];\n\
\n\
  while (idx < len) {\n\
    curr = fn.call(null, curr, arr[idx], ++idx, arr);\n\
  }\n\
  \n\
  return curr;\n\
};//@ sourceURL=RedVentures-reduce/index.js"
));
require.register("visionmedia-superagent/lib/client.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var reduce = require('reduce');\n\
\n\
/**\n\
 * Root reference for iframes.\n\
 */\n\
\n\
var root = 'undefined' == typeof window\n\
  ? this\n\
  : window;\n\
\n\
/**\n\
 * Noop.\n\
 */\n\
\n\
function noop(){};\n\
\n\
/**\n\
 * Check if `obj` is a host object,\n\
 * we don't want to serialize these :)\n\
 *\n\
 * TODO: future proof, move to compoent land\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isHost(obj) {\n\
  var str = {}.toString.call(obj);\n\
\n\
  switch (str) {\n\
    case '[object File]':\n\
    case '[object Blob]':\n\
    case '[object FormData]':\n\
      return true;\n\
    default:\n\
      return false;\n\
  }\n\
}\n\
\n\
/**\n\
 * Determine XHR.\n\
 */\n\
\n\
function getXHR() {\n\
  if (root.XMLHttpRequest\n\
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {\n\
    return new XMLHttpRequest;\n\
  } else {\n\
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Removes leading and trailing whitespace, added to support IE.\n\
 *\n\
 * @param {String} s\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var trim = ''.trim\n\
  ? function(s) { return s.trim(); }\n\
  : function(s) { return s.replace(/(^\\s*|\\s*$)/g, ''); };\n\
\n\
/**\n\
 * Check if `obj` is an object.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isObject(obj) {\n\
  return obj === Object(obj);\n\
}\n\
\n\
/**\n\
 * Serialize the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function serialize(obj) {\n\
  if (!isObject(obj)) return obj;\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key)\n\
      + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
}\n\
\n\
/**\n\
 * Expose serialization method.\n\
 */\n\
\n\
 request.serializeObject = serialize;\n\
\n\
 /**\n\
  * Parse the given x-www-form-urlencoded `str`.\n\
  *\n\
  * @param {String} str\n\
  * @return {Object}\n\
  * @api private\n\
  */\n\
\n\
function parseString(str) {\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  var parts;\n\
  var pair;\n\
\n\
  for (var i = 0, len = pairs.length; i < len; ++i) {\n\
    pair = pairs[i];\n\
    parts = pair.split('=');\n\
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Expose parser.\n\
 */\n\
\n\
request.parseString = parseString;\n\
\n\
/**\n\
 * Default MIME type map.\n\
 *\n\
 *     superagent.types.xml = 'application/xml';\n\
 *\n\
 */\n\
\n\
request.types = {\n\
  html: 'text/html',\n\
  json: 'application/json',\n\
  urlencoded: 'application/x-www-form-urlencoded',\n\
  'form': 'application/x-www-form-urlencoded',\n\
  'form-data': 'application/x-www-form-urlencoded'\n\
};\n\
\n\
/**\n\
 * Default serialization map.\n\
 *\n\
 *     superagent.serialize['application/xml'] = function(obj){\n\
 *       return 'generated xml here';\n\
 *     };\n\
 *\n\
 */\n\
\n\
 request.serialize = {\n\
   'application/x-www-form-urlencoded': serialize,\n\
   'application/json': JSON.stringify\n\
 };\n\
\n\
 /**\n\
  * Default parsers.\n\
  *\n\
  *     superagent.parse['application/xml'] = function(str){\n\
  *       return { object parsed from str };\n\
  *     };\n\
  *\n\
  */\n\
\n\
request.parse = {\n\
  'application/x-www-form-urlencoded': parseString,\n\
  'application/json': JSON.parse\n\
};\n\
\n\
/**\n\
 * Parse the given header `str` into\n\
 * an object containing the mapped fields.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parseHeader(str) {\n\
  var lines = str.split(/\\r?\\n\
/);\n\
  var fields = {};\n\
  var index;\n\
  var line;\n\
  var field;\n\
  var val;\n\
\n\
  lines.pop(); // trailing CRLF\n\
\n\
  for (var i = 0, len = lines.length; i < len; ++i) {\n\
    line = lines[i];\n\
    index = line.indexOf(':');\n\
    field = line.slice(0, index).toLowerCase();\n\
    val = trim(line.slice(index + 1));\n\
    fields[field] = val;\n\
  }\n\
\n\
  return fields;\n\
}\n\
\n\
/**\n\
 * Return the mime type for the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function type(str){\n\
  return str.split(/ *; */).shift();\n\
};\n\
\n\
/**\n\
 * Return header field parameters.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function params(str){\n\
  return reduce(str.split(/ *; */), function(obj, str){\n\
    var parts = str.split(/ *= */)\n\
      , key = parts.shift()\n\
      , val = parts.shift();\n\
\n\
    if (key && val) obj[key] = val;\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Initialize a new `Response` with the given `xhr`.\n\
 *\n\
 *  - set flags (.ok, .error, etc)\n\
 *  - parse header\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Aliasing `superagent` as `request` is nice:\n\
 *\n\
 *      request = superagent;\n\
 *\n\
 *  We can use the promise-like API, or pass callbacks:\n\
 *\n\
 *      request.get('/').end(function(res){});\n\
 *      request.get('/', function(res){});\n\
 *\n\
 *  Sending data can be chained:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 *  Or passed to `.send()`:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' }, function(res){});\n\
 *\n\
 *  Or passed to `.post()`:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 * Or further reduced to a single call for simple cases:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' }, function(res){});\n\
 *\n\
 * @param {XMLHTTPRequest} xhr\n\
 * @param {Object} options\n\
 * @api private\n\
 */\n\
\n\
function Response(req, options) {\n\
  options = options || {};\n\
  this.req = req;\n\
  this.xhr = this.req.xhr;\n\
  this.text = this.xhr.responseText;\n\
  this.setStatusProperties(this.xhr.status);\n\
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());\n\
  // getAllResponseHeaders sometimes falsely returns \"\" for CORS requests, but\n\
  // getResponseHeader still works. so we get content-type even if getting\n\
  // other headers fails.\n\
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');\n\
  this.setHeaderProperties(this.header);\n\
  this.body = this.parseBody(this.text);\n\
}\n\
\n\
/**\n\
 * Get case-insensitive `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.get = function(field){\n\
  return this.header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set header related properties:\n\
 *\n\
 *   - `.type` the content type without params\n\
 *\n\
 * A response of \"Content-Type: text/plain; charset=utf-8\"\n\
 * will provide you with a `.type` of \"text/plain\".\n\
 *\n\
 * @param {Object} header\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setHeaderProperties = function(header){\n\
  // content-type\n\
  var ct = this.header['content-type'] || '';\n\
  this.type = type(ct);\n\
\n\
  // params\n\
  var obj = params(ct);\n\
  for (var key in obj) this[key] = obj[key];\n\
};\n\
\n\
/**\n\
 * Parse the given body `str`.\n\
 *\n\
 * Used for auto-parsing of bodies. Parsers\n\
 * are defined on the `superagent.parse` object.\n\
 *\n\
 * @param {String} str\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.parseBody = function(str){\n\
  var parse = request.parse[this.type];\n\
  return parse\n\
    ? parse(str)\n\
    : null;\n\
};\n\
\n\
/**\n\
 * Set flags such as `.ok` based on `status`.\n\
 *\n\
 * For example a 2xx response will give you a `.ok` of __true__\n\
 * whereas 5xx will be __false__ and `.error` will be __true__. The\n\
 * `.clientError` and `.serverError` are also available to be more\n\
 * specific, and `.statusType` is the class of error ranging from 1..5\n\
 * sometimes useful for mapping respond colors etc.\n\
 *\n\
 * \"sugar\" properties are also defined for common cases. Currently providing:\n\
 *\n\
 *   - .noContent\n\
 *   - .badRequest\n\
 *   - .unauthorized\n\
 *   - .notAcceptable\n\
 *   - .notFound\n\
 *\n\
 * @param {Number} status\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setStatusProperties = function(status){\n\
  var type = status / 100 | 0;\n\
\n\
  // status / class\n\
  this.status = status;\n\
  this.statusType = type;\n\
\n\
  // basics\n\
  this.info = 1 == type;\n\
  this.ok = 2 == type;\n\
  this.clientError = 4 == type;\n\
  this.serverError = 5 == type;\n\
  this.error = (4 == type || 5 == type)\n\
    ? this.toError()\n\
    : false;\n\
\n\
  // sugar\n\
  this.accepted = 202 == status;\n\
  this.noContent = 204 == status || 1223 == status;\n\
  this.badRequest = 400 == status;\n\
  this.unauthorized = 401 == status;\n\
  this.notAcceptable = 406 == status;\n\
  this.notFound = 404 == status;\n\
  this.forbidden = 403 == status;\n\
};\n\
\n\
/**\n\
 * Return an `Error` representative of this response.\n\
 *\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.toError = function(){\n\
  var req = this.req;\n\
  var method = req.method;\n\
  var path = req.path;\n\
\n\
  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';\n\
  var err = new Error(msg);\n\
  err.status = this.status;\n\
  err.method = method;\n\
  err.path = path;\n\
\n\
  return err;\n\
};\n\
\n\
/**\n\
 * Expose `Response`.\n\
 */\n\
\n\
request.Response = Response;\n\
\n\
/**\n\
 * Initialize a new `Request` with the given `method` and `url`.\n\
 *\n\
 * @param {String} method\n\
 * @param {String} url\n\
 * @api public\n\
 */\n\
\n\
function Request(method, url) {\n\
  var self = this;\n\
  Emitter.call(this);\n\
  this._query = this._query || [];\n\
  this.method = method;\n\
  this.url = url;\n\
  this.header = {};\n\
  this._header = {};\n\
  this.on('end', function(){\n\
    var res = new Response(self);\n\
    if ('HEAD' == method) res.text = null;\n\
    self.callback(null, res);\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Emitter.prototype`.\n\
 */\n\
\n\
Request.prototype = new Emitter;\n\
Request.prototype.constructor = Request;\n\
\n\
/**\n\
 * Set timeout to `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.timeout = function(ms){\n\
  this._timeout = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clear previous timeout.\n\
 *\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.clearTimeout = function(){\n\
  this._timeout = 0;\n\
  clearTimeout(this._timer);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Abort the request, and clear potential timeout.\n\
 *\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.abort = function(){\n\
  if (this.aborted) return;\n\
  this.aborted = true;\n\
  this.xhr.abort();\n\
  this.clearTimeout();\n\
  this.emit('abort');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set header `field` to `val`, or multiple fields with one object.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      req.get('/')\n\
 *        .set('Accept', 'application/json')\n\
 *        .set('X-API-Key', 'foobar')\n\
 *        .end(callback);\n\
 *\n\
 *      req.get('/')\n\
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })\n\
 *        .end(callback);\n\
 *\n\
 * @param {String|Object} field\n\
 * @param {String} val\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.set = function(field, val){\n\
  if (isObject(field)) {\n\
    for (var key in field) {\n\
      this.set(key, field[key]);\n\
    }\n\
    return this;\n\
  }\n\
  this._header[field.toLowerCase()] = val;\n\
  this.header[field] = val;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get case-insensitive header `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.getHeader = function(field){\n\
  return this._header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set Content-Type to `type`, mapping values from `request.types`.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      superagent.types.xml = 'application/xml';\n\
 *\n\
 *      request.post('/')\n\
 *        .type('xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 *      request.post('/')\n\
 *        .type('application/xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 * @param {String} type\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.type = function(type){\n\
  this.set('Content-Type', request.types[type] || type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set Authorization field value with `user` and `pass`.\n\
 *\n\
 * @param {String} user\n\
 * @param {String} pass\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.auth = function(user, pass){\n\
  var str = btoa(user + ':' + pass);\n\
  this.set('Authorization', 'Basic ' + str);\n\
  return this;\n\
};\n\
\n\
/**\n\
* Add query-string `val`.\n\
*\n\
* Examples:\n\
*\n\
*   request.get('/shoes')\n\
*     .query('size=10')\n\
*     .query({ color: 'blue' })\n\
*\n\
* @param {Object|String} val\n\
* @return {Request} for chaining\n\
* @api public\n\
*/\n\
\n\
Request.prototype.query = function(val){\n\
  if ('string' != typeof val) val = serialize(val);\n\
  if (val) this._query.push(val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Send `data`, defaulting the `.type()` to \"json\" when\n\
 * an object is given.\n\
 *\n\
 * Examples:\n\
 *\n\
 *       // querystring\n\
 *       request.get('/search')\n\
 *         .end(callback)\n\
 *\n\
 *       // multiple data \"writes\"\n\
 *       request.get('/search')\n\
 *         .send({ search: 'query' })\n\
 *         .send({ range: '1..5' })\n\
 *         .send({ order: 'desc' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual json\n\
 *       request.post('/user')\n\
 *         .type('json')\n\
 *         .send('{\"name\":\"tj\"})\n\
 *         .end(callback)\n\
 *\n\
 *       // auto json\n\
 *       request.post('/user')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send('name=tj')\n\
 *         .end(callback)\n\
 *\n\
 *       // auto x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // defaults to x-www-form-urlencoded\n\
  *      request.post('/user')\n\
  *        .send('name=tobi')\n\
  *        .send('species=ferret')\n\
  *        .end(callback)\n\
 *\n\
 * @param {String|Object} data\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.send = function(data){\n\
  var obj = isObject(data);\n\
  var type = this.getHeader('Content-Type');\n\
\n\
  // merge\n\
  if (obj && isObject(this._data)) {\n\
    for (var key in data) {\n\
      this._data[key] = data[key];\n\
    }\n\
  } else if ('string' == typeof data) {\n\
    if (!type) this.type('form');\n\
    type = this.getHeader('Content-Type');\n\
    if ('application/x-www-form-urlencoded' == type) {\n\
      this._data = this._data\n\
        ? this._data + '&' + data\n\
        : data;\n\
    } else {\n\
      this._data = (this._data || '') + data;\n\
    }\n\
  } else {\n\
    this._data = data;\n\
  }\n\
\n\
  if (!obj) return this;\n\
  if (!type) this.type('json');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invoke the callback with `err` and `res`\n\
 * and handle arity check.\n\
 *\n\
 * @param {Error} err\n\
 * @param {Response} res\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.callback = function(err, res){\n\
  var fn = this._callback;\n\
  if (2 == fn.length) return fn(err, res);\n\
  if (err) return this.emit('error', err);\n\
  fn(res);\n\
};\n\
\n\
/**\n\
 * Invoke callback with x-domain error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.crossDomainError = function(){\n\
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');\n\
  err.crossDomain = true;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Invoke callback with timeout error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.timeoutError = function(){\n\
  var timeout = this._timeout;\n\
  var err = new Error('timeout of ' + timeout + 'ms exceeded');\n\
  err.timeout = timeout;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Enable transmission of cookies with x-domain requests.\n\
 *\n\
 * Note that for this to work the origin must not be\n\
 * using \"Access-Control-Allow-Origin\" with a wildcard,\n\
 * and also must set \"Access-Control-Allow-Credentials\"\n\
 * to \"true\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.withCredentials = function(){\n\
  this._withCredentials = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Initiate request, invoking callback `fn(res)`\n\
 * with an instanceof `Response`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.end = function(fn){\n\
  var self = this;\n\
  var xhr = this.xhr = getXHR();\n\
  var query = this._query.join('&');\n\
  var timeout = this._timeout;\n\
  var data = this._data;\n\
\n\
  // store callback\n\
  this._callback = fn || noop;\n\
\n\
  // CORS\n\
  if (this._withCredentials) xhr.withCredentials = true;\n\
\n\
  // state change\n\
  xhr.onreadystatechange = function(){\n\
    if (4 != xhr.readyState) return;\n\
    if (0 == xhr.status) {\n\
      if (self.aborted) return self.timeoutError();\n\
      return self.crossDomainError();\n\
    }\n\
    self.emit('end');\n\
  };\n\
\n\
  // progress\n\
  if (xhr.upload) {\n\
    xhr.upload.onprogress = function(e){\n\
      e.percent = e.loaded / e.total * 100;\n\
      self.emit('progress', e);\n\
    };\n\
  }\n\
\n\
  // timeout\n\
  if (timeout && !this._timer) {\n\
    this._timer = setTimeout(function(){\n\
      self.abort();\n\
    }, timeout);\n\
  }\n\
\n\
  // querystring\n\
  if (query) {\n\
    query = request.serializeObject(query);\n\
    this.url += ~this.url.indexOf('?')\n\
      ? '&' + query\n\
      : '?' + query;\n\
  }\n\
\n\
  // initiate request\n\
  xhr.open(this.method, this.url, true);\n\
\n\
  // body\n\
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {\n\
    // serialize stuff\n\
    var serialize = request.serialize[this.getHeader('Content-Type')];\n\
    if (serialize) data = serialize(data);\n\
  }\n\
\n\
  // set header fields\n\
  for (var field in this.header) {\n\
    if (null == this.header[field]) continue;\n\
    xhr.setRequestHeader(field, this.header[field]);\n\
  }\n\
\n\
  // send stuff\n\
  xhr.send(data);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Expose `Request`.\n\
 */\n\
\n\
request.Request = Request;\n\
\n\
/**\n\
 * Issue a request:\n\
 *\n\
 * Examples:\n\
 *\n\
 *    request('GET', '/users').end(callback)\n\
 *    request('/users').end(callback)\n\
 *    request('/users', callback)\n\
 *\n\
 * @param {String} method\n\
 * @param {String|Function} url or callback\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
function request(method, url) {\n\
  // callback\n\
  if ('function' == typeof url) {\n\
    return new Request('GET', method).end(url);\n\
  }\n\
\n\
  // url first\n\
  if (1 == arguments.length) {\n\
    return new Request('GET', method);\n\
  }\n\
\n\
  return new Request(method, url);\n\
}\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.get = function(url, data, fn){\n\
  var req = request('GET', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.query(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.head = function(url, data, fn){\n\
  var req = request('HEAD', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * DELETE `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.del = function(url, fn){\n\
  var req = request('DELETE', url);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PATCH `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.patch = function(url, data, fn){\n\
  var req = request('PATCH', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * POST `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.post = function(url, data, fn){\n\
  var req = request('POST', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PUT `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.put = function(url, data, fn){\n\
  var req = request('PUT', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * Expose `request`.\n\
 */\n\
\n\
module.exports = request;\n\
//@ sourceURL=visionmedia-superagent/lib/client.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\"\n\
  return new Function('_', 'return _.' + str);\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
var type;\n\
\n\
try {\n\
  type = require('type-component');\n\
} catch (e) {\n\
  type = require('type');\n\
}\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  fn = toFunction(fn);\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn);\n\
      return object(obj, fn);\n\
    case 'string':\n\
      return string(obj, fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn(key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj[i], i);\n\
  }\n\
}\n\
//@ sourceURL=component-each/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("yields-unserialize/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Unserialize the given \"stringified\" javascript.\n\
 * \n\
 * @param {String} val\n\
 * @return {Mixed}\n\
 */\n\
\n\
module.exports = function(val){\n\
  try {\n\
    return JSON.parse(val);\n\
  } catch (e) {\n\
    return val || undefined;\n\
  }\n\
};\n\
//@ sourceURL=yields-unserialize/index.js"
));
require.register("yields-store/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var each = require('each')\n\
  , unserialize = require('unserialize')\n\
  , storage = window.localStorage\n\
  , type = require('type');\n\
\n\
/**\n\
 * Store the given `key` `val`.\n\
 *\n\
 * @param {String} key\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 */\n\
\n\
exports = module.exports = function(key, val){\n\
  switch (arguments.length) {\n\
    case 2: return set(key, val);\n\
    case 0: return all();\n\
    case 1: return 'object' == type(key)\n\
      ? each(key, set)\n\
      : get(key);\n\
  }\n\
};\n\
\n\
/**\n\
 * supported flag.\n\
 */\n\
\n\
exports.supported = !! storage;\n\
\n\
/**\n\
 * export methods.\n\
 */\n\
\n\
exports.set = set;\n\
exports.get = get;\n\
exports.all = all;\n\
\n\
/**\n\
 * Set `key` to `val`.\n\
 *\n\
 * @param {String} key\n\
 * @param {Mixed} val\n\
 */\n\
\n\
function set(key, val){\n\
  return null == val\n\
    ? storage.removeItem(key)\n\
    : storage.setItem(key, JSON.stringify(val));\n\
}\n\
\n\
/**\n\
 * Get `key`.\n\
 *\n\
 * @param {String} key\n\
 * @return {Mixed}\n\
 */\n\
\n\
function get(key){\n\
  return null == key\n\
    ? storage.clear()\n\
    : unserialize(storage.getItem(key));\n\
}\n\
\n\
/**\n\
 * Get all.\n\
 *\n\
 * @return {Object}\n\
 */\n\
\n\
function all(){\n\
  var len = storage.length\n\
    , ret = {}\n\
    , key\n\
    , val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    key = storage.key(i);\n\
    ret[key] = get(key);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=yields-store/index.js"
));
require.register("markdown-view/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , request = require('superagent')\n\
  , marked = require('marked')\n\
  , store = require('store')\n\
  , classes = require('classes');\n\
\n\
/**\n\
 * Expose `MarkdownView`.\n\
 */\n\
\n\
module.exports = MarkdownView;\n\
\n\
/**\n\
 * Inherit from `Emitter`.\n\
 */\n\
\n\
Emitter(MarkdownView.prototype);\n\
\n\
/**\n\
 * MarkdownView.\n\
 *\n\
 * @param {String} url\n\
 * @param {DOMElement} el\n\
 * @return {MarkdownView}\n\
 */\n\
\n\
function MarkdownView(url, el) {\n\
  if (!(this instanceof MarkdownView)) {\n\
    return new MarkdownView(url, el);\n\
  }\n\
\n\
  this.url = url;\n\
  this.el = el || document.createElement('article');\n\
  classes(this.el).add('hide');\n\
\n\
  // Default options\n\
  this.setOptions({\n\
    gfm: true,\n\
    tables: true,\n\
    breaks: true,\n\
    smartLists: true,\n\
    smartypants: true\n\
  });\n\
\n\
  request\n\
    .get(url)\n\
    .end(this.render.bind(this));\n\
\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Expose `marked.setOptions`.\n\
 */\n\
\n\
MarkdownView.prototype.setOptions = marked.setOptions;\n\
\n\
/**\n\
 * Render.\n\
 *\n\
 * - Uses localStorage to cache the parsed result.\n\
 * - Error-messages from superagent are used as is.\n\
 *\n\
 * @param {Response} res\n\
 * @return void\n\
 */\n\
\n\
MarkdownView.prototype.render = function(res) {\n\
  var el = this.el\n\
    , url = this.url\n\
    , html = '';\n\
\n\
  switch (res.status) {\n\
    case 304:\n\
      html = store(url);\n\
      break;\n\
    case 200:\n\
      html = marked(res.text);\n\
      store(url, html);\n\
      break;\n\
    default:\n\
      html = '<h3>' + res.error + '</h3>';\n\
  }\n\
\n\
  if (res.ok) {\n\
    el.innerHTML = html;\n\
  }\n\
\n\
  classes(el).remove('hide');\n\
  this.emit('load');\n\
};\n\
\n\
//@ sourceURL=markdown-view/index.js"
));







require.alias("component-classes/index.js", "markdown-view/deps/classes/index.js");
require.alias("component-classes/index.js", "classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-emitter/index.js", "markdown-view/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-marked/lib/marked.js", "markdown-view/deps/marked/lib/marked.js");
require.alias("component-marked/lib/marked.js", "markdown-view/deps/marked/index.js");
require.alias("component-marked/lib/marked.js", "marked/index.js");
require.alias("component-marked/lib/marked.js", "component-marked/index.js");
require.alias("visionmedia-superagent/lib/client.js", "markdown-view/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "markdown-view/deps/superagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("yields-store/index.js", "markdown-view/deps/store/index.js");
require.alias("yields-store/index.js", "store/index.js");
require.alias("component-each/index.js", "yields-store/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "yields-store/deps/type/index.js");

require.alias("yields-unserialize/index.js", "yields-store/deps/unserialize/index.js");

require.alias("markdown-view/index.js", "markdown-view/index.js");