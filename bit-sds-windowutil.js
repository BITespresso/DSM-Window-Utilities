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
         * Returns true if the provided application is installed.
         *
         * @param      {string}   appName  The application name.
         * @return     {boolean}  `true` if installed, `false` otherwise.
         */
        isInstalled: function(appName) {
            return (SYNO.SDS.AppUtil.getApps().indexOf(appName) !== -1);
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
     * Sets the restore XY position of all applications to cascaded, overlapping positions
     * determined by the specified window area and resets the restore size. The algorithm used
     * ensures that each window has a position that depends entirely on the specified window area,
     * regardless of which applications are installed or which DSM version is used.
     *
     * **Note 1**: Currently open application windows will not change their size and position. You
     * must close and reopen the windows to see the result. Do not move or resize the application
     * window beforehand, as this immediately sets the restore size and position to the current
     * window size and position.
     *
     * **Note 2**: The Synology CMS (Central Management System) application
     * (`SYNO.SDS.CMS.Application`) does not read the restore size and position due to a bug in DSM.
     * To ensure that this window has the correct size and position, each time this method is
     * called, the window will be opened and set to the correct size and position.
     *
     * @param      {BIT.SDS.Rectangle}  [windowArea]  The window area.
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlap();
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlap({x: 160, y: 139, width: 1640, height: 830});
     */
    cascadeOverlap: function(windowArea) {
        var windowAreaBottomRightCorner;
        var offsetX;
        var offsetY;

        var dsmVersion = BIT.SDS.Util.getDsmVersion();

        if (!BIT.SDS.Util.isRectangle(windowArea)) {
            windowArea = BIT.SDS.WindowUtil.suggestWindowArea();
        }

        offsetX = windowArea.x;
        offsetY = windowArea.y;

        windowAreaBottomRightCorner = {
            x: windowArea.x + windowArea.width,
            y: windowArea.y + windowArea.height
        };

        Ext.each(this.appWindowDataList, function(appWindowData) {
            var windowBottomRightCorner;
            var appInstances;

            windowBottomRightCorner = {
                x: offsetX + appWindowData.maxInitialWindowWidth,
                y: offsetY + appWindowData.maxInitialWindowHeight
            };

            if (windowBottomRightCorner.x > windowAreaBottomRightCorner.x && windowBottomRightCorner.y > windowAreaBottomRightCorner.y) {
                offsetX = windowArea.x;
                offsetY = windowArea.y;
            } else {
                if (windowBottomRightCorner.x > windowAreaBottomRightCorner.x) {
                    if (offsetX === windowArea.x) {
                        offsetY = windowArea.y;
                    }
                    offsetX = windowArea.x;
                } else {
                    if (windowBottomRightCorner.y > windowAreaBottomRightCorner.y) {
                        // offsetX += 30;
                        offsetY = windowArea.y;
                    }
                }
            }

            if (windowBottomRightCorner.x > windowAreaBottomRightCorner.x && windowBottomRightCorner.y > windowAreaBottomRightCorner.y) {
                offsetX = windowArea.x;
                offsetY = windowArea.y;
            } else {
                if (windowBottomRightCorner.x > windowAreaBottomRightCorner.x) {
                    if (offsetX === windowArea.x) {
                        offsetY = windowArea.y;
                    }
                    offsetX = windowArea.x;
                } else {
                    if (windowBottomRightCorner.y > windowAreaBottomRightCorner.y) {
                        // offsetX += 30;
                        offsetY = windowArea.y;
                    }
                }
            }

            if (appWindowData.dsmVersions.indexOf(dsmVersion) !== -1) {
                BIT.SDS.WindowUtil.resetRestoreSizeAndPosition(appWindowData.appName);
                BIT.SDS.WindowUtil.setRestorePagePosition(appWindowData.appName, offsetX, offsetY);

                if (appWindowData.appName === "SYNO.SDS.CMS.Application") {
                    appInstances = SYNO.SDS.AppMgr.getByAppName(appWindowData.appName);

                    if ((appInstances.length === 0) && BIT.SDS.Util.isInstalled(appWindowData.appName)) {
                        SYNO.SDS.AppLaunch(appWindowData.appName, {}, false, (function() {
                            var x = offsetX;
                            var y = offsetY;

                            return function(appInstance) {
                                if (Ext.isObject(appInstance)) {
                                    appInstance.window.setPagePosition(x, y);
                                }
                            };
                        })(), this);
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
     *   BIT.SDS.WindowUtil.getSizeAndPosition(appWindow);
     * }
     * // => {x: 300, y: 339, width: 920, height: 560}
     */
    getSizeAndPosition: function(appWindow) {
        var sizeAndPosition;
        var pagePosition;

        if (!(appWindow instanceof Ext.Window)) return;

        sizeAndPosition = appWindow.getSizeAndPosition();

        if (!("pageX" in sizeAndPosition) || !("pageY" in sizeAndPosition)) {
            pagePosition = BIT.SDS.WindowUtil.translateElementPointsToPagePosition(appWindow, sizeAndPosition.x, sizeAndPosition.y);
            sizeAndPosition.pageX = pagePosition.x;
            sizeAndPosition.pageY = pagePosition.y;
        }

        return {
            x:      sizeAndPosition.pageX,
            y:      sizeAndPosition.pageY,
            width:  sizeAndPosition.width,
            height: sizeAndPosition.height
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
    getSizeByLaunchingApp: function(appName, launchDelay) {
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
    getSize: function(appNames) {
        var rejectAfterTimeoutPromise;
        var promises = [];
        var launchDelay = 0;
        var launchDelayIncrement = 0;

        if (!appNames) appNames = BIT.SDS.WindowUtil.getAppNames();

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = BIT.SDS.WindowUtil.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);
            var appInstances;
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

            if (BIT.SDS.Util.isInstalled(appName)) {
                launchDelay += launchDelayIncrement;
                promises.push(BIT.SDS.WindowUtil.getSizeByLaunchingApp(appName, launchDelay));
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
     * In addition to {@link getSize}, this method will make several attempts to determine window
     * sizes and is therefore more robust.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    getSizeWithRetry: function(appNames) {
        if (!appNames) appNames = BIT.SDS.WindowUtil.getAppNames();

        return BIT.SDS.Promise.retry(BIT.SDS.WindowUtil.getSize.createDelegate(this, [appNames]), 5, 5000);
    },

    /**
     * Logs the window size(s) of the provided or all application(s) to the console in CSV format.
     * The record format is: `<application name>,<width>,<height>`
     *
     * If you call this method without providing `appNames`, all application window sizes will be
     * logged.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.logSize();
     * // SYNO.SDS.AdminCenter.Application;994;570
     * // SYNO.SDS.App.FileStation3.Instance;920;560
     * // ...
     *
     * @example
     * BIT.SDS.WindowUtil.logSize("SYNO.SDS.App.FileStation3.Instance");
     * // SYNO.SDS.App.FileStation3.Instance;920;560
     */
    logSize: function(appNames) {
        if (!appNames) appNames = BIT.SDS.WindowUtil.getAppNames();

        BIT.SDS.WindowUtil.getSizeWithRetry(appNames)
            .then(function(results) {
                Ext.each(results, function(result) {
                    console.log(this.appName + "," + this.width + "," + this.height);
                });
            })
            .catch(function(reason) {
                console.log("Error retrieving window size: " + ((reason instanceof Error) ? reason.message : reason));
            });
    },

    /**
     * Resets the restore size and XY position of the provided application(s).
     *
     * If you call this method without providing `appNames`, all application windows will be reset.
     *
     * **Note**: Currently open application windows will not change their size and position. You
     * must close and reopen the windows to see the result. Do not move or resize the application
     * window beforehand, as this immediately sets the restore size and position to the current
     * window size and position.
     *
     * @param      {string[]|string}  [appNames]  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizeAndPosition();
     * // Resets the window size and position for all applications
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizeAndPosition("SYNO.SDS.PkgManApp.Instance");
     * // Resets the window size and position for Package Center
     *
     * @example
     * BIT.SDS.WindowUtil.resetRestoreSizeAndPosition(["SYNO.SDS.PkgManApp.Instance", "SYNO.SDS.HA.Instance"]);
     * // Resets the window size and position for Package Center and High Availability Manager
     */
    resetRestoreSizeAndPosition: function(appNames) {
        if (!appNames) appNames = BIT.SDS.WindowUtil.getAppNames();

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = BIT.SDS.WindowUtil.getRestoreSizePosPropertyName(appName);

            SYNO.SDS.UserSettings.removeProperty(appName, restoreSizePosPropertyName);
        }, this);
    },

    /**
     * Sets the restore page XY position of the provided application.
     *
     * **Note**: Currently open application windows will not change their position. You must close
     * and reopen the windows to see the result. Do not move or resize the application window
     * beforehand, as this immediately sets the restore position to the current window position.
     *
     * @param      {string}  appName  The application name.
     * @param      {number}  x        The page x position.
     * @param      {number}  y        The page y position.
     *
     * @example
     * BIT.SDS.WindowUtil.setRestorePagePosition("SYNO.SDS.App.FileStation3.Instance", 10, 49);
     * // Sets the restore page XY position for File Station windows to (10px, 49px)
     */
    setRestorePagePosition: function(appName, x, y) {
        var restoreSizePosPropertyName = BIT.SDS.WindowUtil.getRestoreSizePosPropertyName(appName);
        var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName) || {};

        delete restoreSizePos.x;
        delete restoreSizePos.y;

        Ext.apply(restoreSizePos, {
            pageX:       x,
            pageY:       y,
            fromRestore: true
        });

        SYNO.SDS.UserSettings.setProperty(appName, restoreSizePosPropertyName, restoreSizePos);
    },

    /**
     * Calculates a suggestion for the window area which can be used as input for
     * {@link cascadeOverlap}. The suggested window area is printed to the console and
     * returned by this method.
     *
     * The suggestion is based on the current size of the browser window, therefore you should
     * adjust the browser window to your needs before calling this method.
     *
     * @return     {BIT.SDS.Rectangle}  The suggested window area.
     *
     * @example
     * BIT.SDS.WindowUtil.suggestWindowArea();
     * // => {x: 160, y: 139, width: 1640, height: 830}
     */
    suggestWindowArea: function() {
        var x;
        var y;
        var width;
        var height;
        var windowArea;
        var windowAreaLiteral;

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

        windowArea = new BIT.SDS.Rectangle(x, y, width, height);

        windowAreaLiteral = "{";
        for (var property in windowArea) {
            if (windowArea.hasOwnProperty(property)) {
                windowAreaLiteral += property + ": " + windowArea[property] + ", ";
            }
        }
        windowAreaLiteral = windowAreaLiteral.slice(0, -2) + "}";

        console.log("Using suggested window area: windowArea = " + windowAreaLiteral);

        return windowArea;
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
