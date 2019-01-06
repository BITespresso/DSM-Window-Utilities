Ext.namespace("BIT.SDS");

BIT.SDS.init = function() {
    BIT.SDS.WindowUtil = new BIT.SDS._WindowUtil();
};

Ext.namespace("BIT.SDS.AppWindowSize");

Ext.define("BIT.SDS.AppWindowSize", {
    appName: undefined,
    width: undefined,
    height: undefined,

    constructor: function(appName, width, height) {
        this.appName = appName;
        this.width   = width;
        this.height  = height;
    }
});

Ext.namespace("BIT.SDS._WindowUtil");

Ext.define("BIT.SDS._WindowUtil", {
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

    getDsmVersion: function() {
        return _S("majorversion") + "." + _S("minorversion");
    },

    getAllAppNames: function() {
        var appNames = [];
        var dsmVersion = this.getDsmVersion();

        Ext.each(this.appWindowDataList, function() {
            if (this.dsmVersions.indexOf(dsmVersion) !== -1) appNames.push(this.appName);
        });

        return appNames;
    },

    getRestoreSizePosPropertyName: function(appName) {
        var restoreSizePosPropertyName = "restoreSizePos";
        var dsmVersion = this.getDsmVersion();

        if (appName === "SYNO.SDS.HA.Instance") {
            if (["5.2", "6.0", "6.1"].indexOf(dsmVersion) !== -1) {
                restoreSizePosPropertyName = "restoreSizePos";
            } else {
                restoreSizePosPropertyName = "bindHAWizardWindowRestoreSizePos";
            }
        }

        return restoreSizePosPropertyName;
    },

    removeRestoreSizesAndPositions: function(appNames) {
        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);

            if (restoreSizePos) {
                SYNO.SDS.UserSettings.removeProperty(appName, restoreSizePosPropertyName);
            }
        }, this);
    },

    removeAllRestoreSizesAndPositions: function() {
        this.removeRestoreSizesAndPositions(this.getAllAppNames());
    },

    removeRestoreSizes: function(appNames) {
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

    removeAllRestoreSizes: function() {
        this.removeRestoreSizes(this.getAllAppNames());
    },

    removeRestorePositions: function(appNames) {
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

    removeAllRestorePositions: function() {
        this.removeRestorePositions(this.getAllAppNames());
    },

    getWindowSizeByLaunchingAppPromise: function(appName, launchDelay) {
        return new BIT.SDS.Promise(function(resolve, reject) {
            SYNO.SDS.AppLaunch.defer(launchDelay, this, [appName, {}, false, function(appInstance) {
                var windowSize;

                if (Ext.isObject(appInstance)) {
                    windowSize = new BIT.SDS.AppWindowSize(appName, appInstance.window.getWidth(), appInstance.window.getHeight());
                    resolve(windowSize);
                } else {
                    appInstances = SYNO.SDS.AppMgr.getByAppName(appName);

                    if (appInstances.length > 0) {
                        windowSize = new BIT.SDS.AppWindowSize(appName, appInstances[0].window.getWidth(), appInstances[0].window.getHeight());
                        resolve(windowSize);
                    } else {
                        reject(Error("Failed to launch " + appName));
                    }
                }
            }, this]);
        });
    },

    getWindowSizesPromise: function(appNames) {
        var rejectAfterTimeoutPromise;
        var promises = [];
        var launchDelay = 0;
        var launchDelayIncrement = 0;

        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);
            var appInstances;
            var installedAppNames;
            var windowSize;

            if (restoreSizePos) {
                if (Ext.isDefined(restoreSizePos.width) && Ext.isDefined(restoreSizePos.height)) {
                    windowSize = new BIT.SDS.AppWindowSize(appName, restoreSizePos.width, restoreSizePos.height);
                    promises.push(BIT.SDS.Promise.resolve(windowSize));
                    return;
                }
            }

            appInstances = SYNO.SDS.AppMgr.getByAppName(appName);

            if (appInstances.length > 0) {
                windowSize = new BIT.SDS.AppWindowSize(appName, appInstances[0].window.getWidth(), appInstances[0].window.getHeight());
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

    getAllWindowSizesPromise: function() {
        return this.getWindowSizesPromise(this.getAllAppNames());
    },

    printAllWindowSizes: function() {
        BIT.SDS.Promise.retry(BIT.SDS.WindowUtil.getAllWindowSizesPromise.createDelegate(this), 5, 5000)
            .then(function(results) {
                Ext.each(results, function(result) {
                    console.log(this.appName + "," + this.width + "," + this.height);
                });
            })
            .catch(function(reason) {
                console.log("Error retrieving window sizes: " + ((reason instanceof Error) ? reason.message : reason));
            });
    },

    suggestWindowRegion: function() {
        var x;
        var y;
        var width;
        var height;
        var windowRegion;
        var windowRegionLiteral;

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

        windowRegion = {
            x:      x,
            y:      y,
            width:  width,
            height: height
        };

        windowRegionLiteral = "{";
        for (var property in windowRegion) {
            if (windowRegion.hasOwnProperty(property)) {
                windowRegionLiteral += property + ": " + windowRegion[property] + ", ";
            }
        }
        windowRegionLiteral = windowRegionLiteral.slice(0, -2) + "}";

        console.log("Using suggested window region: windowRegion = " + windowRegionLiteral);

        return windowRegion;
    },

    cascadeOverlapAllWindows: function(windowRegion) {
        var windowRegionBottomRightCorner;
        var offsetX;
        var offsetY;

        var dsmVersion = this.getDsmVersion();

        if (!Ext.isObject(windowRegion)) {
            windowRegion = this.suggestWindowRegion();
        }

        offsetX = windowRegion.x;
        offsetY = windowRegion.y;

        windowRegionBottomRightCorner = {
            x: windowRegion.x + windowRegion.width,
            y: windowRegion.y + windowRegion.height
        };

        Ext.each(this.appWindowDataList, function(appWindowData) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appWindowData.appName);
            var restoreSizePos;
            var windowBottomRightCorner;

            windowBottomRightCorner = {
                x: offsetX + appWindowData.maxInitialWindowWidth,
                y: offsetY + appWindowData.maxInitialWindowHeight
            };

            if (windowBottomRightCorner.x > windowRegionBottomRightCorner.x && windowBottomRightCorner.y > windowRegionBottomRightCorner.y) {
                offsetX = windowRegion.x;
                offsetY = windowRegion.y;
            } else {
                if (windowBottomRightCorner.x > windowRegionBottomRightCorner.x) {
                    if (offsetX === windowRegion.x) {
                        offsetY = windowRegion.y;
                    }
                    offsetX = windowRegion.x;
                } else {
                    if (windowBottomRightCorner.y > windowRegionBottomRightCorner.y) {
                        // offsetX += 30;
                        offsetY = windowRegion.y;
                    }
                }
            }

            if (appWindowData.dsmVersions.indexOf(dsmVersion) !== -1) {
                restoreSizePos = {
                    fromRestore: true,
                    pageX: offsetX,
                    pageY: offsetY
                };

                SYNO.SDS.UserSettings.setProperty(appWindowData.appName, restoreSizePosPropertyName, restoreSizePos);

                if (appWindowData.appName === "SYNO.SDS.CMS.Application") {
                    SYNO.SDS.AppLaunch(appWindowData.appName, {}, false, function(appInstance) {
                        if (Ext.isObject(appInstance)) {
                            appInstance.window.setPagePosition(restoreSizePos.pageX, restoreSizePos.pageY);
                        }
                    }, this);
                }
            }

            offsetX += 30;
            offsetY += 30;
        }, this);
    }
});

Ext.namespace("BIT.SDS.Promise");

Ext.define("BIT.SDS.Promise", {
    statics: {
        state: {
            pending:   "pending",
            fulfilled: "fulfilled",
            rejected:  "rejected"
        },

        resolve: function(value) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                resolve(value);
            });
        },

        reject: function(reason) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                reject(reason);
            });
        },

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

        race: function(promises) {
            return new BIT.SDS.Promise(function(resolve, reject) {
                Ext.each(promises, function(promise) {
                    promise.then(resolve, reject);
                }, this);
            });
        },

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

    state: undefined,
    clients: undefined,
    result: undefined,

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
    },

    catch: function(onRejected) {
        return this.then(null, onRejected);
    },

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
    }
});

BIT.SDS.init();
