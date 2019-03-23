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

Ext.namespace("BIT.SDS.LaunchMgr");

/**
 * @class      BIT.SDS.LaunchMgr
 *
 * @hideconstructor
 */
Ext.define("BIT.SDS.LaunchMgr",
{
    /**
     * @lends      BIT.SDS.LaunchMgr
     */
    statics: {
        lastLaunchTime: 0,

        /**
         * Launches a DSM application and returns a promise for the application instance.
         *
         * The promise will resolve to `null` instead of an application instance if one of these
         * conditions applies:
         *
         * - An invalid application name is provided
         * - The application is not installed
         * - An instance of the application is already running
         * - Launching the application failed
         * - The application launch is not completed before the timeout is reached
         *
         * @param      {string}           appName  The application name.
         * @return     {BIT.SDS.Promise}  A promise for a `SYNO.SDS.AppInstance` object or `null`.
         */
        launch: function(appName) {
            var MIN_TIME_BETWEEN_LAUNCHES = 1000;
            var LAUNCH_TIMEOUT            = 30000;
            var DELAY_BEFORE_RESOLVE      = 2000;
            var MAX_TRIES                 = 3;
            var MIN_TIME_BETWEEN_TRIES    = 10000;

            function tryLaunch(appName) {
                var currentTime = new Date().getTime();
                var timeSinceLastLaunch = currentTime - BIT.SDS.LaunchMgr.lastLaunchTime;
                var launchDelay;
                var promise;
                var rejectAfterTimeoutPromise;

                if (timeSinceLastLaunch > MIN_TIME_BETWEEN_LAUNCHES) {
                    launchDelay = 0;
                } else {
                    launchDelay = MIN_TIME_BETWEEN_LAUNCHES - timeSinceLastLaunch;
                }

                BIT.SDS.LaunchMgr.lastLaunchTime = currentTime + launchDelay;

                promise = new BIT.SDS.Promise(function(resolve, reject) {
                    SYNO.SDS.AppLaunch.defer(launchDelay, this, [appName, {}, false, function(appInstance) {
                        var oldInstances;

                        if (appInstance) {
                            resolve.defer(DELAY_BEFORE_RESOLVE, this, [appInstance]);
                        } else {
                            oldInstances = SYNO.SDS.AppMgr.getByAppName(appName);

                            if (oldInstances.length > 0) {
                                resolve.defer(DELAY_BEFORE_RESOLVE, this, [oldInstances[oldInstances.length - 1]]);
                            } else {
                                resolve(null);
                            }
                        }
                    }, this]);
                });

                rejectAfterTimeoutPromise = new BIT.SDS.Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve(null);
                    }, launchDelay + LAUNCH_TIMEOUT);
                });

                return BIT.SDS.Promise.race([promise, rejectAfterTimeoutPromise]);
            }

            if ((BIT.SDS.WindowUtil.getAppNamesForDsmVersion().indexOf(appName) === -1) || !BIT.SDS.WindowUtil.isInstalled(appName) || (SYNO.SDS.AppMgr.getByAppName(appName).length > 0)) {
                return BIT.SDS.Promise.resolve(null);
            }

            return BIT.SDS.Promise.retry(tryLaunch.createDelegate(this, [appName]), MAX_TRIES, MIN_TIME_BETWEEN_TRIES);
        }
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
        STATE: {
            PENDING:   "pending",
            FULFILLED: "fulfilled",
            REJECTED:  "rejected"
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
         * @param      {number}           tries   The maximum number of attempts.
         * @param      {number}           delay   The delay.
         * @return     {BIT.SDS.Promise}  A new promise.
         *
         * @example
         * function trySomething() {
         *   function resolver(resolve, reject) {
         *     ... // Try to resolve promise
         *   }
         *
         *   return new BIT.SDS.Promise(resolver);
         * }
         *
         * BIT.SDS.Promise.retry(trySomething, 5, 5000)
         *   .then(...)
         *   .catch(...);
         */
        retry: function(fn, tries, delay) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                var lastRejectReason;

                function retry() {
                    if (tries > 0) {
                        tries--;
                        fn()
                            .then(resolve)
                            .catch(function(reason) {
                                lastRejectReason = reason;
                                setTimeout(retry, delay);
                            });
                    } else {
                        reject(lastRejectReason);
                    }
                }

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
        this.state = BIT.SDS.Promise.STATE.PENDING;
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
        if (this.state !== BIT.SDS.Promise.STATE.PENDING) return;

        this.state = BIT.SDS.Promise.STATE.REJECTED;
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

        if (this.state !== BIT.SDS.Promise.STATE.PENDING) return;

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

        this.state = BIT.SDS.Promise.STATE.FULFILLED;
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
        case BIT.SDS.Promise.STATE.PENDING:
            this.clients.push(client);
            break;

        case BIT.SDS.Promise.STATE.FULFILLED:
            setTimeout(client.fulfillClient.createDelegate(client, [this.result]));
            break;

        case BIT.SDS.Promise.STATE.REJECTED:
            setTimeout(client.rejectClient.createDelegate(client, [this.result]));
            break;
        }

        return promise;
    }
});

Ext.namespace("BIT.SDS.WindowUtil");

/**
 * @class      BIT.SDS.WindowUtil
 *
 * @hideconstructor
 */
Ext.define("BIT.SDS.WindowUtil",
{
    /**
     * @lends      BIT.SDS.WindowUtil
     */
    statics: {
        APP_DATA_ARRAY: [
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
        ],

        appData: [],

        /**
         * Sets the restore XY position of all applications to cascaded, overlapping positions
         * within the specified bounds and resets the restore size so that the windows will have
         * their respective default sizes.
         *
         * The algorithm used ensures that each window has a position that depends entirely on the
         * specified bounds, regardless of which applications are installed or which DSM version is
         * used.
         *
         * The method call including the parameters used is logged in the console. Please note this
         * down for your later information.
         *
         * **Note 1**: Currently open application windows will not change their size and position.
         * You must close and reopen the windows to see the result. Do not move or resize the
         * application window beforehand, as this immediately sets the restore size and position to
         * the current window size and position.
         *
         * **Note 2**: The Synology CMS (Central Management System) application
         * (`SYNO.SDS.CMS.Application`) does not read the restore size and position due to a bug in
         * DSM. To ensure that this window has the correct size and position, each time this method
         * is called, the window will be opened and set to the correct size and position.
         *
         * @param      {BIT.SDS.WindowUtil~Bounds}  [bounds]  The bounds.
         *
         * @example
         * BIT.SDS.WindowUtil.cascadeOverlap();
         *
         * @example
         * BIT.SDS.WindowUtil.cascadeOverlap({x: 160, y: 139, width: 1640, height: 830});
         */
        cascadeOverlap: function(bounds) {
            var boundsAsLiteral;
            var boundsBottomRightCorner;
            var offsetX;
            var offsetY;

            var dsmVersion = BIT.SDS.WindowUtil.getDsmVersion();

            if (bounds === undefined) bounds = BIT.SDS.WindowUtil.suggestBounds();

            boundsAsLiteral = "{x: " + bounds.x + ", y: " + bounds.y + ", width: " + bounds.width + ", height: " + bounds.height + "}";

            console.log("Using: BIT.SDS.WindowUtil.cascadeOverlap(" + boundsAsLiteral + ");");

            offsetX = bounds.x;
            offsetY = bounds.y;

            boundsBottomRightCorner = {
                x: bounds.x + bounds.width,
                y: bounds.y + bounds.height
            };

            Ext.each(BIT.SDS.WindowUtil.getAppData(), function(appData) {
                var windowBottomRightCorner;
                var appInstances;

                windowBottomRightCorner = {
                    x: offsetX + appData.maxDefaultWidth,
                    y: offsetY + appData.maxDefaultHeight
                };

                if (windowBottomRightCorner.x > boundsBottomRightCorner.x && windowBottomRightCorner.y > boundsBottomRightCorner.y) {
                    offsetX = bounds.x;
                    offsetY = bounds.y;
                } else {
                    if (windowBottomRightCorner.x > boundsBottomRightCorner.x) {
                        if (offsetX === bounds.x) {
                            offsetY = bounds.y;
                        }
                        offsetX = bounds.x;
                    } else {
                        if (windowBottomRightCorner.y > boundsBottomRightCorner.y) {
                            // offsetX += 30;
                            offsetY = bounds.y;
                        }
                    }
                }

                if (windowBottomRightCorner.x > boundsBottomRightCorner.x && windowBottomRightCorner.y > boundsBottomRightCorner.y) {
                    offsetX = bounds.x;
                    offsetY = bounds.y;
                } else {
                    if (windowBottomRightCorner.x > boundsBottomRightCorner.x) {
                        if (offsetX === bounds.x) {
                            offsetY = bounds.y;
                        }
                        offsetX = bounds.x;
                    } else {
                        if (windowBottomRightCorner.y > boundsBottomRightCorner.y) {
                            // offsetX += 30;
                            offsetY = bounds.y;
                        }
                    }
                }

                if (appData.dsmVersions.indexOf(dsmVersion) !== -1) {
                    BIT.SDS.WindowUtil.resetRestoreSizeAndPosition(appData.appName);
                    BIT.SDS.WindowUtil.setRestorePagePosition(appData.appName, offsetX, offsetY);

                    if (appData.appName === "SYNO.SDS.CMS.Application") {
                        appInstances = SYNO.SDS.AppMgr.getByAppName(appData.appName);

                        if ((appInstances.length === 0) && BIT.SDS.WindowUtil.isInstalled(appData.appName)) {
                            SYNO.SDS.AppLaunch(appData.appName, {}, false, (function() {
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
         * Closes the provided or all application(s).
         *
         * If you call this method without providing `appNames`, all applications that can open a
         * window on the DSM desktop and are currently installed on the DiskStation will be closed.
         *
         * @param      {string[]|string}  [appNames]  The application name(s).
         */
        close: function(appNames) {
            if (appNames === undefined) appNames = BIT.SDS.WindowUtil.getAppNamesForDsmVersion();

            Ext.each(appNames, function(appName) {
                if ((BIT.SDS.WindowUtil.getAppNamesForDsmVersion().indexOf(appName) !== -1) && BIT.SDS.WindowUtil.isInstalled(appName)) {
                    Ext.each(SYNO.SDS.AppMgr.getByAppName(appName), function(appInstance) {
                        appInstance.window.close();
                    }, this);
                }
            }, this);
        },

        /**
         * An object containing data about an application.
         *
         * @typedef    {Object}    BIT.SDS.WindowUtil~AppData
         * @property   {string}    appName           The application name.
         * @property   {string[]}  dsmVersions       An array of DSM versions.
         * @property   {number}    maxDefaultWidth   The maximum default window width.
         * @property   {number}    maxDefaultHeight  The maximum default window height.
         */

        /**
         * Returns an array of {@link BIT.SDS.WindowUtil~AppData} for all supported applications.
         *
         * @return     {BIT.SDS.WindowUtil~AppData[]}  An array of `AppData` objects.
         */
        getAppData: function() {
            if (!Ext.isArray(BIT.SDS.WindowUtil.appData) || (BIT.SDS.WindowUtil.appData.length !== BIT.SDS.WindowUtil.APP_DATA_ARRAY.length)) {
                BIT.SDS.WindowUtil.appData = [];

                Ext.each(BIT.SDS.WindowUtil.APP_DATA_ARRAY, function(appData) {
                    var appData = {
                        appName:          appData[0],
                        dsmVersions:      appData[1],
                        maxDefaultWidth:  appData[2][0],
                        maxDefaultHeight: appData[2][1]
                    };

                    BIT.SDS.WindowUtil.appData.push(appData);
                }, this);
            }

            return BIT.SDS.WindowUtil.appData;
        },

        /**
         * Returns an array of all applications that can open a window on the DSM desktop.
         *
         * @return     {string[]}  An array of application names.
         *
         * @example
         * BIT.SDS.WindowUtil.getAppNames();
         * // => ["SYNO.SDS.AdminCenter.Application", ...]
         */
        getAppNames: function() {
            var appNames = [];

            Ext.each(BIT.SDS.WindowUtil.getAppData(), function(appData) {
                appNames.push(appData.appName);
            }, this);

            return appNames;
        },

        /**
         * Returns an array of all applications that can open a window on the DSM desktop and are
         * available for the DSM version currently installed on the DiskStation.
         *
         * @return     {string[]}  An array of application names.
         *
         * @example
         * BIT.SDS.WindowUtil.getAppNamesForDsmVersion();
         * // => ["SYNO.SDS.AdminCenter.Application", ...]
         */
        getAppNamesForDsmVersion: function() {
            var appNames = [];
            var dsmVersion = BIT.SDS.WindowUtil.getDsmVersion();

            Ext.each(BIT.SDS.WindowUtil.getAppData(), function(appData) {
                if (appData.dsmVersions.indexOf(dsmVersion) !== -1) appNames.push(appData.appName);
            }, this);

            return appNames;
        },

        /**
         * An object containing the size of an application window.
         *
         * @typedef    {Object}  BIT.SDS.WindowUtil~AppWinSize
         * @property   {string}  appName  The application name.
         * @property   {number}  width    The window width.
         * @property   {number}  height   The window height.
         */

        /**
         * Retrieves the respective default window size(s) of the provided or all application(s).
         *
         * To get the default window size, first the restore size and XY position are reset via
         * {@link BIT.SDS.WindowUtil.resetRestoreSizeAndPosition}, next the application is launched
         * and finally the size of the newly opened application window is retrieved.
         *
         * Therefore please note:
         *
         * - The default window size can only be retrieved for currently installed applications.
         * - The applications must not be running when calling this method.
         * - The current restore size and XY position will be reset for those applications.
         *
         * Launching the application(s) is an asychronous operation, therefore this method returns a
         * promise that is fulfilled with an array of {@link BIT.SDS.WindowUtil~AppWinSize} objects.
         *
         * If you call this method without providing `appNames`, the default window sizes of all
         * applications that can open a window on the DSM desktop and are currently installed on the
         * DiskStation will be retrieved.
         *
         * @param      {string[]|string}  [appNames]  The application name(s).
         * @return     {BIT.SDS.Promise}  A promise for an array of `AppWinSize` objects.
         */
        getDefaultSize: function(appNames) {
            var appNamesForLaunch = [];
            var promises = [];

            if (appNames === undefined) appNames = BIT.SDS.WindowUtil.getAppNamesForDsmVersion();

            Ext.each(appNames, function(appName) {
                if ((BIT.SDS.WindowUtil.getAppNamesForDsmVersion().indexOf(appName) !== -1) && BIT.SDS.WindowUtil.isInstalled(appName) && (SYNO.SDS.AppMgr.getByAppName(appName).length === 0)) {
                    appNamesForLaunch.push(appName);
                }
            }, this);

            function getAppWinSize(appInstance) {
                var appWindow = appInstance.window;
                var appWinSize = {
                    appName: appInstance.jsConfig.jsID,
                };

                if (appWindow.maximized || appWindow.hidden) {
                    if (appWindow.restoreSize) {
                        appWinSize.width  = appWindow.restoreSize.width;
                        appWinSize.height = appWindow.restoreSize.height;
                    } else {
                        appWinSize.width  = appWindow.width;
                        appWinSize.height = appWindow.height;
                    }
                } else {
                    appWinSize.width  = appWindow.getWidth();
                    appWinSize.height = appWindow.getHeight();
                }

                return appWinSize;
            }

            Ext.each(appNamesForLaunch, function(appName) {
                BIT.SDS.WindowUtil.resetRestoreSizeAndPosition(appName);
                promises.push(BIT.SDS.LaunchMgr.launch(appName));
            }, this);

            return BIT.SDS.Promise.all(promises)
                .then(function(appInstancesOrNulls) {
                    var appWinSizes = [];

                    Ext.each(appInstancesOrNulls, function (appInstance) {
                        if (appInstance) {
                            appWinSizes.push(getAppWinSize(appInstance));
                        }
                    }, this);

                    return appWinSizes;
                });
        },

        /**
         * Returns the DSM version currently installed on the DiskStation. The version has the
         * format: `<major version>.<minor version>`
         *
         * @return     {string}  The DSM version.
         *
         * @example
         * BIT.SDS.WindowUtil.getDsmVersion();
         * // => 6.2
         */
        getDsmVersion: function() {
            return _S("majorversion") + "." + _S("minorversion");
        },

        /**
         * Returns the name of the property that holds the restore size and position of the
         * application window.
         *
         * @param      {string}  appName  The application name.
         * @return     {string}  The property name.
         */
        getRestoreSizePosPropertyName: function(appName) {
            var restoreSizePosPropertyName = "restoreSizePos";
            var dsmVersion = BIT.SDS.WindowUtil.getDsmVersion();

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
         * Returns `true` if the provided application is currently installed on the DiskStation.
         *
         * @param      {string}   appName  The application name.
         * @return     {boolean}  `true` if installed, `false` otherwise.
         */
        isInstalled: function(appName) {
            return (SYNO.SDS.AppUtil.getApps().indexOf(appName) !== -1);
        },

        /**
         * Logs the respective default window size(s) of the provided or all application(s) to the
         * console in CSV format. The record format is: `<application name>,<width>,<height>`
         *
         * To get the default window size, the method {@link BIT.SDS.WindowUtil.getDefaultSize} is
         * called, therefore please note:
         *
         * - The default window size can only be retrieved for currently installed applications.
         * - The applications must not be running when calling this method.
         * - The current restore size and XY position will be reset for those applications.
         *
         * If you call this method without providing `appNames`, the default window sizes of all
         * applications that can open a window on the DSM desktop and are currently installed on the
         * DiskStation will be logged.
         *
         * @param      {string[]|string}  [appNames]  The application name(s).
         *
         * @example
         * BIT.SDS.WindowUtil.logDefaultSize();
         * // SYNO.SDS.AdminCenter.Application;994;570
         * // SYNO.SDS.App.FileStation3.Instance;920;560
         * // ...
         *
         * @example
         * BIT.SDS.WindowUtil.logDefaultSize("SYNO.SDS.App.FileStation3.Instance");
         * // SYNO.SDS.App.FileStation3.Instance;920;560
         */
        logDefaultSize: function(appNames) {
            BIT.SDS.WindowUtil.getDefaultSize(appNames)
                .then(function(appWinSizes) {
                    Ext.each(appWinSizes, function(appWinSize) {
                        console.log(appWinSize.appName + "," + appWinSize.width + "," + appWinSize.height);
                    }, this);
                })
                .catch(function(reason) {
                    console.log("Error retrieving window size: " + ((reason instanceof Error) ? reason.message : reason));
                });
        },

        /**
         * Opens the provided or all application(s).
         *
         * Please note that already running applications will not be opened by this method.
         *
         * Launching the application(s) is an asychronous operation, therefore this method returns a
         * promise that is fulfilled with an array of `SYNO.SDS.AppInstance` objects.
         *
         * If you call this method without providing `appNames`, all applications that can open a
         * window on the DSM desktop and are currently installed on the DiskStation will be opened.
         *
         * @param      {string[]|string}  [appNames]  The application name(s).
         * @return     {BIT.SDS.Promise}  A promise for an array of `SYNO.SDS.AppInstance` objects.
         */
        open: function(appNames) {
            var appNamesForLaunch = [];
            var promises = [];

            if (appNames === undefined) appNames = BIT.SDS.WindowUtil.getAppNamesForDsmVersion();

            Ext.each(appNames, function(appName) {
                if ((BIT.SDS.WindowUtil.getAppNamesForDsmVersion().indexOf(appName) !== -1) && BIT.SDS.WindowUtil.isInstalled(appName) && (SYNO.SDS.AppMgr.getByAppName(appName).length === 0)) {
                    appNamesForLaunch.push(appName);
                }
            }, this);

            Ext.each(appNamesForLaunch, function(appName) {
                promises.push(BIT.SDS.LaunchMgr.launch(appName));
            }, this);

            return BIT.SDS.Promise.all(promises)
                .then(function(appInstancesOrNulls) {
                    var appInstances = [];

                    Ext.each(appInstancesOrNulls, function (appInstance) {
                        if (appInstance) {
                            appInstances.push(appInstance);
                        }
                    }, this);

                    return appInstances;
                });
        },

        /**
         * Resets the restore size and XY position of the provided application(s).
         *
         * If you call this method without providing `appNames`, all applications that can open a
         * window on the DSM desktop and are available for the DSM version currently installed on
         * the DiskStation will be reset.
         *
         * **Note**: Currently open application windows will not change their size and position. You
         * must close and reopen the windows to see the result. Do not move or resize the
         * application window beforehand, as this immediately sets the restore size and position to
         * the current window size and position.
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
            if (appNames === undefined) appNames = BIT.SDS.WindowUtil.getAppNamesForDsmVersion();

            Ext.each(appNames, function(appName) {
                var restoreSizePosPropertyName;

                if (BIT.SDS.WindowUtil.getAppNamesForDsmVersion().indexOf(appName) !== -1) {
                    restoreSizePosPropertyName = BIT.SDS.WindowUtil.getRestoreSizePosPropertyName(appName);
                    SYNO.SDS.UserSettings.removeProperty(appName, restoreSizePosPropertyName);
                }
            }, this);
        },

        /**
         * Sets the restore page XY position of the provided application.
         *
         * **Note**: Currently open application windows will not change their position. You must
         * close and reopen the windows to see the result. Do not move or resize the application
         * window beforehand, as this immediately sets the restore position to the current window
         * position.
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
            var restoreSizePosPropertyName;
            var restoreSizePos;

            if (BIT.SDS.WindowUtil.getAppNamesForDsmVersion().indexOf(appName) !== -1) {
                restoreSizePosPropertyName = BIT.SDS.WindowUtil.getRestoreSizePosPropertyName(appName);
                restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName) || {};

                delete restoreSizePos.x;
                delete restoreSizePos.y;

                Ext.apply(restoreSizePos, {
                    pageX:       x,
                    pageY:       y,
                    fromRestore: true
                });

                SYNO.SDS.UserSettings.setProperty(appName, restoreSizePosPropertyName, restoreSizePos);
            }
        },

        /**
         * A rectangle defining the bounds for the position of the application windows.
         *
         * @typedef    {Object}  BIT.SDS.WindowUtil~Bounds
         * @property   {number}  x       The bounds page x position.
         * @property   {number}  y       The bounds page y position.
         * @property   {number}  width   The bounds width.
         * @property   {number}  height  The bounds height.
         */

        /**
         * Calculates a suggestion for the bounds which can be used as input for
         * {@link BIT.SDS.WindowUtil.cascadeOverlap}.
         *
         * The suggestion is based on the current size of the browser window, therefore you should
         * adjust the browser window to your needs before calling this method.
         *
         * @return     {BIT.SDS.WindowUtil~Bounds}  The suggested bounds.
         *
         * @example
         * BIT.SDS.WindowUtil.suggestBounds();
         * // => {x: 160, y: 139, width: 1640, height: 830}
         */
        suggestBounds: function() {
            var bounds = {};

            var TASKBAR_HEIGHT = Ext.get("sds-taskbar").getHeight();
            var DESKTOP_SHORTCUTS_WIDTH = Ext.select("li.launch-icon").first().getWidth() + (2 * Ext.select("ul.sds-desktop-shortcut").first().getMargins("l"));

            var MARGIN_TOP_SMALL    = 10;
            var MARGIN_RIGHT_SMALL  = 10;
            var MARGIN_BOTTOM_SMALL = 10;
            var MARGIN_LEFT_SMALL   = 10;

            var MARGIN_TOP_LARGE    = 100;
            var MARGIN_RIGHT_LARGE  = 100;
            var MARGIN_BOTTOM_LARGE = 100;
            var MARGIN_LEFT_LARGE   = DESKTOP_SHORTCUTS_WIDTH - ((DESKTOP_SHORTCUTS_WIDTH - 11) % 30) + 29;

            var innerWidth  = window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth;
            var innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            innerWidth  -= 16;
            innerHeight -= 18;

            if ((innerWidth - MARGIN_LEFT_LARGE - MARGIN_RIGHT_LARGE > 1200) && (innerHeight - MARGIN_TOP_LARGE - MARGIN_BOTTOM_LARGE - TASKBAR_HEIGHT > 700)) {
                bounds.x      = MARGIN_LEFT_LARGE;
                bounds.y      = MARGIN_TOP_LARGE + TASKBAR_HEIGHT;
                bounds.width  = innerWidth  - MARGIN_LEFT_LARGE - MARGIN_RIGHT_LARGE;
                bounds.height = innerHeight - MARGIN_TOP_LARGE  - MARGIN_BOTTOM_LARGE - TASKBAR_HEIGHT;
            } else {
                bounds.x      = MARGIN_LEFT_SMALL;
                bounds.y      = MARGIN_TOP_SMALL + TASKBAR_HEIGHT;
                bounds.width  = innerWidth  - MARGIN_LEFT_SMALL - MARGIN_RIGHT_SMALL;
                bounds.height = innerHeight - MARGIN_TOP_SMALL  - MARGIN_BOTTOM_SMALL - TASKBAR_HEIGHT;
            }

            bounds.width  -= bounds.width  % 5;
            bounds.height -= bounds.height % 5;

            return bounds;
        }
    }
});
