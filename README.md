# DSM-Window-Utilities

Allows you to adjust or reset the size and position of windows on the DSM desktop for [Synology](https://www.synology.com) DiskStations.

## Table of Contents

1. [Introduction](#user-content-introduction)
2. [Usage](#user-content-usage)
    1. [General](#user-content-general)
    2. [Using `cascadeOverlap([bounds])`](#user-content-using-cascadeoverlapbounds)
    3. [Using `resetRestoreSizeAndPosition([appNames])`](#user-content-using-resetrestoresizeandpositionappnames)
    4. [Using `launch([appNames])`](#user-content-using-launchappnames)
    5. [Using `setRestorePagePosition(appName, x, y)`](#user-content-using-setrestorepagepositionappname-x-y)
3. [Compatibility](#user-content-compatibility)
4. [References](#user-content-references)
    1. [Opening the Browser Console](#user-content-opening-the-browser-console)
    2. [List of supported Applications](#user-content-list-of-supported-applications)
5. [API Reference](#user-content-api-reference)
6. [License](#user-content-license)

## Introduction

By default, each new application window opened on the DSM desktop is offset horizontally and vertically 30px from the last window opened. This continues until part of the window would be outside the desktop area. In this case, the window is moved to the left and/or top of the desktop. Internally in the DSM, this algorithm is named **cascadeOverlap**.

Whenever you move or resize an application window, a `restoreSizePos` entry is created in the current user profile that saves the current window size and location for that application. Newly opened windows then always get this size and position and no longer get their position through the **cascadeOverlap** algorithm.

This default behavior has some drawbacks that are addressed by the DSM-Window-Utilities:

* It is almost impossible to achieve a consistent window arrangement across different DiskStations by manually moving the windows.
* If you frequently take screenshots of the DSM desktop and create a mask in Photoshop to crop individual windows, it's an extra effort to adjust the window position to the mask position each time.
* In some cases, an application window may accidentally receive a `restoreSizePos` located outside the visible area of the desktop. This can only be fixed by manipulating the HTML of the page and changing the position of the element.

DSM-Window-Utilities therefore provides a JavaScript API to adjust or reset the size and position of the application windows according to your requirements.

## Usage

### General

1. Sign in to DSM with the user for whom you want to change the application windows.
2. [Open](#user-content-opening-the-browser-console) the Browser's Developer Console.
3. Copy the **contents** of the `bit-sds-windowutil.js` file, paste it into the console and press Enter. This creates the static class `BIT.SDS.WindowUtil` and allows you to call the provided [methods](#user-content-bit.sds.windowutil).
4. Now you can simply call a method by entering e.g. `BIT.SDS.WindowUtil.launch();`. This example launches all installed [applications](#user-content-list-of-supported-applications) that display a window on the DSM desktop.

### Using `cascadeOverlap([bounds])`

Probably the most useful method is `cascadeOverlap()`. This method arranges all application windows with the same algorithm as the internal **cascadeOverlap**, but assigns a fixed position to the windows by setting the `restoreSizePos`. The position of the individual application windows is determined only by the limits specified by the optional `bounds` argument. As long as you call this method with the same `bounds`, each window has the same individual position, regardless of which applications you have installed, which DSM version you are using, or how large your browser window is.

Unless you want to customize the `bounds`, you don't need to specify the bounds values. You can simply rely on the [suggestion](#user-content-bit.sds.windowutil.suggestbounds) made when calling `cascadeOverlap()` without argument.

Make sure that you first undock the console window from the browser window and set the browser window to the desired size. Then type into the console:

```js
BIT.SDS.WindowUtil.cascadeOverlap();
```

You will notice that `cascadeOverlap()` logs the bounds it uses in the console. For example:

```
Using: BIT.SDS.WindowUtil.cascadeOverlap({x: 160, y: 139, width: 1640, height: 830});
```

To see the effect of the new window arrangement, you can use the following command, which first closes all windows and then opens them again:

```js
BIT.SDS.WindowUtil.close()
    .then(BIT.SDS.WindowUtil.launch());
```

If you want to customize the bounds, start changing the values of `x`, `y`, `width` or `height` to your liking and call `cascadeOverlap()` again. For example:

```js
BIT.SDS.WindowUtil.cascadeOverlap({x: 0, y: 39, width: 1920, height: 1161});
```

**Note:** Once you have found **your** `bounds`, note them down so that you can reproduce the call at any time.

### Using `resetRestoreSizeAndPosition([appNames])`

If you like the default behavior of DSM, which moves each newly opened window, but you have already moved or resized some windows, you can simply restore the default with the following command, which removes the `restoreSizePos` from each application window, so that you get a fresh start:

```js
BIT.SDS.WindowUtil.resetRestoreSizeAndPosition();
```

For a more specific reset, you can also specify a single `appName` or an array of `appName`s as in these examples:

```js
BIT.SDS.WindowUtil.resetRestoreSizeAndPosition("SYNO.SDS.App.FileStation3.Instance");
```

```js
BIT.SDS.WindowUtil.resetRestoreSizeAndPosition(["SYNO.SDS.App.FileStation3.Instance", "SYNO.SDS.PkgManApp.Instance"]);
```

See [here](#user-content-list-of-supported-applications) for a list of supported applications and their respective `appName`.

### Using `launch([appNames])`

The `launch()` method can be used to launch applications that are not running and open the application window. This allows you to easily get an overview of how your application windows are currently arranged:

```js
BIT.SDS.WindowUtil.launch();
```

The `launch()` method returns a promise that is fulfilled with an array of all launched application instances. This allows you to call methods of the application instance class (`SYNO.SDS.AppInstance`). A simple example is setting the position of the application instance window:

```js
BIT.SDS.WindowUtil.launch("SYNO.SDS.App.FileStation3.Instance")
    .then(function(results) {
        results[0].window.setPagePosition(0, 39);
    });
```

Internally, the promise returned by `launch()` is used by the `getDefaultSize()` method, which retrieves the window size from the application instance window.

**Note:** You do not have to start an application just to get your application instance. If the application is already running, you can use the method `SYNO.SDS.AppMgr.getByAppName(appName)` to get an array of all instances of a particular application.

### Using `setRestorePagePosition(appName, x, y)`

If you want to permanently set the position of an application window, you can use `setRestorePagePosition()` which writes the provided x,y page position to the `restoreSizePos`. In this example, the position of the File Station application is set to the top left corner of the DSM desktop:

```js
BIT.SDS.WindowUtil.setRestorePagePosition("SYNO.SDS.App.FileStation3.Instance", 0, 39);
```

## Compatibility

DSM-Window-Utilities has been tested on the following DSM versions:

* **DSM 5.2**
* **DSM 6.0.x**
* **DSM 6.1.x**
* **DSM 6.2.x**

## References

### Opening the Browser Console

| Browser           | Mac                                                                                                                                                                | Windows / Linux                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Chrome            | <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>J</kbd>                                                                                                                      | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd> |
| Firefox           | <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>K</kbd>                                                                                                                      | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> |
| Safari            | <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>C</kbd><br><sub>**Note**: You need to enable<br>*Show Developer menu in menu bar*<br>in *Preferences/Advanced* before.</sub> | N/A                                           |
| Opera             | <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>J</kbd>                                                                                                                      | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd> |
| Edge              | N/A                                                                                                                                                                | <kbd>F12</kbd> and click on *Console* tab     |
| Internet Explorer | N/A                                                                                                                                                                | <kbd>F12</kbd> and click on *Console* tab     |

### List of supported Applications

| Application                                    | appName                                   |
| ---------------------------------------------- | ----------------------------------------- |
| Control Panel                                  | `SYNO.SDS.AdminCenter.Application`        |
| File Station                                   | `SYNO.SDS.App.FileStation3.Instance`      |
| EZ-Internet                                    | `SYNO.SDS.EzInternet.Instance`            |
| DSM Help                                       | `SYNO.SDS.HelpBrowser.Application`        |
| Package Center                                 | `SYNO.SDS.PkgManApp.Instance`             |
| Resource Monitor                               | `SYNO.SDS.ResourceMonitor.Instance`       |
| Storage Manager                                | `SYNO.SDS.StorageManager.Instance`        |
| High Availability Manager                      | `SYNO.SDS.HA.Instance`                    |
| Log Center                                     | `SYNO.SDS.LogCenter.Instance`             |
| Security Advisor                               | `SYNO.SDS.SecurityScan.Instance`          |
| Support Center                                 | `SYNO.SDS.SupportForm.Application`        |
| Options / Personal                             | `SYNO.SDS.App.PersonalSettings.Instance`  |
| Backup & Replication                           | `SYNO.SDS.Backup.Application`             |
| Text Editor                                    | `SYNO.SDS.ACEEditor.Application`          |
| Synology Account                               | `SYNO.SDS.MyDSCenter.Application`         |
| Storage Analyzer                               | `SYNO.SDS.StorageReport.Application`      |
| Antivirus Essential & Antivirus by McAfee      | `SYNO.SDS.AV.Instance`                    |
| Audio Station                                  | `SYNO.SDS.AudioStation.Application`       |
| CardDAV Server                                 | `SYNO.SDS.CardDAVServer.Instance`         |
| Cloud Station / Cloud Station Server           | `SYNO.SDS.CSTN.Instance`                  |
| Cloud Station Client / Cloud Station ShareSync | `SYNO.SDS.CloudStationClient.Instance`    |
| Cloud Sync                                     | `SYNO.SDS.DSCloudSync.Instance`           |
| CMS                                            | `SYNO.SDS.CMS.Application`                |
| Directory Server                               | `SYNO.SDS.LDAP.AppInstance`               |
| DNS Server                                     | `SYNO.SDS.DNS.Instance`                   |
| Docker                                         | `SYNO.SDS.Docker.Application`             |
| Download Station                               | `SYNO.SDS.DownloadStation.Application`    |
| Git Server                                     | `SYNO.SDS.GIT.Instance`                   |
| Glacier Backup                                 | `SYNO.SDS.Glacier.Instance`               |
| HiDrive Backup                                 | `SYNO.SDS.HiDrive.Instance`               |
| iTunes Server                                  | `SYNO.SDS.iTunes.Application`             |
| Java Manager                                   | `SYNO.SDS.JAVAMANAGER.Instance`           |
| Mail Server                                    | `SYNO.SDS.MailServer.Instance`            |
| MariaDB / MariaDB 5                            | `SYNO.SDS.MARIADB.Instance`               |
| Media Server                                   | `SYNO.SDS.MediaServer.AppInstance`        |
| Note Station                                   | `SYNO.SDS.NoteStation.Application`        |
| Proxy Server                                   | `SYNO.SDS.ProxyServer.Instance`           |
| RADIUS Server                                  | `SYNO.SDS.RAD.Instance`                   |
| SSO Server                                     | `SYNO.SDS.SSOServer.Instance`             |
| SVN                                            | `SYNO.SDS.SVN.Instance`                   |
| Video Station                                  | `SYNO.SDS.VideoStation.AppInstance`       |
| VPN Server                                     | `SYNO.SDS.VPN.Instance`                   |
| Active Backup for Server                       | `SYNO.SDS.ActiveBackup.Instance`          |
| Hyper Backup                                   | `SYNO.SDS.Backup.Application`             |
| Hyper Backup Vault                             | `SYNO.SDS.BackupService.Instance`         |
| Java7                                          | `SYNO.SDS.JAVA7.Instance`                 |
| Java8                                          | `SYNO.SDS.JAVA8.Instance`                 |
| MailPlus Server                                | `SYNO.SDS.MailPlusServer.Instance`        |
| MariaDB 10                                     | `SYNO.SDS.MARIADB10.Instance`             |
| Notification Settings                          | `SYNO.SDS.DSMNotify.Setting.Application`  |
| PetaSpace                                      | `SYNO.SDS.ClusteredShare.Application`     |
| Snapshot Replication                           | `SYNO.SDS.DisasterRecovery.Application`   |
| Storage Analyzer                               | `SYNO.SDS.StorageAnalyzer.Application`    |
| Text Editor                                    | `SYNO.TextEditor.Application`             |
| Web Station                                    | `SYNO.SDS.WebStation.Application`         |
| WebDAV Server                                  | `SYNO.SDS.WebDAVServer.Instance`          |
| Universal Search                               | `SYNO.Finder.Application`                 |
| Active Backup for G Suite                      | `SYNO.SDS.ActiveBackupGSuite.Instance`    |
| Active Backup for Office 365                   | `SYNO.SDS.ActiveBackupOffice365.Instance` |
| Presto File Server                             | `SYNO.SDS.PrestoServer.Application`       |
| USB Copy                                       | `SYNO.SDS.USBCopy.Application`            |
| Active Backup for Business                     | `SYNO.ActiveBackup.AppInstance`           |
| iSCSI Manager                                  | `SYNO.SDS.iSCSI.Application`              |
| OAuth Service                                  | `SYNO.SDS.OAuthService.Instance`          |
| Active Directory Server                        | `SYNO.SDS.ADServer.Application`           |
| Virtual Machine Manager                        | `SYNO.SDS.Virtualization.Application`     |

## API Reference

<a name="bit"></a>

### BIT : <code>object</code>
BITespresso namespace.

**Kind**: global namespace
<a name="bit.sds"></a>

### BIT.SDS : <code>object</code>
Synology DiskStation namespace.

**Kind**: static namespace of [<code>BIT</code>](#user-content-bit)
<a name="bit.sds.windowutil"></a>

### SDS.WindowUtil
**Kind**: static class of [<code>SDS</code>](#user-content-bit.sds)

* [.WindowUtil](#user-content-bit.sds.windowutil)
    * _static_
        * [.cascadeOverlap([bounds])](#user-content-bit.sds.windowutil.cascadeoverlap)
        * [.close([appNames])](#user-content-bit.sds.windowutil.close) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.getAppData()](#user-content-bit.sds.windowutil.getappdata) ⇒ [<code>Array.&lt;AppData&gt;</code>](#user-content-bit.sds.windowutil..appdata)
        * [.getAppNames()](#user-content-bit.sds.windowutil.getappnames) ⇒ <code>Array.&lt;string&gt;</code>
        * [.getAppNamesForDsmVersion()](#user-content-bit.sds.windowutil.getappnamesfordsmversion) ⇒ <code>Array.&lt;string&gt;</code>
        * [.getDefaultSize([appNames])](#user-content-bit.sds.windowutil.getdefaultsize) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.getDsmVersion()](#user-content-bit.sds.windowutil.getdsmversion) ⇒ <code>string</code>
        * [.getRestoreSizePosPropertyName(appName)](#user-content-bit.sds.windowutil.getrestoresizepospropertyname) ⇒ <code>string</code>
        * [.hasRunningInstance(appName)](#user-content-bit.sds.windowutil.hasrunninginstance) ⇒ <code>boolean</code>
        * [.isAppNameForDsmVersion(appName)](#user-content-bit.sds.windowutil.isappnamefordsmversion) ⇒ <code>boolean</code>
        * [.isInstalled(appName)](#user-content-bit.sds.windowutil.isinstalled) ⇒ <code>boolean</code>
        * [.launch([appNames])](#user-content-bit.sds.windowutil.launch) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.logDefaultSize([appNames])](#user-content-bit.sds.windowutil.logdefaultsize)
        * [.resetRestoreSizeAndPosition([appNames])](#user-content-bit.sds.windowutil.resetrestoresizeandposition)
        * [.setRestorePagePosition(appName, x, y)](#user-content-bit.sds.windowutil.setrestorepageposition)
        * [.suggestBounds()](#user-content-bit.sds.windowutil.suggestbounds) ⇒ [<code>Bounds</code>](#user-content-bit.sds.windowutil..bounds)
    * _inner_
        * [~AppData](#user-content-bit.sds.windowutil..appdata) : <code>Object</code>
        * [~AppWinSize](#user-content-bit.sds.windowutil..appwinsize) : <code>Object</code>
        * [~Bounds](#user-content-bit.sds.windowutil..bounds) : <code>Object</code>

<a name="bit.sds.windowutil.cascadeoverlap"></a>

### WindowUtil.cascadeOverlap([bounds])
Sets the restore XY position of all applications to cascaded, overlapping positions
within the specified bounds and resets the restore size so that the windows will have
their respective default sizes.

The algorithm used ensures that each window has a position that depends entirely on the
specified bounds, regardless of which applications are installed or which DSM version is
used.

The method call including the parameters used is logged in the console. Please note this
down for your later information.

**Note 1**: Currently open application windows will not change their size and position.
You must close and reopen the application window to see the result. Do not move or resize
the application window beforehand, as this immediately sets the restore size and position
to the current window size and position.

**Note 2**: The Synology CMS (Central Management System) application
(`SYNO.SDS.CMS.Application`) does not read the restore size and position due to a bug in
DSM. To ensure that this window has the correct size and position, each time this method
is called, the application will be launched and the window will be set to the correct
size and position.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)

| Param | Type | Description |
| --- | --- | --- |
| [bounds] | [<code>Bounds</code>](#user-content-bit.sds.windowutil..bounds) | The bounds. |

**Example**
```js
BIT.SDS.WindowUtil.cascadeOverlap();
```
**Example**
```js
BIT.SDS.WindowUtil.cascadeOverlap({x: 160, y: 139, width: 1640, height: 830});
```
<a name="bit.sds.windowutil.close"></a>

### WindowUtil.close([appNames]) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Closes the provided or all application(s).

Closing application(s) is an asychronous operation, therefore this method returns a
promise that is fulfilled when all provided applications are closed.

If you call this method without providing `appNames`, all applications that can open a
window on the DSM desktop and are currently installed on the DiskStation will be closed.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A promise.

| Param | Type | Description |
| --- | --- | --- |
| [appNames] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | The application name(s). |

<a name="bit.sds.windowutil.getappdata"></a>

### WindowUtil.getAppData() ⇒ [<code>Array.&lt;AppData&gt;</code>](#user-content-bit.sds.windowutil..appdata)
Returns an array of [AppData](#user-content-bit.sds.windowutil..appdata) for all supported applications.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: [<code>Array.&lt;AppData&gt;</code>](#user-content-bit.sds.windowutil..appdata) - An array of `AppData` objects.
<a name="bit.sds.windowutil.getappnames"></a>

### WindowUtil.getAppNames() ⇒ <code>Array.&lt;string&gt;</code>
Returns an array of all applications that can open a window on the DSM desktop.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>Array.&lt;string&gt;</code> - An array of application names.
**Example**
```js
BIT.SDS.WindowUtil.getAppNames();
// => ["SYNO.SDS.AdminCenter.Application", ...]
```
<a name="bit.sds.windowutil.getappnamesfordsmversion"></a>

### WindowUtil.getAppNamesForDsmVersion() ⇒ <code>Array.&lt;string&gt;</code>
Returns an array of all applications that can open a window on the DSM desktop and are
available for the DSM version currently installed on the DiskStation.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>Array.&lt;string&gt;</code> - An array of application names.
**Example**
```js
BIT.SDS.WindowUtil.getAppNamesForDsmVersion();
// => ["SYNO.SDS.AdminCenter.Application", ...]
```
<a name="bit.sds.windowutil.getdefaultsize"></a>

### WindowUtil.getDefaultSize([appNames]) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Retrieves the respective default window size(s) of the provided or all application(s).

To get the default window size, first the restore size and XY position are reset via
[resetRestoreSizeAndPosition](#user-content-bit.sds.windowutil.resetrestoresizeandposition), next the application is launched
and finally the size of the newly opened application window is retrieved.

Therefore please note:

- The default window size can only be retrieved for currently installed applications.
- The applications must not be running when calling this method.
- The current restore size and XY position will be reset for those applications.

Launching the application(s) is an asychronous operation, therefore this method returns a
promise that is fulfilled with an array of [AppWinSize](#user-content-bit.sds.windowutil..appwinsize) objects.

If you call this method without providing `appNames`, the default window sizes of all
applications that can open a window on the DSM desktop and are currently installed on the
DiskStation will be retrieved.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A promise for an array of `AppWinSize` objects.

| Param | Type | Description |
| --- | --- | --- |
| [appNames] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | The application name(s). |

<a name="bit.sds.windowutil.getdsmversion"></a>

### WindowUtil.getDsmVersion() ⇒ <code>string</code>
Returns the DSM version currently installed on the DiskStation. The version has the
format: `<major version>.<minor version>`

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>string</code> - The DSM version.
**Example**
```js
BIT.SDS.WindowUtil.getDsmVersion();
// => 6.2
```
<a name="bit.sds.windowutil.getrestoresizepospropertyname"></a>

### WindowUtil.getRestoreSizePosPropertyName(appName) ⇒ <code>string</code>
Returns the name of the property that holds the restore size and position of the
application window.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>string</code> - The property name.

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |

<a name="bit.sds.windowutil.hasrunninginstance"></a>

### WindowUtil.hasRunningInstance(appName) ⇒ <code>boolean</code>
Returns `true` if the provided application has at least one running instance.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>boolean</code> - `true` if has running instance, `false` otherwise.

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |

<a name="bit.sds.windowutil.isappnamefordsmversion"></a>

### WindowUtil.isAppNameForDsmVersion(appName) ⇒ <code>boolean</code>
Returns `true` if the provided application name is an application that can open a window
on the DSM desktop and is available for the DSM version currently installed on the
DiskStation.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>boolean</code> - `true` if valid, `false` otherwise.

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |

<a name="bit.sds.windowutil.isinstalled"></a>

### WindowUtil.isInstalled(appName) ⇒ <code>boolean</code>
Returns `true` if the provided application is currently installed on the DiskStation.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: <code>boolean</code> - `true` if installed, `false` otherwise.

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |

<a name="bit.sds.windowutil.launch"></a>

### WindowUtil.launch([appNames]) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Launches the provided or all application(s).

Please note that already running applications will not be launched by this method.

Launching the application(s) is an asychronous operation, therefore this method returns a
promise that is fulfilled with an array of `SYNO.SDS.AppInstance` objects.

If you call this method without providing `appNames`, all applications that can open a
window on the DSM desktop and are currently installed on the DiskStation will be
launched.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A promise for an array of `SYNO.SDS.AppInstance` objects.

| Param | Type | Description |
| --- | --- | --- |
| [appNames] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | The application name(s). |

<a name="bit.sds.windowutil.logdefaultsize"></a>

### WindowUtil.logDefaultSize([appNames])
Logs the respective default window size(s) of the provided or all application(s) to the
console in CSV format. The record format is: `<application name>,<width>,<height>`

To get the default window size, the method [getDefaultSize](#user-content-bit.sds.windowutil.getdefaultsize) is
called, therefore please note:

- The default window size can only be retrieved for currently installed applications.
- The applications must not be running when calling this method.
- The current restore size and XY position will be reset for those applications.

If you call this method without providing `appNames`, the default window sizes of all
applications that can open a window on the DSM desktop and are currently installed on the
DiskStation will be logged.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)

| Param | Type | Description |
| --- | --- | --- |
| [appNames] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | The application name(s). |

**Example**
```js
BIT.SDS.WindowUtil.logDefaultSize();
// SYNO.SDS.AdminCenter.Application;994;570
// SYNO.SDS.App.FileStation3.Instance;920;560
// ...
```
**Example**
```js
BIT.SDS.WindowUtil.logDefaultSize("SYNO.SDS.App.FileStation3.Instance");
// SYNO.SDS.App.FileStation3.Instance;920;560
```
<a name="bit.sds.windowutil.resetrestoresizeandposition"></a>

### WindowUtil.resetRestoreSizeAndPosition([appNames])
Resets the restore size and XY position of the provided application(s).

If you call this method without providing `appNames`, all applications that can open a
window on the DSM desktop and are available for the DSM version currently installed on
the DiskStation will be reset.

**Note**: Currently open application windows will not change their size and position. You
must close and reopen the application window to see the result. Do not move or resize the
application window beforehand, as this immediately sets the restore size and position to
the current window size and position.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)

| Param | Type | Description |
| --- | --- | --- |
| [appNames] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | The application name(s). |

**Example**
```js
BIT.SDS.WindowUtil.resetRestoreSizeAndPosition();
// Resets the window size and position for all applications
```
**Example**
```js
BIT.SDS.WindowUtil.resetRestoreSizeAndPosition("SYNO.SDS.PkgManApp.Instance");
// Resets the window size and position for Package Center
```
**Example**
```js
BIT.SDS.WindowUtil.resetRestoreSizeAndPosition(["SYNO.SDS.PkgManApp.Instance", "SYNO.SDS.HA.Instance"]);
// Resets the window size and position for Package Center and High Availability Manager
```
<a name="bit.sds.windowutil.setrestorepageposition"></a>

### WindowUtil.setRestorePagePosition(appName, x, y)
Sets the restore page XY position of the provided application.

**Note**: Currently open application windows will not change their size and position. You
must close and reopen the application window to see the result. Do not move or resize the
application window beforehand, as this immediately sets the restore size and position to
the current window size and position.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)

| Param | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |
| x | <code>number</code> | The page x position. |
| y | <code>number</code> | The page y position. |

**Example**
```js
BIT.SDS.WindowUtil.setRestorePagePosition("SYNO.SDS.App.FileStation3.Instance", 10, 49);
// Sets the restore page XY position for File Station windows to (10px, 49px)
```
<a name="bit.sds.windowutil.suggestbounds"></a>

### WindowUtil.suggestBounds() ⇒ [<code>Bounds</code>](#user-content-bit.sds.windowutil..bounds)
Calculates a suggestion for the bounds which can be used as input for
[cascadeOverlap](#user-content-bit.sds.windowutil.cascadeoverlap).

The suggestion is based on the current size of the browser window, therefore you should
adjust the browser window to your needs before calling this method.

**Kind**: static method of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Returns**: [<code>Bounds</code>](#user-content-bit.sds.windowutil..bounds) - The suggested bounds.
**Example**
```js
BIT.SDS.WindowUtil.suggestBounds();
// => {x: 160, y: 139, width: 1640, height: 830}
```
<a name="bit.sds.windowutil..appdata"></a>

### WindowUtil~AppData : <code>Object</code>
An object containing data about an application.

**Kind**: inner typedef of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |
| dsmVersions | <code>Array.&lt;string&gt;</code> | An array of DSM versions. |
| maxDefaultWidth | <code>number</code> | The maximum default window width. |
| maxDefaultHeight | <code>number</code> | The maximum default window height. |

<a name="bit.sds.windowutil..appwinsize"></a>

### WindowUtil~AppWinSize : <code>Object</code>
An object containing the size of an application window.

**Kind**: inner typedef of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| appName | <code>string</code> | The application name. |
| width | <code>number</code> | The window width. |
| height | <code>number</code> | The window height. |

<a name="bit.sds.windowutil..bounds"></a>

### WindowUtil~Bounds : <code>Object</code>
A rectangle defining the bounds for the position of the application windows.

**Kind**: inner typedef of [<code>WindowUtil</code>](#user-content-bit.sds.windowutil)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The bounds page x position. |
| y | <code>number</code> | The bounds page y position. |
| width | <code>number</code> | The bounds width. |
| height | <code>number</code> | The bounds height. |

<a name="bit.sds.Promise"></a>

### SDS.Promise
**Kind**: static class of [<code>SDS</code>](#user-content-bit.sds)

* [.Promise](#user-content-bit.sds.promise)
    * [new Promise(resolver)](#user-content-new_bit.sds.promise_new)
    * _instance_
        * [.catch(onRejected)](#user-content-bit.sds.promise+catch) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.finally(onFinally)](#user-content-bit.sds.promise+finally) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.reject(reason)](#user-content-bit.sds.promise+reject)
        * [.resolve(value)](#user-content-bit.sds.promise+resolve)
        * [.then(onFulfilled, onRejected)](#user-content-bit.sds.promise+then) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
    * _static_
        * [.all(promises)](#user-content-bit.sds.promise.all) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.race(promises)](#user-content-bit.sds.promise.race) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.reject(reason)](#user-content-bit.sds.promise.reject) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.resolve(value)](#user-content-bit.sds.promise.resolve) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
        * [.retry(fn, tries, delay)](#user-content-bit.sds.promise.retry) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)

<a name="new_BIT.SDS.Promise_new"></a>

### new Promise(resolver)
Creates a new [Promise](#user-content-bit.sds.promise) instance.


| Param | Type | Description |
| --- | --- | --- |
| resolver | <code>function</code> | The resolver function. |

<a name="bit.sds.Promise+catch"></a>

### promise.catch(onRejected) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Adds a callback to the promise to be called when this promise is rejected. Returns a new
promise that will be rejected when the callback is complete.

**Kind**: instance method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new promise.

| Param | Type | Description |
| --- | --- | --- |
| onRejected | <code>function</code> | The rejected callback. |

<a name="bit.sds.Promise+finally"></a>

### promise.finally(onFinally) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Adds a callback to the promise to be called when this promise is fulfilled or rejected.
Returns a new promise that will be fulfilled or rejected when the callback is complete.

**Kind**: instance method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new promise.

| Param | Type | Description |
| --- | --- | --- |
| onFinally | <code>function</code> | The finally callback. |

<a name="bit.sds.Promise+reject"></a>

### promise.reject(reason)
Rejects the promise with the passed reason.

**Kind**: instance method of [<code>Promise</code>](#user-content-bit.sds.promise)

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>\*</code> | The reason. |

<a name="bit.sds.Promise+resolve"></a>

### promise.resolve(value)
Resolves the promise with the passed value.

**Kind**: instance method of [<code>Promise</code>](#user-content-bit.sds.promise)

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value. |

<a name="bit.sds.Promise+then"></a>

### promise.then(onFulfilled, onRejected) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Adds callbacks to the promise to be called when this promise is fulfilled or rejected.
Returns a new promise that will be fulfilled or rejected when the callback is complete.

**Kind**: instance method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new promise.

| Param | Type | Description |
| --- | --- | --- |
| onFulfilled | <code>function</code> | The fulfilled callback. |
| onRejected | <code>function</code> | The rejected callback. |

<a name="bit.sds.Promise.all"></a>

### Promise.all(promises) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Returns a promise that resolves when all of the promises passed have resolved or when the
array contains no promises. It rejects with the reason of the first promise that rejects.

**Kind**: static method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new promise.

| Param | Type | Description |
| --- | --- | --- |
| promises | [<code>Array.&lt;Promise&gt;</code>](#user-content-bit.sds.promise) | The promises. |

<a name="bit.sds.Promise.race"></a>

### Promise.race(promises) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Returns a new promise that resolves or rejects as soon as one of the promises passed
resolves or rejects, with the value or reason from that promise.

**Kind**: static method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new promise.

| Param | Type | Description |
| --- | --- | --- |
| promises | [<code>Array.&lt;Promise&gt;</code>](#user-content-bit.sds.promise) | The promises. |

<a name="bit.sds.Promise.reject"></a>

### Promise.reject(reason) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Returns a promise that is rejected with the passed reason.

**Kind**: static method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new rejecting promise.

| Param | Type | Description |
| --- | --- | --- |
| reason | <code>\*</code> | The reason. |

<a name="bit.sds.Promise.resolve"></a>

### Promise.resolve(value) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Returns a promise that is resolved with the passed value.

**Kind**: static method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new resolving promise.

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value. |

<a name="bit.sds.Promise.retry"></a>

### Promise.retry(fn, tries, delay) ⇒ [<code>Promise</code>](#user-content-bit.sds.promise)
Tries to resolve a promise multiple times if it is rejected. The passed function will be
called repeatedly until the promise returned by the function is resolved or the maximum
number of attempts is reached.

Returns a new promise that is fulfilled with the fulfillment value of the promise
returned by the function, or is rejected with the same reason as the promise returned by
the function in the last attempt.

Subsequent calls of the function will be deferred by a delay specified in milliseconds.

**Kind**: static method of [<code>Promise</code>](#user-content-bit.sds.promise)
**Returns**: [<code>Promise</code>](#user-content-bit.sds.promise) - A new promise.

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | The function returning a promise. |
| tries | <code>number</code> | The maximum number of attempts. |
| delay | <code>number</code> | The delay. |

**Example**
```js
function trySomething() {
  function resolver(resolve, reject) {
    ... // Try to resolve promise
  }

  return new BIT.SDS.Promise(resolver);
}

BIT.SDS.Promise.retry(trySomething, 5, 5000)
  .then(...)
  .catch(...);
```
## License

Copyright (C) 2019 Michael Berger (BITespresso)

DSM-Window-Utilities is licensed under the **GNU General Public License v3 (GPL-3)** (http://www.gnu.org/copyleft/gpl.html).
