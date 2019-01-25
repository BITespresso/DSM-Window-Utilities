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

Ext.namespace("BIT.SDS.Region");

Ext.define("BIT.SDS.Region",
/**
 * @lends      BIT.SDS.Region.prototype
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
     * The width of the region.
     * @type       {number}
     */
    width: undefined,

    /**
     * The height of the region.
     * @type       {number}
     */
    height: undefined,

    /**
     * Creates a new {@link BIT.SDS.Region} instance.
     *
     * @method     BIT.SDS.Region
     * @constructs
     *
     * @param      {number}  x       X-coordinate of the upper left egde.
     * @param      {number}  y       Y-coordinate of the upper left egde.
     * @param      {number}  width   The region width.
     * @param      {number}  height  The region height.
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
     * BIT.SDS.WindowUtil.getAllAppNames();
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
     * Returns a list of all applications available for the DSM version installed on the
     * DiskStation, which open a window on the DSM desktop.
     *
     * @return     {string[]}  The list of application names.
     *
     * @example
     * BIT.SDS.WindowUtil.getAllAppNames();
     * // => ["SYNO.SDS.AdminCenter.Application", ...]
     */
    getAllAppNames: function() {
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
     * Removes the window restore sizes and positions of the passed application(s). This will reset
     * the size and position of the application windows to the values and behavior after the initial
     * DSM installation.
     *
     * The window sizes will therefore be the default sizes of the individual application windows
     * defined internally by the application.
     *
     * The window positions will not be fixed, but determined by an algorithm that offsets the upper
     * left corner of each newly opened window.
     *
     * Note: Open application windows will not change their size and position. You must manually
     * close and reopen the windows to see the effects of the reset. Do not move or resize an
     * already open application window, as this immediately sets the restore size and position again
     * to the current window size and position.
     *
     * @param      {string[]|string}  appNames  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.removeRestoreSizesAndPositions("SYNO.SDS.PkgManApp.Instance");
     *
     * @example
     * BIT.SDS.WindowUtil.removeRestoreSizesAndPositions(["SYNO.SDS.HA.Instance", ...]);
     */
    removeRestoreSizesAndPositions: function(appNames) {
        Ext.each(appNames, function(appName) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appName);
            var restoreSizePos = SYNO.SDS.UserSettings.getProperty(appName, restoreSizePosPropertyName);

            if (restoreSizePos) {
                SYNO.SDS.UserSettings.removeProperty(appName, restoreSizePosPropertyName);
            }
        }, this);
    },

    /**
     * Removes the window restore sizes and positions of all applications. This will reset the size
     * and position of the application windows to the values and behavior after the initial DSM
     * installation.
     *
     * The window sizes will therefore be the default sizes of the individual application windows
     * defined internally by the application.
     *
     * The window positions will not be fixed, but determined by an algorithm that offsets the upper
     * left corner of each newly opened window.
     *
     * Note: Open application windows will not change their size and position. You must manually
     * close and reopen the windows to see the effects of the reset. Do not move or resize an
     * already open application window, as this immediately sets the restore size and position again
     * to the current window size and position.
     */
    removeAllRestoreSizesAndPositions: function() {
        this.removeRestoreSizesAndPositions(this.getAllAppNames());
    },

    /**
     * Removes the window restore sizes of the passed application(s). This will reset the size of
     * the application windows to the values after the initial DSM installation.
     *
     * The window sizes will therefore be the default sizes of the individual application windows
     * defined internally by the application.
     *
     * Note: Open application windows will not change their size. You must manually close and reopen
     * the windows to see the effects of the reset. Do not move or resize an already open
     * application window, as this immediately sets the restore size and position again to the
     * current window size and position.
     *
     * @param      {string[]|string}  appNames  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.removeRestoreSizes("SYNO.SDS.PkgManApp.Instance");
     *
     * @example
     * BIT.SDS.WindowUtil.removeRestoreSizes(["SYNO.SDS.HA.Instance", ...]);
     */
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

    /**
     * Removes the window restore sizes of all applications. This will reset the size of the
     * application windows to the values after the initial DSM installation.
     *
     * The window sizes will therefore be the default sizes of the individual application windows
     * defined internally by the application.
     *
     * Note: Open application windows will not change their size. You must manually close and reopen
     * the windows to see the effects of the reset. Do not move or resize an already open
     * application window, as this immediately sets the restore size and position again to the
     * current window size and position.
     */
    removeAllRestoreSizes: function() {
        this.removeRestoreSizes(this.getAllAppNames());
    },

    /**
     * Removes the window restore positions of the passed application(s). This will reset the
     * position of the application windows to the values and behavior after the initial DSM
     * installation.
     *
     * The window positions will not be fixed, but determined by an algorithm that offsets the upper
     * left corner of each newly opened window.
     *
     * Note: Open application windows will not change their position. You must manually close and
     * reopen the windows to see the effects of the reset. Do not move or resize an already open
     * application window, as this immediately sets the restore size and position again to the
     * current window size and position.
     *
     * @param      {string[]|string}  appNames  The application name(s).
     *
     * @example
     * BIT.SDS.WindowUtil.removeRestorePositions("SYNO.SDS.PkgManApp.Instance");
     *
     * @example
     * BIT.SDS.WindowUtil.removeRestorePositions(["SYNO.SDS.HA.Instance", ...]);
     */
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

    /**
     * Removes the window restore positions of all applications. This will reset the position of the
     * application windows to the values and behavior after the initial DSM installation.
     *
     * The window positions will not be fixed, but determined by an algorithm that offsets the upper
     * left corner of each newly opened window.
     *
     * Note: Open application windows will not change their position. You must manually close and
     * reopen the windows to see the effects of the reset. Do not move or resize an already open
     * application window, as this immediately sets the restore size and position again to the
     * current window size and position.
     */
    removeAllRestorePositions: function() {
        this.removeRestorePositions(this.getAllAppNames());
    },

    /**
     * Retrieves the window size of the passed application by launching the application. If the
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
     * Retrieves the window size(s) of the passed application(s). To retrieve the window sizes,
     * different methods will be applied until the first succeeds:
     *
     * * Get the window size from the restore size property
     * * Get the size from an open window of the respective application
     * * Launch the application and get the size of the opened window
     *
     * Launching the application(s) is an asychronous operation, therefore this method returns a
     * promise that is fulfilled with an array of the window sizes.
     *
     * @param      {string[]|string}  appNames  The application name(s).
     * @return     {BIT.SDS.Promise}  A new promise.
     */
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
     * Retrieves the windows sizes of all applications. To retrieve the window sizes, different
     * methods will be applied until the first succeeds:
     *
     * * Get the window size from the restore size property
     * * Get the size from an open window of the respective application
     * * Launch the application and get the size of the opened window
     *
     * Launching the applications is an asychronous operation, therefore this method returns a
     * promise that is fulfilled with an array of the window sizes.
     *
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    getAllWindowSizesPromise: function() {
        return this.getWindowSizesPromise(this.getAllAppNames());
    },

    /**
     * Retrieves the windows sizes of all applications. To retrieve the window sizes, different
     * methods will be applied until the first succeeds:
     *
     * * Get the window size from the restore size property
     * * Get the size from an open window of the respective application
     * * Launch the application and get the size of the opened window
     *
     * Launching the applications is an asychronous operation, therefore this method returns a
     * promise that is fulfilled with an array of the window sizes.
     *
     * In addition to {@link getAllWindowSizesPromise}, this method will make several attempts to
     * determine window sizes and is therefore more robust.
     *
     * @return     {BIT.SDS.Promise}  A new promise.
     */
    getAllWindowSizesPromiseWithRetry: function() {
        return BIT.SDS.Promise.retry(BIT.SDS.WindowUtil.getAllWindowSizesPromise.createDelegate(this), 5, 5000);
    },

    /**
     * Prints the windows sizes of all applications to the console in CSV format. The record format
     * is: `<application name>,<width>,<height>`
     *
     * @example
     * BIT.SDS.WindowUtil.printAllWindowSizes();
     * // SYNO.SDS.AdminCenter.Application;994;570
     * // SYNO.SDS.App.FileStation3.Instance;920;560
     * // ...
     */
    printAllWindowSizes: function() {
        BIT.SDS.WindowUtil.getAllWindowSizesPromiseWithRetry()
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
     * Calculates a suggestion for the region which can be used as input for
     * {@link cascadeOverlapAllWindows}. The suggested region is printed to the console and returned
     * by this method.
     *
     * The suggestion is based on the current size of the browser window, therefore you should
     * adjust the browser window to your needs before calling this method.
     *
     * @return     {BIT.SDS.Region}  The suggested region.
     *
     * @example
     * BIT.SDS.WindowUtil.suggestRegion();
     * // => {x: 160, y: 139, width: 1640, height: 830}
     */
    suggestRegion: function() {
        var x;
        var y;
        var width;
        var height;
        var region;
        var regionLiteral;

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

        region = new BIT.SDS.Region(x, y, width, height);

        regionLiteral = "{";
        for (var property in region) {
            if (region.hasOwnProperty(property)) {
                regionLiteral += property + ": " + region[property] + ", ";
            }
        }
        regionLiteral = regionLiteral.slice(0, -2) + "}";

        console.log("Using suggested region: region = " + regionLiteral);

        return region;
    },

    /**
     * Resets all application windows to their default sizes and to positions determined by the
     * specified region. The algorithm used ensures that each window has a position that depends
     * entirely on the specified region, regardless of which applications are installed or which DSM
     * version is used.
     *
     * Note 1: Open application windows will not change their size and position. You must manually
     * close and reopen the windows to see the effects of the reset. Do not move or resize an
     * already open application window, as this immediately sets the restore size and position again
     * to the current window size and position.
     *
     * Note 2: The Synology CMS (Central Management System) application (`SYNO.SDS.CMS.Application`)
     * does not read the stored window size and position due to a bug in DSM. To ensure that this
     * window has its designated position, the window will be opened each time this method is called
     * and set to the designated position.
     *
     * @param      {BIT.SDS.Region=}  region  The region.
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlapAllWindows({x: 160, y: 139, width: 1640, height: 830});
     *
     * @example
     * BIT.SDS.WindowUtil.cascadeOverlapAllWindows();
     */
    cascadeOverlapAllWindows: function(region) {
        var regionBottomRightCorner;
        var offsetX;
        var offsetY;

        var dsmVersion = BIT.SDS.Util.getDsmVersion();

        if (!Ext.isObject(region)) {
            region = this.suggestRegion();
        }

        offsetX = region.x;
        offsetY = region.y;

        regionBottomRightCorner = {
            x: region.x + region.width,
            y: region.y + region.height
        };

        Ext.each(this.appWindowDataList, function(appWindowData) {
            var restoreSizePosPropertyName = this.getRestoreSizePosPropertyName(appWindowData.appName);
            var restoreSizePos;
            var windowBottomRightCorner;

            windowBottomRightCorner = {
                x: offsetX + appWindowData.maxInitialWindowWidth,
                y: offsetY + appWindowData.maxInitialWindowHeight
            };

            if (windowBottomRightCorner.x > regionBottomRightCorner.x && windowBottomRightCorner.y > regionBottomRightCorner.y) {
                offsetX = region.x;
                offsetY = region.y;
            } else {
                if (windowBottomRightCorner.x > regionBottomRightCorner.x) {
                    if (offsetX === region.x) {
                        offsetY = region.y;
                    }
                    offsetX = region.x;
                } else {
                    if (windowBottomRightCorner.y > regionBottomRightCorner.y) {
                        // offsetX += 30;
                        offsetY = region.y;
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

    state: undefined,

    clients: undefined,

    result: undefined,

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
    }
});

BIT.SDS.init();
