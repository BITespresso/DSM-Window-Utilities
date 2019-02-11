/**
 * BITespresso namespace.
 * @namespace  BIT
 */
Ext.namespace("BIT");

/**
 * Synology DiskStation namespace.
 * @namespace  BIT.SDS
 */
Ext.namespace("BIT.SDS");

/**
 * Performs the required initializations of the DSM utilities. This method **must** be called once
 * before you call any other method from the DSM utilities.
 *
 * @method     BIT.SDS.init
 */
BIT.SDS.init = function() {
    BIT.SDS.WindowUtil = new BIT.SDS._WindowUtil();
};

Ext.namespace("BIT.SDS.AppWinSize");

Ext.define("BIT.SDS.AppWinSize",
/**
 * @lends      BIT.SDS.AppWinSize.prototype
 */
{
    /**
     * The application name.
     * @type       {string}
     */
    appName: undefined,

    /**
     * The window width.
     * @type       {number}
     */
    width: undefined,

    /**
     * The window height.
     * @type       {number}
     */
    height: undefined,

    /**
     * Creates a new {@link BIT.SDS.AppWinSize} instance.
     *
     * @method     BIT.SDS.AppWinSize
     * @constructs
     *
     * @param      {string}  appName  The application name.
     * @param      {number}  width    The window width.
     * @param      {number}  height   The window height.
     */
    constructor: function(appName, width, height) {
        this.appName = appName;
        this.width   = width;
        this.height  = height;
    }
});

Ext.namespace("BIT.SDS.Promise");

Ext.define("BIT.SDS.Promise",
/**
 * @lends      BIT.SDS.Promise.prototype
 */
{
    /**
     * @lends      BIT.SDS.Promise
     */
    statics: {
        state: {
            pending:   "pending",
            fulfilled: "fulfilled",
            rejected:  "rejected"
        },

        /**
         * Returns a promise that resolves when all of the promises passed have resolved or when the
         * array contains no promises. It rejects with the reason of the first promise that rejects.
         *
         * @param      {BIT.SDS.Promise[]}  promises  The promises.
         * @return     {BIT.SDS.Promise}    A new promise.
         */
        all: function(promises) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                var results = [];
                var resolved = 0;

                Ext.each(promises, function(promise, i) {
                    if (!promise || !Ext.isFunction(promise.then)) {
                        promise = BIT.SDS.Promise.resolve(promise);
                    }

                    promise
                        .then(function(value) {
                            results[i] = value;
                            resolved++;

                            if (resolved === promises.length) resolve(results);
                        })
                        .catch(function(reason) {
                            reject(reason);
                        });
                }, this);

                if (promises.length === 0) resolve(results);
            });
        },

        /**
         * Returns a new promise that resolves or rejects as soon as one of the promises passed
         * resolves or rejects, with the value or reason from that promise.
         *
         * @param      {BIT.SDS.Promise[]}  promises  The promises.
         * @return     {BIT.SDS.Promise}    A new promise.
         */
        race: function(promises) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                Ext.each(promises, function(promise) {
                    promise.then(resolve, reject);
                }, this);
            });
        },

        /**
         * Returns a promise that is rejected with the passed reason.
         *
         * @param      {*}                reason  The reason.
         * @return     {BIT.SDS.Promise}  A new rejecting promise.
         */
        reject: function(reason) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                reject(reason);
            });
        },

        /**
         * Returns a promise that is resolved with the passed value.
         *
         * @param      {*}                value   The value.
         * @return     {BIT.SDS.Promise}  A new resolving promise.
         */
        resolve: function(value) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                resolve(value);
            });
        },

        /**
         * Tries to resolve a promise multiple times if it is rejected. The passed function will be
         * called repeatedly until the promise returned by the function is resolved or the maximum
         * number of attempts is reached.
         *
         * Returns a new promise that is fulfilled with the fulfillment value of the promise
         * returned by the function, or is rejected with the same reason as the promise returned by
         * the function in the last attempt.
         *
         * Subsequent calls of the function will be deferred by a delay specified in milliseconds.
         *
         * @param      {Function}         fn      The function returning a promise.
         * @param      {number}           times   The maximum number of attempts.
         * @param      {number}           delay   The delay.
         * @return     {BIT.SDS.Promise}  A new promise.
         *
         * @example
         * var trySomething = function() {
         *   var resolver = function(resolve, reject) {
         *     ... // Try to resolve promise
         *   };
         *   return new BIT.SDS.Promise(resolver);
         * };
         * BIT.SDS.Promise.retry(trySomething, 5, 5000)
         *   .then(...)
         *   .catch(...);
         */
        retry: function(fn, times, delay) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                var lastRejectReason;
                var retry = function() {
                    if (times > 0) {
                        times--;
                        fn()
                            .then(resolve)
                            .catch(function(reason) {
                                lastRejectReason = reason;
                                setTimeout(retry, delay);
                            });
                    } else {
                        reject(lastRejectReason);
                    }
                };
                retry();
            });
        }
    },

    clients: undefined,

    result: undefined,

    state: undefined,

    /**
     * Creates a new {@link BIT.SDS.Promise} instance.
     *
     * @method     BIT.SDS.Promise
     * @constructs
     *
     * @param      {Function}  resolver  The resolver function.
     */
    constructor: function(resolver) {
        this.state = BIT.SDS.Promise.state.pending;
        this.clients = [];
        this.result = undefined;

        function resolve(value) {
            this.resolve(value);
        }

        function reject(reason) {
            this.reject(reason);
        }

        if (Ext.isFunction(resolver)) {
            try {
                resolver(resolve.createDelegate(this), reject.createDelegate(this));
            } catch (error) {
                this.reject(error);
            }
        } else if (arguments.length > 0) {
            throw Error("Promise resolver " + resolver + " is not a function");
        }
    },

    /**
     * Adds a callback to the promise to be called when this promise is rejected. Returns a new
     * promise that will be rejected when the callback is complete.
     *
     * @param      {Function}         onRejected  The rejected callback.
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    catch: function(onRejected) {
        return this.then(null, onRejected);
    },

    /**
     * Adds a callback to the promise to be called when this promise is fulfilled or rejected.
     * Returns a new promise that will be fulfilled or rejected when the callback is complete.
     *
     * @param      {Function}         onFinally  The finally callback.
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    finally: function(onFinally) {
        if (!Ext.isFunction(onFinally)) return this.then(onFinally, onFinally);

        function onFulfilled(value) {
            return new BIT.SDS.Promise(function(resolve) {
                resolve(onFinally());
            }).then(function() {
                return value;
            });
        }

        function onRejected(reason) {
            return new BIT.SDS.Promise(function(resolve) {
                resolve(onFinally());
            }).then(function() {
                throw reason;
            });
        }

        return this.then(onFulfilled.createDelegate(this), onRejected.createDelegate(this));
    },

    /**
     * Rejects the promise with the passed reason.
     *
     * @param      {*}   reason  The reason.
     */
    reject: function(reason) {
        if (this.state !== BIT.SDS.Promise.state.pending) return;

        this.state = BIT.SDS.Promise.state.rejected;
        this.result = reason;

        function rejectAllClients() {
            Ext.each(this.clients, function(client) {
                client.rejectClient(reason);
            }, this);
        }

        setTimeout(rejectAllClients.createDelegate(this));
    },

    /**
     * Resolves the promise with the passed value.
     *
     * @param      {*}       value   The value.
     */
    resolve: function(value) {
        var alreadyCalled = false;
        var then;

        function onFulfilled(value) {
            if (!alreadyCalled) {
                alreadyCalled = true;
                this.resolve(value);
            }
        }

        function onRejected(reason) {
            if (!alreadyCalled) {
                alreadyCalled = true;
                this.reject(reason);
            }
        }

        if (this.state !== BIT.SDS.Promise.state.pending) return;

        if (value === this) return this.reject(Error("A promise cannot be resolved by itself"));

        if (value && (Ext.isFunction(value) || Ext.isObject(value))) {
            try {
                then = value.then;

                if (Ext.isFunction(then)) {
                    then.call(value, onFulfilled.createDelegate(this), onRejected.createDelegate(this));

                    return;
                }
            } catch (error) {
                if (!alreadyCalled) this.reject(error);

                return;
            }
        }

        this.state = BIT.SDS.Promise.state.fulfilled;
        this.result = value;

        function fulfillAllClients() {
            Ext.each(this.clients, function(client) {
                client.fulfillClient(value);
            }, this);
        }

        setTimeout(fulfillAllClients.createDelegate(this));
    },

    /**
     * Adds callbacks to the promise to be called when this promise is fulfilled or rejected.
     * Returns a new promise that will be fulfilled or rejected when the callback is complete.
     *
     * @param      {Function}         onFulfilled  The fulfilled callback.
     * @param      {Function}         onRejected   The rejected callback.
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    then: function(onFulfilled, onRejected) {
        var promise = new BIT.SDS.Promise();
        var client = {
            onFulfilled: onFulfilled,
            onRejected: onRejected,
            promise: promise,

            fulfillClient: function(result) {
                if (Ext.isFunction(this.onFulfilled)) {
                    try {
                        var value = this.onFulfilled.call(undefined, result);
                        this.promise.resolve(value);
                    } catch (error) {
                        this.promise.reject(error);
                    }
                } else {
                    this.promise.resolve(result);
                }
            },

            rejectClient: function(result) {
                if (Ext.isFunction(this.onRejected)) {
                    try {
                        var value = this.onRejected.call(undefined, result);
                        this.promise.resolve(value);
                    } catch (error) {
                        this.promise.reject(error);
                    }
                } else {
                    this.promise.reject(result);
                }
            }
        };

        switch (this.state) {
        case BIT.SDS.Promise.state.pending:
            this.clients.push(client);
            break;

        case BIT.SDS.Promise.state.fulfilled:
            setTimeout(client.fulfillClient.createDelegate(client, [this.result]));
            break;

        case BIT.SDS.Promise.state.rejected:
            setTimeout(client.rejectClient.createDelegate(client, [this.result]));
            break;
        }

        return promise;
    }
});

Ext.namespace("BIT.SDS.Rectangle");

Ext.define("BIT.SDS.Rectangle",
/**
 * @lends      BIT.SDS.Rectangle.prototype
 */
{
    /**
     * The x-coordinate of the upper left egde.
     * @type       {number}
     */
    x: undefined,

    /**
     * The y-coordinate of the upper left egde.
     * @type       {number}
     */
    y: undefined,

    /**
     * The width of the rectangle.
     * @type       {number}
     */
    width: undefined,

    /**
     * The height of the rectangle.
     * @type       {number}
     */
    height: undefined,

    /**
     * Creates a new {@link BIT.SDS.Rectangle} instance.
     *
     * @method     BIT.SDS.Rectangle
     * @constructs
     *
     * @param      {number}  x       X-coordinate of the upper left egde.
     * @param      {number}  y       Y-coordinate of the upper left egde.
     * @param      {number}  width   The rectangle width.
     * @param      {number}  height  The rectangle height.
     */
    constructor: function(x, y, width, height) {
        this.x      = x;
        this.y      = y;
        this.width  = width;
        this.height = height;
    }
});

Ext.namespace("BIT.SDS.Util");

/**
 * @class      BIT.SDS.Util
 *
 * @hideconstructor
 */
Ext.define("BIT.SDS.Util",
{
    /**
     * @lends      BIT.SDS.Util
     */
    statics: {
        /**
         * Returns the DSM version installed on the DiskStation. The version has the format: `<major
         * version>.<minor version>`
         *
         * @return     {string}  The DSM version.
         *
         * @example
         * BIT.SDS.Util.getDsmVersion();
         * // => 6.2
         */
        getDsmVersion: function() {
            return _S("majorversion") + "." + _S("minorversion");
        },

        /**
         * Returns true if the passed object has the properties of a {@link BIT.SDS.Rectangle} and
         * these are all of type `number`.
         *
         * @param      {Object}   object  The object.
         * @return     {boolean}  `true` if rectangle, `false` otherwise.
         */
        isRectangle: function(object) {
            return Ext.isObject(object) && Ext.isNumber(object.x) && Ext.isNumber(object.y) && Ext.isNumber(object.width) && Ext.isNumber(object.height);
        }
    }
});

Ext.namespace("BIT.SDS._WindowUtil");

Ext.define("BIT.SDS._WindowUtil",
/**
 * @lends      BIT.SDS._WindowUtil.prototype
 */
{
    /**
     * @lends      BIT.SDS._WindowUtil
     */
    statics: {
        _appWindowDataList: [
            ["SYNO.SDS.AdminCenter.Application",        ["5.2", "6.0", "6.1", "6.2"], [ 994, 570]],
            ["SYNO.SDS.App.FileStation3.Instance",      ["5.2", "6.0", "6.1", "6.2"], [ 920, 560]],
            ["SYNO.SDS.EzInternet.Instance",            ["5.2", "6.0", "6.1", "6.2"], [ 700, 464]],
            ["SYNO.SDS.HelpBrowser.Application",        ["5.2", "6.0", "6.1", "6.2"], [ 995, 500]],
            ["SYNO.SDS.PkgManApp.Instance",             ["5.2", "6.0", "6.1", "6.2"], [1060, 580]],
            ["SYNO.SDS.ResourceMonitor.Instance",       ["5.2", "6.0", "6.1", "6.2"], [1024, 580]],
            ["SYNO.SDS.StorageManager.Instance",        ["5.2", "6.0", "6.1", "6.2"], [1000, 600]],
            ["SYNO.SDS.HA.Instance",                    ["5.2", "6.0", "6.1", "6.2"], [ 990, 580]],
            ["SYNO.SDS.LogCenter.Instance",             ["5.2", "6.0", "6.1", "6.2"], [1005, 580]],
            ["SYNO.SDS.SecurityScan.Instance",          ["5.2", "6.0", "6.1", "6.2"], [ 990, 570]],
            ["SYNO.SDS.SupportForm.Application",        ["5.2", "6.0", "6.1", "6.2"], [ 960, 580]],
            ["SYNO.SDS.Backup.Application",             ["5.2"                     ], [ 990, 580]],
            ["SYNO.SDS.ACEEditor.Application",          ["5.2"                     ], [ 800, 400]],
            ["SYNO.SDS.MyDSCenter.Application",         ["5.2"                     ], [ 990, 560]],
            ["SYNO.SDS.StorageReport.Application",      ["5.2"                     ], [ 965, 580]],
            ["SYNO.SDS.AV.Instance",                    ["5.2", "6.0", "6.1", "6.2"], [ 952, 580]],
            ["SYNO.SDS.AudioStation.Application",       ["5.2", "6.0", "6.1", "6.2"], [ 980, 600]],
            ["SYNO.SDS.CardDAVServer.Instance",         ["5.2", "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.SDS.CSTN.Instance",                  ["5.2", "6.0", "6.1", "6.2"], [ 968, 300]],
            ["SYNO.SDS.CloudStationClient.Instance",    ["5.2", "6.0", "6.1", "6.2"], [ 900, 530]],
            ["SYNO.SDS.DSCloudSync.Instance",           ["5.2", "6.0", "6.1", "6.2"], [ 900, 530]],
            ["SYNO.SDS.CMS.Application",                ["5.2", "6.0", "6.1", "6.2"], [ 990, 580]],
            ["SYNO.SDS.LDAP.AppInstance",               ["5.2", "6.0", "6.1", "6.2"], [ 990, 665]],
            ["SYNO.SDS.DNS.Instance",                   ["5.2", "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.SDS.Docker.Application",             ["5.2", "6.0", "6.1", "6.2"], [1060, 570]],
            ["SYNO.SDS.DownloadStation.Application",    ["5.2", "6.0", "6.1", "6.2"], [ 980, 580]],
            ["SYNO.SDS.GIT.Instance",                   ["5.2", "6.0", "6.1", "6.2"], [ 600, 350]],
            ["SYNO.SDS.Glacier.Instance",               ["5.2", "6.0", "6.1", "6.2"], [ 950, 480]],
            ["SYNO.SDS.HiDrive.Instance",               ["5.2", "6.0"              ], [1030, 580]],
            ["SYNO.SDS.iTunes.Application",             ["5.2", "6.0", "6.1", "6.2"], [ 620, 380]],
            ["SYNO.SDS.JAVAMANAGER.Instance",           ["5.2"                     ], [ 600, 300]],
            ["SYNO.SDS.MailServer.Instance",            ["5.2", "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.SDS.MARIADB.Instance",               ["5.2", "6.0", "6.1", "6.2"], [ 600, 500]],
            ["SYNO.SDS.MediaServer.AppInstance",        ["5.2", "6.0", "6.1", "6.2"], [ 950, 580]],
            ["SYNO.SDS.NoteStation.Application",        ["5.2", "6.0", "6.1", "6.2"], [1000, 580]],
            ["SYNO.SDS.App.PersonalSettings.Instance",  ["5.2", "6.0", "6.1", "6.2"], [ 850, 500]],
            ["SYNO.SDS.ProxyServer.Instance",           ["5.2", "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.SDS.RAD.Instance",                   ["5.2", "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.SDS.SSOServer.Instance",             ["5.2", "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.SDS.SVN.Instance",                   ["5.2", "6.0", "6.1", "6.2"], [ 600, 500]],
            ["SYNO.SDS.VideoStation.AppInstance",       ["5.2"                     ], [1022, 600]],
            ["SYNO.SDS.VPN.Instance",                   ["5.2", "6.0", "6.1", "6.2"], [ 860, 520]],
            ["SYNO.SDS.ActiveBackup.Instance",          [       "6.0", "6.1"       ], [1050, 580]],
            ["SYNO.SDS.Backup.Application",             [       "6.0", "6.1", "6.2"], [ 990, 580]],
            ["SYNO.SDS.BackupService.Instance",         [       "6.0", "6.1", "6.2"], [ 810, 575]],
            ["SYNO.SDS.JAVA7.Instance",                 [       "6.0", "6.1", "6.2"], [ 600, 300]],
            ["SYNO.SDS.JAVA8.Instance",                 [       "6.0", "6.1", "6.2"], [ 600, 300]],
            ["SYNO.SDS.MailPlusServer.Instance",        [       "6.0", "6.1", "6.2"], [1040, 600]],
            ["SYNO.SDS.MARIADB10.Instance",             [       "6.0", "6.1", "6.2"], [ 600, 500]],
            ["SYNO.SDS.DSMNotify.Setting.Application",  [       "6.0", "6.1", "6.2"], [ 625, 580]],
            ["SYNO.SDS.ClusteredShare.Application",     [       "6.0", "6.1", "6.2"], [ 960, 570]],
            ["SYNO.SDS.DisasterRecovery.Application",   [       "6.0", "6.1", "6.2"], [ 990, 580]],
            ["SYNO.SDS.StorageAnalyzer.Application",    [       "6.0", "6.1", "6.2"], [ 965, 580]],
            ["SYNO.TextEditor.Application",             [       "6.0", "6.1", "6.2"], [ 800, 400]],
            ["SYNO.SDS.WebStation.Application",         [       "6.0", "6.1", "6.2"], [ 990, 580]],
            ["SYNO.SDS.WebDAVServer.Instance",          [       "6.0", "6.1", "6.2"], [ 990, 560]],
            ["SYNO.Finder.Application",                 [              "6.1", "6.2"], [1000, 600]],
            ["SYNO.SDS.ActiveBackupGSuite.Instance",    [              "6.1", "6.2"], [1184, 592]],
            ["SYNO.SDS.ActiveBackupOffice365.Instance", [              "6.1", "6.2"], [1184, 592]],
            ["SYNO.SDS.PrestoServer.Application",       [              "6.1", "6.2"], [1024, 580]],
            ["SYNO.SDS.USBCopy.Application",            [              "6.1", "6.2"], [ 900, 530]],
            ["SYNO.SDS.iSCSI.Application",              [                     "6.2"], [1042, 580]],
            ["SYNO.SDS.OAuthService.Instance",          [                     "6.2"], [ 990, 560]],
            ["SYNO.ActiveBackup.AppInstance",           [                     "6.2"], [1184, 580]],
            ["SYNO.SDS.ADServer.Application",           [                     "6.2"], [ 990, 560]],
            ["SYNO.SDS.Virtualization.Application",     [                     "6.2"], [1038, 637]]
        ]
    },

    appWindowDataList: null,

    /**
     * Creates a new {@link BIT.SDS._WindowUtil} instance. Do **not call** this constructor in your
     * code. Instead, use {@link BIT.SDS.init}, which creates an instance of
     * {@link BIT.SDS._WindowUtil} as `BIT.SDS.WindowUtil` that you can use directly.
     *
     * @method     BIT.SDS._WindowUtil
     * @constructs
     *
     * @example
     * BIT.SDS.init();
     * BIT.SDS.WindowUtil.getAppNames();
     * // => ["SYNO.SDS.AdminCenter.Application", ...]
     */
    constructor: function() {
        this.appWindowDataList = [];

        Ext.each(BIT.SDS._WindowUtil._appWindowDataList, function(_appWindowData) {
            var appWindowData = {
                appName:                _appWindowData[0],
                dsmVersions:            _appWindowData[1],
                maxInitialWindowWidth:  _appWindowData[2][0],
                maxInitialWindowHeight: _appWindowData[2][1]
            };

            this.appWindowDataList.push(appWindowData);
        }, this);
    },

    /**
     * Sets all application windows to positions determined by the specified rectangle and to their
     * default or predefined sizes. The algorithm used ensures that each window has a position that
     * depends entirely on the specified rectangle, regardless of which applications are installed
     * or which DSM version is used.
     *
     * If the option `useDefinedSizes` is set to `true`, the windows will be set to the sizes
     * defined internally in this script. This results in a particular application window having the
     * same size for all DSM versions regardless of its default size. The internally defined window
     * sizes are the maximum of the standard window sizes for all application and DSM versions.
     * However, since the standard size of an application window can increase with increasing
     * application or DSM version number, the sizes in this script might be changed in future
     * versions.
     *
     * **Note 1**: Open application windows are moved to the desired position, but unless the
     * `useDefinedSizes` option is 'true', their size will not be changed immediately. In this case,
     * you must manually close and reopen the windows to see the effects of resetting the window
     * size. Before doing so, do not move or resize an open application window, as this will
     * immediately set the restore size back to the current window size.
     *
     * **Note 2**: The Synology CMS (Central Management System) application
     * (`SYNO.SDS.CMS.Application`) does not read the stored window size and position due to a bug
     * in DSM. To ensure that this window has the correct size and position, each time this method
     * is called, the window will be opened and set to the correct size and position.
     *
     * @param      {BIT.SDS.Rectangle}  [rectangle]        The rectangle.
     * @param      {boolean}            [useDefinedSizes]  Use defined sizes (Default: `false`).
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlapWindows();
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlapWindows({x: 160, y: 139, width: 1640, height: 830});
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlapWindows({x: 160, y: 139, width: 1640, height: 830}, true);
     */
    cascadeOverlapWindows: function(rectangle, useDefinedSizes) {
        var rectangleBottomRightCorner;
        var offsetX;
        var offsetY;

        var dsmVersion = BIT.SDS.Util.getDsmVersion();

        if (!BIT.SDS.Util.isRectangle(rectangle)) {
            rectangle = this.suggestRectangle();
        }

        offsetX = rectangle.x;
        offsetY = rectangle.y;

        rectangleBottomRightCorner = {
            x: rectangle.x + rectangle.width,
            y: rectangle.y + rectangle.height
        };

        Ext.each(this.appWindowDataList, function(appWindowData) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appWindowData.appName);
            var restoreSizePos;
            var windowBottomRightCorner;
            var appInstances;
            var installedAppNames;

            windowBottomRightCorner = {
                x: offsetX + appWindowData.maxInitialWindowWidth,
                y: offsetY + appWindowData.maxInitialWindowHeight
            };

            if (windowBottomRightCorner.x > rectangleBottomRightCorner.x && windowBottomRightCorner.y > rectangleBottomRightCorner.y) {
                offsetX = rectangle.x;
                offsetY = rectangle.y;
            } else {
                if (windowBottomRightCorner.x > rectangleBottomRightCorner.x) {
                    if (offsetX === rectangle.x) {
                        offsetY = rectangle.y;
                    }
                    offsetX = rectangle.x;
                } else {
                    if (windowBottomRightCorner.y > rectangleBottomRightCorner.y) {
                        // offsetX += 30;
                        offsetY = rectangle.y;
                    }
                }
            }

            if (appWindowData.dsmVersions.indexOf(dsmVersion) !== -1) {
                restoreSizePos = {
                    fromRestore: true,
                    pageX: offsetX,
                    pageY: offsetY
                };

                if (useDefinedSizes) {
                    restoreSizePos.width  = appWindowData.maxInitialWindowWidth;
                    restoreSizePos.height = appWindowData.maxInitialWindowHeight;
                }

                SYNO.SDS.UserSettings.setProperty(appWindowData.appName, restoreSizePosPropertyName, restoreSizePos);
                this.setWindowSizeAndPagePosition(appWindowData.appName, restoreSizePos.pageX, restoreSizePos.pageY, restoreSizePos.width, restoreSizePos.height);

                if (appWindowData.appName === "SYNO.SDS.CMS.Application") {
                    appInstances = SYNO.SDS.AppMgr.getByAppName(appWindowData.appName);
                    installedAppNames = SYNO.SDS.AppUtil.getApps();

                    if ((appInstances.length === 0) && (installedAppNames.indexOf(appWindowData.appName) !== -1)) {
                        SYNO.SDS.AppLaunch(appWindowData.appName, {}, false, function(appInstance) {
                            if (Ext.isObject(appInstance)) {
                                appInstance.window.setPagePosition(restoreSizePos.pageX, restoreSizePos.pageY);
                            }
                        }, this);
                    }
                }
            }

            offsetX += 30;
            offsetY += 30;
        }, this);
    },

    /**
     * Returns a list of all applications available for the DSM version installed on the
     * DiskStation, which open a window on the DSM desktop.
     *
     * @return     {string[]}  The list of application names.
     *
     * @example
     * BIT.SDS.WindowUtil.getAppNames();
     * // => ["SYNO.SDS.AdminCenter.Application", ...]
     */
    getAppNames: function() {
        var appNames = [];
        var dsmVersion = BIT.SDS.Util.getDsmVersion();

        Ext.each(this.appWindowDataList, function() {
            if (this.dsmVersions.indexOf(dsmVersion) !== -1) appNames.push(this.appName);
        });

        return appNames;
    },

    /**
     * Returns the name of the property, which contains the restore size and position of the
     * application window.
     *
     * @param      {string}  appName  The application name.
     * @return     {string}  The property name.
     */
    getRestoreSizePosPropertyName: function(appName) {
        var restoreSizePosPropertyName = "restoreSizePos";
        var dsmVersion = BIT.SDS.Util.getDsmVersion();

        if (appName === "SYNO.SDS.HA.Instance") {
            if (["5.2", "6.0", "6.1"].indexOf(dsmVersion) !== -1) {
                restoreSizePosPropertyName = "restoreSizePos";
            } else {
                restoreSizePosPropertyName = "bindHAWizardWindowRestoreSizePos";
            }
        }

        return restoreSizePosPropertyName;
    },

    /**
     * Gets the size and page position of an application window.
     *
     * @param      {Ext.Window}  appWindow  The application window.
     * @return     {Object}      An object with `x`, `y`, `width` and `height` properties.
     *
     * @example
     * var appInstances = SYNO.SDS.AppMgr.getByAppName("SYNO.SDS.App.FileStation3.Instance");
     * if (appInstances.length > 0) {
     *   var appWindow = appInstances[0].window;
     *   BIT.SDS.WindowUtil.getWindowSizeAndPagePosition(appWindow);
     * }
     * // => {x: 310, y: 349, width: 920, height: 560}
     */
    getWindowSizeAndPagePosition: function(appWindow) {
        var windowSizeAndPagePosition;
        var pagePosition;

        if (!(appWindow instanceof Ext.Window)) return;

        windowSizeAndPagePosition = appWindow.getSizeAndPosition();

        if (!("pageX" in windowSizeAndPagePosition) || !("pageY" in windowSizeAndPagePosition)) {
            pagePosition = this.translateElementPointsToPagePosition(appWindow, windowSizeAndPagePosition.x, windowSizeAndPagePosition.y);
            windowSizeAndPagePosition.pageX = pagePosition.x;
            windowSizeAndPagePosition.pageY = pagePosition.y;
        }

        return {
            x:      windowSizeAndPagePosition.pageX,
            y:      windowSizeAndPagePosition.pageY,
            width:  windowSizeAndPagePosition.width,
            height: windowSizeAndPagePosition.height
        };
    },

    /**
     * Retrieves the window size of the provided application by launching the application. If the
     * application window is already open, the current size of this window is returned.
     *
     * The application will be launched after a delay specified in milliseconds.
     *
     * Launching the application is an asychronous operation, therefore this method returns a
     * promise that is fulfilled with the window size.
     *
     * @param      {string}           appName      The application name.
     * @param      {number}           launchDelay  The launch delay.
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    getWindowSizeByLaunchingAppPromise: function(appName, launchDelay) {
        var appInstances;

        return new BIT.SDS.Promise(function(resolve, reject) {
            SYNO.SDS.AppLaunch.defer(launchDelay, this, [appName, {}, false, function(appInstance) {
                var windowSize;

                if (Ext.isObject(appInstance)) {
                    windowSize = new BIT.SDS.AppWinSize(appName, appInstance.window.getWidth(), appInstance.window.getHeight());
                    resolve(windowSize);
                } else {
                    appInstances = SYNO.SDS.AppMgr.getByAppName(appName);

                    if (appInstances.length > 0) {
                        windowSize = new BIT.SDS.AppWinSize(appName, appInstances[0].window.getWidth(), appInstances[0].window.getHeight());
                        resolve(windowSize);
                    } else {
                        reject(Error("Failed to launch " + appName));
                    }
                }
            }, this]);
        });
    },

    /**
     * Retrieves the window size(s) of the provided or all application(s). To retrieve the window
     * sizes, different methods will be applied until the first succeeds:
     *
     * * Get the window size from the restore size property
     * * Get the size from an open window of the respective application
     * * Launch the application and get the size of the opened window
     *
     * Launching the application(s) is an asychronous operation, therefore this method returns a
     * promise that is fulfilled with an array of the window sizes.
     *
     * If you call this method without providing `appNames`, all application window sizes will be
     * retrieved.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    getWindowSizesPromise: function(appNames) {
        var rejectAfterTimeoutPromise;
        var promises = [];
        var launchDelay = 0;
        var launchDelayIncrement = 0;

        if (!appNames) appNames = this.getAppNames();

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);
            var appInstances;
            var installedAppNames;
            var windowSize;

            if (restoreSizePos) {
                if (Ext.isDefined(restoreSizePos.width) && Ext.isDefined(restoreSizePos.height)) {
                    windowSize = new BIT.SDS.AppWinSize(appName, restoreSizePos.width, restoreSizePos.height);
                    promises.push(BIT.SDS.Promise.resolve(windowSize));
                    return;
                }
            }

            appInstances = SYNO.SDS.AppMgr.getByAppName(appName);

            if (appInstances.length > 0) {
                windowSize = new BIT.SDS.AppWinSize(appName, appInstances[0].window.getWidth(), appInstances[0].window.getHeight());
                promises.push(BIT.SDS.Promise.resolve(windowSize));
                return;
            }

            installedAppNames = SYNO.SDS.AppUtil.getApps();

            if (installedAppNames.indexOf(appName) !== -1) {
                launchDelay += launchDelayIncrement;
                promises.push(this.getWindowSizeByLaunchingAppPromise(appName, launchDelay));
                launchDelayIncrement = 1000;
                return;
            }
        }, this);

        rejectAfterTimeoutPromise = new BIT.SDS.Promise(function(resolve, reject) {
            setTimeout(function() {
                reject(Error("Operation timed out"));
            }, launchDelay + 10000);
        });

        return BIT.SDS.Promise.race([BIT.SDS.Promise.all(promises), rejectAfterTimeoutPromise]);
    },

    /**
     * Retrieves the window size(s) of the provided or all application(s). To retrieve the window
     * sizes, different methods will be applied until the first succeeds:
     *
     * * Get the window size from the restore size property
     * * Get the size from an open window of the respective application
     * * Launch the application and get the size of the opened window
     *
     * Launching the application(s) is an asychronous operation, therefore this method returns a
     * promise that is fulfilled with an array of the window sizes.
     *
     * If you call this method without providing `appNames`, all application window sizes will be
     * retrieved.
     *
     * In addition to {@link getWindowSizesPromise}, this method will make several attempts to
     * determine window sizes and is therefore more robust.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    getWindowSizesPromiseWithRetry: function(appNames) {
        if (!appNames) appNames = this.getAppNames();

        return BIT.SDS.Promise.retry(BIT.SDS.WindowUtil.getWindowSizesPromise.createDelegate(this, [appNames]), 5, 5000);
    },

    /**
     * Prints the window size(s) of the provided or all application(s) to the console in CSV format.
     * The record format is: `<application name>,<width>,<height>`
     *
     * If you call this method without providing `appNames`, all application window sizes will be
     * printed.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.printWindowSizes();
     * // SYNO.SDS.AdminCenter.Application;994;570
     * // SYNO.SDS.App.FileStation3.Instance;920;560
     * // ...
     *
     * @example
     * BIT.SDS.WindowUtil.printWindowSizes("SYNO.SDS.App.FileStation3.Instance");
     * // SYNO.SDS.App.FileStation3.Instance;920;560
     */
    printWindowSizes: function(appNames) {
        if (!appNames) appNames = this.getAppNames();

        BIT.SDS.WindowUtil.getWindowSizesPromiseWithRetry(appNames)
            .then(function(results) {
                Ext.each(results, function(result) {
                    console.log(this.appName + "," + this.width + "," + this.height);
                });
            })
            .catch(function(reason) {
                console.log("Error retrieving window sizes: " + ((reason instanceof Error) ? reason.message : reason));
            });
    },

    /**
     * Reset the window restore positions of the provided or all application(s). This sets the
     * position of the application windows to the values and behavior after the initial DSM
     * installation.
     *
     * The window positions will not be fixed, but determined by an algorithm that offsets the upper
     * left corner of each newly opened window.
     *
     * If you call this method without providing `appNames`, all application windows will be reset.
     *
     * **Note**: Open application windows will not change their position. You must manually close
     * and reopen the windows to see the effects of the reset. Before doing so, do not move or
     * resize an open application window, as this will immediately set the restore size and position
     * back to the current window size and position.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestorePositions();
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestorePositions("SYNO.SDS.PkgManApp.Instance");
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestorePositions(["SYNO.SDS.HA.Instance", ...]);
     */
    resetRestorePositions: function(appNames) {
        if (!appNames) appNames = this.getAppNames();

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);

            if (restoreSizePos) {
                delete restoreSizePos.fromRestore;
                delete restoreSizePos.pageX;
                delete restoreSizePos.pageY;
                delete restoreSizePos.x;
                delete restoreSizePos.y;
                SYNO.SDS.UserSettings.setProperty(appName, restoreSizePosPropertyName, restoreSizePos);
            }
        }, this);
    },

    /**
     * Reset the window restore sizes of the provided or all application(s). This sets the size of
     * the application windows to the values and behavior after the initial DSM installation.
     *
     * The window sizes will therefore be the default sizes of the individual application windows
     * defined internally by the application.
     *
     * If you call this method without providing `appNames`, all application windows will be reset.
     *
     * **Note**: Open application windows will not change their size. You must manually close and
     * reopen the windows to see the effects of the reset. Before doing so, do not move or resize an
     * open application window, as this will immediately set the restore size and position back to
     * the current window size and position.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizes();
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizes("SYNO.SDS.PkgManApp.Instance");
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizes(["SYNO.SDS.HA.Instance", ...]);
     */
    resetRestoreSizes: function(appNames) {
        if (!appNames) appNames = this.getAppNames();

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);

            if (restoreSizePos) {
                delete restoreSizePos.width;
                delete restoreSizePos.height;
                SYNO.SDS.UserSettings.setProperty(appName, restoreSizePosPropertyName, restoreSizePos);
            }
        }, this);
    },

    /**
     * Reset the window restore sizes and positions of the provided or all application(s). This sets
     * the size and position of the application windows to the values and behavior after the initial
     * DSM installation.
     *
     * The window sizes will therefore be the default sizes of the individual application windows
     * defined internally by the application.
     *
     * The window positions will not be fixed, but determined by an algorithm that offsets the upper
     * left corner of each newly opened window.
     *
     * If you call this method without providing `appNames`, all application windows will be reset.
     *
     * **Note**: Open application windows will not change their size and position. You must manually
     * close and reopen the windows to see the effects of the reset. Before doing so, do not move or
     * resize an open application window, as this will immediately set the restore size and position
     * back to the current window size and position.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizesAndPositions();
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizesAndPositions("SYNO.SDS.PkgManApp.Instance");
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizesAndPositions(["SYNO.SDS.HA.Instance", ...]);
     */
    resetRestoreSizesAndPositions: function(appNames) {
        if (!appNames) appNames = this.getAppNames();

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);

            if (restoreSizePos) {
                SYNO.SDS.UserSettings.removeProperty(appName, restoreSizePosPropertyName);
            }
        }, this);
    },

    /**
     * Sets the size and page position of the windows of the provided application. Currently open
     * windows will be resized and moved to the new position. In addition, the window restore size
     * and position of the provided application is set so that newly opened windows will have the
     * specified size and position.
     *
     * If an open application window is in `maximized` and/or `hidden` state, this method will not
     * change the state. However, after restoring the 'normal' state, the window will have the
     * specified coordinates and dimensions.
     *
     * If a coordinate or dimension *is not* to be set to a certain value, but is to retain its
     * current value, the corresponding parameter must be `undefined`. This can be used to simply
     * move or resize a window without changing its size or position.
     *
     * If a coordinate or dimension should be reset to the default values after the first DSM
     * installation, the corresponding parameter must be `null`.
     *
     * **Note 1**: The default values that are used after a reset via a `null` parameter are
     * internal to DSM and therefore unknown. For this reason, the currently open application
     * windows cannot be resized or moved to this position. As a consequnce you must manually close
     * and reopen the windows to see the effects of the reset. Before doing so, do not move or
     * resize an open application window, as this will immediately set the restore size and position
     * back to the current window size and position.
     *
     * **Note 2**: The x- and y-coordinates of a window cannot be reset independently via a `null`
     * parameter. If either the x- or y-coordinate parameter is `null`, the method will treat it as
     * `null` for both the x- and y-coordinate.
     *
     * **Note 3**: If the specified width or height of the window is smaller than the DSM internally
     * defined *minimum* width or height of the window and no window of the application is currently
     * open, then the width and height are set to the *default* width or height (instead of the
     * *minimum* width or height). This is due to an error in the DSM and cannot be changed.
     *
     * @param      {string}                 appName  The application name.
     * @param      {number|undefined|null}  x        X-coordinate of the upper left egde.
     * @param      {number|undefined|null}  y        Y-coordinate of the upper left egde.
     * @param      {number|undefined|null}  width    The window width.
     * @param      {number|undefined|null}  height   The window height.
     *
     * @example
     * BIT.SDS.WindowUtil.setWindowSizeAndPagePosition("SYNO.SDS.App.FileStation3.Instance", 10, 49, 1600, 900);
     * // Sets the x- and y-coordinate of all open File Station windows to (10px, 49px) and the size to 1600px x 900px
     *
     * @example
     * BIT.SDS.WindowUtil.setWindowSizeAndPagePosition("SYNO.SDS.App.FileStation3.Instance", 10, undefined, undefined, undefined);
     * // Sets the x-coordinate of all open File Station windows to 10px
     *
     * @example
     * BIT.SDS.WindowUtil.setWindowSizeAndPagePosition("SYNO.SDS.App.FileStation3.Instance", null, null, null, null);
     * // Resets the window restore size and position for File Station windows
     */
    setWindowSizeAndPagePosition: function(appName, x, y, width, height) {
        var appInstances;
        var appWindow;
        var windowSizeAndPagePosition;
        var newX;
        var newY;
        var newWidth;
        var newHeight;
        var elementPoints;
        var restoreSizePos;

        var minWidth  = 0;
        var minHeight = 0;

        var deletedX      = false;
        var deletedY      = false;
        var deletedWidth  = false;
        var deletedHeight = false;
        var assigned      = false;

        var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);

        appInstances = SYNO.SDS.AppMgr.getByAppName(appName);

        if (appInstances.length > 0) {
            Ext.each(appInstances, function(appInstance) {
                appWindow = appInstance.window;
                windowSizeAndPagePosition = this.getWindowSizeAndPagePosition(appWindow);

                if ((x === null) || (y === null)) {
                    newX = windowSizeAndPagePosition.x;
                    newY = windowSizeAndPagePosition.y;
                } else {
                    newX = Ext.isNumber(x) ? x : windowSizeAndPagePosition.x;
                    newY = Ext.isNumber(y) ? y : windowSizeAndPagePosition.y;
                }

                newWidth  = Ext.isNumber(width)  ? width  : windowSizeAndPagePosition.width;
                newHeight = Ext.isNumber(height) ? height : windowSizeAndPagePosition.height;

                minWidth  = Ext.isDefined(appWindow.minWidth)  ? appWindow.minWidth  : minWidth;
                minHeight = Ext.isDefined(appWindow.minHeight) ? appWindow.minHeight : minHeight;

                newWidth  = (newWidth  < minWidth)  ? minWidth  : newWidth;
                newHeight = (newHeight < minHeight) ? minHeight : newHeight;

                if (appWindow.maximized || appWindow.hidden) {
                    elementPoints = this.translatePagePositionToElementPoints(appWindow, newX, newY);

                    if (appWindow.draggable && appWindow.restorePos) {
                        appWindow.restorePos[0] = elementPoints.left;
                        appWindow.restorePos[1] = elementPoints.top;
                    } else {
                        appWindow.x = elementPoints.left;
                        appWindow.y = elementPoints.top;
                    }

                    if (appWindow.resizable) {
                        if (appWindow.restoreSize) {
                            appWindow.restoreSize.width  = newWidth;
                            appWindow.restoreSize.height = newHeight;
                        } else {
                            appWindow.width  = newWidth;
                            appWindow.height = newHeight;
                        }
                    }
                }

                if (!appWindow.maximized) {
                    appWindow.setPagePosition(newX, newY);
                    appWindow.setSize(newWidth, newHeight);
                }
            }, this);
        }

        restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);
        restoreSizePos = restoreSizePos ? restoreSizePos : {};
        restoreSizePos.fromRestore = true;

        if ((x === null) || (y === null)) {
            delete restoreSizePos.fromRestore;

            delete restoreSizePos.pageX;
            delete restoreSizePos.x;
            deletedX = true;

            delete restoreSizePos.pageY;
            delete restoreSizePos.y;
            deletedY = true;
        } else {
            if (Ext.isNumber(x)) {
                restoreSizePos.pageX = x;
                delete restoreSizePos.x;
                assigned = true;
            }

            if (Ext.isNumber(y)) {
                restoreSizePos.pageY = y;
                delete restoreSizePos.y;
                assigned = true;
            }
        }

        if (width === null) {
            delete restoreSizePos.width;
            deletedWidth = true;
        } else if (Ext.isNumber(width)) {
            restoreSizePos.width = (width < minWidth) ? minWidth : width;
            assigned = true;
        }

        if (height === null) {
            delete restoreSizePos.height;
            deletedHeight = true;
        } else if (Ext.isNumber(height)) {
            restoreSizePos.height = (height < minHeight) ? minHeight : height;
            assigned = true;
        }

        if (deletedX && deletedY && deletedWidth && deletedHeight) {
            SYNO.SDS.UserSettings.removeProperty(appName, restoreSizePosPropertyName);
        } else if (assigned || deletedX || deletedY || deletedWidth || deletedHeight) {
            SYNO.SDS.UserSettings.setProperty(appName, restoreSizePosPropertyName, restoreSizePos);
        }
    },

    /**
     * Calculates a suggestion for the rectangle which can be used as input for
     * {@link cascadeOverlapWindows}. The suggested rectangle is printed to the console and
     * returned by this method.
     *
     * The suggestion is based on the current size of the browser window, therefore you should
     * adjust the browser window to your needs before calling this method.
     *
     * @return     {BIT.SDS.Rectangle}  The suggested rectangle.
     *
     * @example
     * BIT.SDS.WindowUtil.suggestRectangle();
     * // => {x: 160, y: 139, width: 1640, height: 830}
     */
    suggestRectangle: function() {
        var x;
        var y;
        var width;
        var height;
        var rectangle;
        var rectangleLiteral;

        var taskbarHeight = Ext.get("sds-taskbar").getHeight();
        var desktopShortcutsWidth = Ext.select("li.launch-icon").first().getWidth() + (2 * Ext.select("ul.sds-desktop-shortcut").first().getMargins("l"));

        var marginTopSmall    = 10;
        var marginRightSmall  = 10;
        var marginBottomSmall = 10;
        var marginLeftSmall   = 10;

        var marginTopLarge    = 100;
        var marginRightLarge  = 100;
        var marginBottomLarge = 100;
        var marginLeftLarge   = desktopShortcutsWidth - ((desktopShortcutsWidth - 11) % 30) + 29;

        var innerWidth  = window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth;
        var innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        innerWidth  -= 16;
        innerHeight -= 18;

        if (innerWidth - marginLeftLarge - marginRightLarge > 1200) {
            x = marginLeftLarge;
            width = innerWidth - marginLeftLarge - marginRightLarge;
        } else {
            x = marginLeftSmall;
            width = innerWidth - marginLeftSmall - marginRightSmall;
        }

        if (innerHeight - taskbarHeight - marginTopLarge - marginBottomLarge > 700) {
            y = taskbarHeight + marginTopLarge;
            height = innerHeight - taskbarHeight - marginTopLarge - marginBottomLarge;
        } else {
            y = taskbarHeight + marginTopSmall;
            height = innerHeight - taskbarHeight - marginTopSmall - marginBottomSmall;
        }

        width  -= width  % 5;
        height -= height % 5;

        rectangle = new BIT.SDS.Rectangle(x, y, width, height);

        rectangleLiteral = "{";
        for (var property in rectangle) {
            if (rectangle.hasOwnProperty(property)) {
                rectangleLiteral += property + ": " + rectangle[property] + ", ";
            }
        }
        rectangleLiteral = rectangleLiteral.slice(0, -2) + "}";

        console.log("Using suggested rectangle: rectangle = " + rectangleLiteral);

        return rectangle;
    },

    /**
     * Translates the passed left/top CSS values for the window into page coordinates. If a provided
     * value is undefined, the corresponding property in the returned object will also be undefined.
     *
     * @param      {Ext.Window}        appWindow  The application window.
     * @param      {number|undefined}  left       Left CSS value.
     * @param      {number|undefined}  top        Top CSS value.
     * @return     {Object}            An object with `x` and `y` properties.
     *
     * @example
     * var appInstances = SYNO.SDS.AppMgr.getByAppName("SYNO.SDS.App.FileStation3.Instance");
     * if (appInstances.length > 0) {
     *   var appWindow = appInstances[0].window;
     *   BIT.SDS.WindowUtil.translateElementPointsToPagePosition(appWindow, 0, 0);
     * }
     * // => {x: 0, y: 39}
     */
    translateElementPointsToPagePosition: function(appWindow, left, top) {
        var offset = appWindow.getPositionEl().translatePoints(0, 0);
        return {
            x: left - offset.left,
            y: top  - offset.top
        };
    },

    /**
     * Translates the passed page coordinates into left/top CSS values for the window. If a provided
     * coordinate is undefined, the corresponding property in the returned object will also be
     * undefined.
     *
     * @param      {Ext.Window}        appWindow  The application window.
     * @param      {number|undefined}  x          X-coordinate of the upper left egde.
     * @param      {number|undefined}  y          Y-coordinate of the upper left egde.
     * @return     {Object}            An object with `left` and `top` properties.
     *
     * @example
     * var appInstances = SYNO.SDS.AppMgr.getByAppName("SYNO.SDS.App.FileStation3.Instance");
     * if (appInstances.length > 0) {
     *   var appWindow = appInstances[0].window;
     *   BIT.SDS.WindowUtil.translatePagePositionToElementPoints(appWindow, 0, 0);
     * }
     * // => {left: 0, top: -39}
     */
    translatePagePositionToElementPoints: function(appWindow, x, y) {
        var offset = appWindow.getPositionEl().translatePoints(0, 0);
        return {
            left: x + offset.left,
            top:  y + offset.top
        };
    }
});

BIT.SDS.init();
