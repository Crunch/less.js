var LessError = require('../less-error'),
    tree = require('../tree');

var FunctionImporter = module.exports = function FunctionImporter(context, fileInfo) {
    this.context = context;
    this.fileInfo = fileInfo;
};

FunctionImporter.prototype.eval = function(contents, callback) {
    var loaded = {},
        loader,
        plugin,
        returnModule = {},
        returnExports = {},
        registry;

    registry = {
        add: function(name, func) {
            loaded[name] = func;
        },
        addMultiple: function(functions) {
            Object.keys(functions).forEach(function(name) {
                loaded[name] = functions[name];
            });
        }
    };

    try {
        loader = new Function("functions", "less", "tree", "fileInfo", contents);
        plugin = loader(registry, this.context.pluginManager.less, tree, this.fileInfo);
        if (plugin) {
            if (plugin.install) {
                this.context.pluginManager.addPlugin(plugin);
            }
            if (plugin.import) {
                plugin.import(registry);
            }
        }
    } catch(e) {
        callback(new LessError({
            message: "Plugin evaluation error: '" + e.name + ': ' + e.message.replace(/["]/g, "'") + "'" ,
            filename: this.fileInfo.filename
        }), null );
    }

    callback(null, { functions: loaded });
};
