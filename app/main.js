// Load settings before everything
let appConfig;
const fs = require("fs-extra");
const path = require('path');
const {app, BrowserWindow, ipcMain, Menu, Tray, Notification} = require('electron');
const os = require('os');
loadSettings();

const theApp = require('./app');
const WindowStateManager = require('electron-window-state-manager');
const url = require('url');

let tray = null;
let mainWindow;
let trayIcon = __dirname + "/icon.png";
let isTray = false;
// Create a new instance of the WindowStateManager
const mainWindowState = new WindowStateManager('mainWindow', {
	defaultWidth: 1280,
	defaultHeight: 800
});

var shouldQuit = !app.requestSingleInstanceLock()
app.on('second-instance', function (argv, cwd) {
	if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
		if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
})

if (shouldQuit) {
  app.quit();
  return;
}

app.isQuiting = false;

app.serverMode = (process.argv.indexOf("-s")>-1 || process.argv.indexOf("--server")>-1);

require('electron-context-menu')({
	showInspectElement: false
});

function loadSettings(){
	var userdata = "";
	if(process.platform == "android"){
		userdata = os.homedir() + "/storage/shared/DeezerSongs/";
	}else{
		userdata = app.getPath("appData")+path.sep+"DeezerSongs"+path.sep;
	}

	if(!fs.existsSync(userdata+"config.json")){
		fs.outputFileSync(userdata+"config.json",fs.readFileSync(__dirname+path.sep+"default.json",'utf8'));
	}

	appConfig = require(userdata+path.sep+"config.json");

	if( typeof appConfig.userDefined.numplaylistbyalbum != "boolean" ||
			typeof appConfig.userDefined.syncedlyrics != "boolean" ||
		 	typeof appConfig.userDefined.padtrck != "boolean" ||
	 		typeof appConfig.userDefined.albumNameTemplate != "string"
		){
		fs.outputFileSync(userdata+"config.json",fs.readFileSync(__dirname+path.sep+"default.json",'utf8'));
		appConfig = require(userdata+path.sep+"config.json");
	}
}

function createTray(){
	tray = new Tray(trayIcon);
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App',
			click: function() {
				if (mainWindow) mainWindow.show();
			}
		},
		{
			label: 'Quit',
			click: function() {
				app.isQuiting = true;
				if (mainWindow){mainWindow.close()}else{app.quit()};
			}
		}
	]);
	tray.setToolTip('DeezerSongs');
	tray.setContextMenu(contextMenu);

	tray.on('click', function(e){
		if (mainWindow){
			if (mainWindow.isVisible()) {
				mainWindow.hide()
			} else {
				mainWindow.show()
			}
		}
	});
}

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: mainWindowState.width,
		height: mainWindowState.height,
		x: mainWindowState.x,
		y: mainWindowState.y,
		alwaysOnTop: false,
		frame: false,
		icon: __dirname + "/icon.png",
		minWidth: 415,
		minHeight: 32,
		backgroundColor: "#23232c"
	});

	mainWindow.setMenu(null);

	// and load the index.html of the app.
	mainWindow.loadURL('http://localhost:' + appConfig.serverPort);

	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	// Check if window was closed maximized and restore it
	if (mainWindowState.maximized) {
		mainWindow.maximize();
	}

	// Save current window state
	mainWindow.on('close', (event) => {
		if(appConfig.userDefined.minimizeToTray && !app.isQuiting){
			event.preventDefault()
			mainWindow.hide();
		} else {
			mainWindowState.saveState(mainWindow);
		}
	});
}

app.on('ready', function(){
	if (!app.serverMode){
		createWindow();
		createTray();
	}
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	if (!appConfig.userDefined.minimizeToTray || app.isQuiting){
		app.quit();
	}
});

app.on('activate', function () {
	if (!app.serverMode && mainWindow === null) {
		createWindow();
	}
});
