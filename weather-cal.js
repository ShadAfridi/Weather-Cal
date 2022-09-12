// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: sun;
/*

~

Welcome to Weather Cal. Run this script to set up your widget.

Add or remove items from the widget in the layout section below.

You can duplicate this script to create multiple widgets. Make sure to change the name of the script each time.

Happy scripting!

~

*/

// Specify the layout of the widget items.
const layout = `
  
 row 
    
    column
    date
    f1
    solticker
    adaticker
    space
    events
    
    column(110)
    right
    current
    daily
    space
    left
    reminders
    
    

`

/*
 * CODE
 * Be more careful editing this section. 
 * =====================================
 */

// Names of Weather Cal elements.
const codeFilename = "Weather Cal code"
const gitHubUrl = "https://raw.githubusercontent.com/mzeryck/Weather-Cal/main/weather-cal-code.js"

// Determine if the user is using iCloud.
let files = FileManager.local()
const iCloudInUse = files.isFileStoredIniCloud(module.filename)

// If so, use an iCloud file manager.
files = iCloudInUse ? FileManager.iCloud() : files

// Determine if the Weather Cal code exists and download if needed.
const pathToCode = files.joinPath(files.documentsDirectory(), codeFilename + ".js")
if (!files.fileExists(pathToCode)) {
  const req = new Request(gitHubUrl)
  const codeString = await req.loadString()
  files.writeString(pathToCode, codeString)
}

// Import the code.
if (iCloudInUse) { await files.downloadFileFromiCloud(pathToCode) }
const code = importModule(codeFilename)
const custom = {
  
  async solticker(row) {
    
try{
  
let params = null;
// Parameter takeover from input
if (args.widgetParameter == null) {
    params = ["SOL", "INR", "1.866"]; // Default input without parameters
} else {
    params = args.widgetParameter.split(",")
    console.log(params)
}

if (params[2] == null) {
    params[2] = 1;
}

// Fetch Coinbase API json object
const url = 'https://api.coinbase.com/v2/prices/' + params[0] + '-' + params[1] + '/spot'
const req = new Request(url)
const res = await req.loadJSON()
let base = "";
let currency = "";
let currencySymbol = "";
let amount = "";
let marketName = "";
let USDamount = "";
let coinbaseReqFailed = JSON.stringify(res).toLowerCase().includes("errors")

// Check if the api response contains an error message
if (coinbaseReqFailed == false) {
    base = res.data.base;
    currency = res.data.currency;
    amount = res.data.amount;
    marketName = "Coinbase";

    // Fetch Coinbase API json object as USD for comapre with latest course (only available in USD)
    const USDurl = 'https://api.coinbase.com/v2/prices/' + params[0] + '-USD/spot'
    const USDreq = new Request(USDurl)
    const USDres = await USDreq.loadJSON()
    if (coinbaseReqFailed == false || marketName != "") {
        USDamount = USDres.data.amount;
        USDamount = parseFloat(USDamount).toFixed(2)
    } else {
        base = params[0]
        currency = params[1]
        amount = res.errors[0].message;
    }
}

// Second try with anoher coinbase api  
if (coinbaseReqFailed == true) {

    const url2 = 'https://api.coinbase.com/v2/exchange-rates?currency=' + params[0]
    const req2 = new Request(url2)
    const res2 = await req2.loadJSON()
    coinbaseReqFailed = JSON.stringify(res2).toLowerCase().includes("errors")
    if (coinbaseReqFailed == false) {

        base = res2.data.currency
        currency = params[1].toUpperCase()
        amount = res2.data.rates[params[1]]
        marketName = "Coinbase";
        
        // Get value in USD for selecting ticker symbol later
        USDamount = res2.data.rates.USD;

    } else {

        base = params[0]
        currency = params[1]
        amount = res.errors[0].message;
    }
    
    
}

// Fallback to Bitfinex if Coinbase Req failed
/*if (coinbaseReqFailed == true) {
    const bitfinexUrl = 'https://api-pub.bitfinex.com/v2/tickers?symbols=t' + params[0] + params[1]
    const bitfinexReq = new Request(bitfinexUrl)
    const bitfinexRes = await bitfinexReq.loadJSON()
    if (JSON.stringify(bitfinexRes) != "[]") {
        amount = (bitfinexRes[Object.keys(bitfinexRes)[0]][9]).toString()
        marketName = "Bitfinex"
    }
}

    if (params[0] == "IOT") {
      base = "MIOTA";
    }*/


/*let name = "";
let rank = "";
if (coinbaseReqFailed == false || marketName != "") {
    const nameUrl = 'https://api.coinpaprika.com/v1/search?q=' + base.toLowerCase() + '&c=currencies&limit=1'
    const nameReq = new Request(nameUrl)
    const resName = await nameReq.loadJSON()
    try {
        name = resName.currencies[0].name;
        rank = resName.currencies[0].rank;
    } catch (e) {
        name = "Not found";
        rank = 0;
 }}*/


let upticker = SFSymbol.named("chevron.up");
let downticker = SFSymbol.named("chevron.down");
let latest = "";
let resLatest = "";
if ((coinbaseReqFailed == false || marketName != "")) {
    let replaceName = "solana"
    //name.replaceAll(" ", "-");
    const latestUrl = 'https://api.coinpaprika.com/v1/coins/' + base.toLowerCase() + '-' + replaceName.toLowerCase() + '/ohlcv/latest/'
    const latestReq = new Request(latestUrl)
    resLatest = await latestReq.loadJSON()
    if (coinbaseReqFailed == false && JSON.stringify(resLatest) != "[]" || marketName != "") {
        latest = resLatest[0].close;
        latest = parseFloat(latest).toFixed(2);
    }
}

let widget = await createWidget(base, amount, currency)

function createWidget(base, amount, currency) {
  
    let w = row.addStack()
 
w.layoutVertically()
w.setPadding(5, 5, 5, 5)

    if (currency == "INR")
    {currencySymbol = "₹";}
    else if (currency == "USD")
    {currencySymbol = "$";}
    else if (currency == "GBP")
    {currencySymbol = "£";}
    else if (currency == "JPY")
    {currencySymbol = "¥"}
    else {currencySymbol = currency;}
    // Place image on the left top
    let imageStack = w.addStack();
    imageStack.setPadding(0, 0, 0, 0);
    imageStack.layoutHorizontally()
    /*let image = imageStack.addImage(img)
    image.imageSize = new Size(15, 15)
    image.centerAlignImage()
    imageStack.addSpacer(5);*/

    let imageTextStack = imageStack.addStack();
    imageTextStack.layoutVertically();
    imageTextStack.addSpacer(0);

    //Symbol of crypto token
    let baseStack = imageTextStack.addStack()
    baseStack.layoutHorizontally();

    if (marketName != "") {
        let baseText = baseStack.addText(base + " ")
        baseText.textColor = Color.white()

        if (baseText.length < 5) {
            baseText.font = Font.systemFont(18)
        } else {
            baseText.font = Font.systemFont(14)
        }
    }

    let tickerStack = baseStack.addStack();
    tickerStack.layoutHorizontally()

    // Stack for ticker image: if course yesterday is lower than today show red ticker
    // if course yesterday
    if (JSON.stringify(resLatest).toLowerCase().includes("errors") == false && JSON.stringify(resLatest) != "[]" &&
        coinbaseReqFailed == false || marketName != "") {
        let ticker = null;
        if (USDamount < latest) {
            ticker = tickerStack.addImage(downticker.image);
            ticker.tintColor = Color.red();
        } else {
            ticker = tickerStack.addImage(upticker.image);
            ticker.tintColor = Color.green();
        }

        ticker.imageSize = new Size(16, 16)
    }

    // Rank of crypto token
    /*let rankText = "";
    if (coinbaseReqFailed == false || marketName != "") {
        rankText = imageTextStack.addText("Rank: " + rank)
    }
    rankText.textColor = Color.white()
    rankText.font = Font.systemFont(12)*/

    /*let marketText = imageTextStack.addText(marketName)
    marketText.textColor = Color.orange()
    marketText.font = Font.mediumSystemFont(9)

    w.addSpacer(8)

    // Full name of crypto token
    let staticText = w.addText(name)
    staticText.textColor = Color.white()
    staticText.font = Font.systemFont(13)
    staticText.centerAlignText()

    if (params[2] != 1) {
        w.addSpacer(2)
        let specialAmount = w.addText(params[2] + " " + base)
        specialAmount.textColor = Color.yellow()
        specialAmount.font = Font.mediumSystemFont(9)
        specialAmount.centerAlignText()
    }

    w.addSpacer(8)*/

    // Round amount to 2 decimal positions
    let amountTxt = "";
    if (coinbaseReqFailed == false || marketName != "") {
        // Cut numbers over 10 Million and show just with ending 'M'
        amount = (amount / 100) * (params[2] * 100)
        if (parseFloat(amount) >= 10000000) {
            amount = (parseFloat(amount) / 1000000).toFixed(2).replace(/\.0$/, '');
            amount += "M";
        } else if (parseFloat(amount) <= 0.01) {
            amount = parseFloat(amount).toFixed(5)
        } else {
            amount = parseFloat(amount).toFixed(2);
        }
        amountTxt = w.addText(currencySymbol + " " + amount)
        if(USDamount < latest){
        amountTxt.textColor = Color.white()}
        else{amountTxt.textColor = Color.white()}

    } else {
        amountTxt = w.addText(amount); // Write error message in case as amount
        amountTxt.textColor = Color.red()
    }
    amountTxt.centerAlignText()
    amountTxt.font = Font.boldMonospacedSystemFont(12)

    //w.addSpacer(8)

    // Bottom date text 
    /*let currentDate = new Date();
    let lastDate = w.addDate(currentDate);
    lastDate.textColor = Color.lightGray()
    lastDate.font = Font.mediumSystemFont(10)
    lastDate.centerAlignText();

    w.setPadding(0, 0, 0, 0)*/
}}catch(e){
log(e)}
},

async adaticker(row) {
  try{
  
let params = null;
// Parameter takeover from input
if (args.widgetParameter == null) {
    params = ["ADA", "INR", "95.5"]; // Default input without parameters
} else {
    params = args.widgetParameter.split(",")
    console.log(params)
}

if (params[2] == null) {
    params[2] = 1;
}

// Fetch Coinbase API json object
const url = 'https://api.coinbase.com/v2/prices/' + params[0] + '-' + params[1] + '/spot'
const req = new Request(url)
const res = await req.loadJSON()
let base = "";
let currency = "";
let currencySymbol = "";
let amount = "";
let marketName = "";
let USDamount = "";
let coinbaseReqFailed = JSON.stringify(res).toLowerCase().includes("errors")

// Check if the api response contains an error message
if (coinbaseReqFailed == false) {
    base = res.data.base;
    currency = res.data.currency;
    amount = res.data.amount;
    marketName = "Coinbase";

    // Fetch Coinbase API json object as USD for comapre with latest course (only available in USD)
    const USDurl = 'https://api.coinbase.com/v2/prices/' + params[0] + '-USD/spot'
    const USDreq = new Request(USDurl)
    const USDres = await USDreq.loadJSON()
    if (coinbaseReqFailed == false || marketName != "") {
        USDamount = USDres.data.amount;
        USDamount = parseFloat(USDamount).toFixed(2)
    } else {
        base = params[0]
        currency = params[1]
        amount = res.errors[0].message;
    }
}

// Second try with anoher coinbase api  
if (coinbaseReqFailed == true) {

    const url2 = 'https://api.coinbase.com/v2/exchange-rates?currency=' + params[0]
    const req2 = new Request(url2)
    const res2 = await req2.loadJSON()
    coinbaseReqFailed = JSON.stringify(res2).toLowerCase().includes("errors")
    if (coinbaseReqFailed == false) {

        base = res2.data.currency
        currency = params[1].toUpperCase()
        amount = res2.data.rates[params[1]]
        marketName = "Coinbase";
        
        // Get value in USD for selecting ticker symbol later
        USDamount = res2.data.rates.USD;

    } else {

        base = params[0]
        currency = params[1]
        amount = res.errors[0].message;
    }
    
    
}

// Fallback to Bitfinex if Coinbase Req failed
/*if (coinbaseReqFailed == true) {
    const bitfinexUrl = 'https://api-pub.bitfinex.com/v2/tickers?symbols=t' + params[0] + params[1]
    const bitfinexReq = new Request(bitfinexUrl)
    const bitfinexRes = await bitfinexReq.loadJSON()
    if (JSON.stringify(bitfinexRes) != "[]") {
        amount = (bitfinexRes[Object.keys(bitfinexRes)[0]][9]).toString()
        marketName = "Bitfinex"
    }
}

    if (params[0] == "IOT") {
      base = "MIOTA";
    }*/


/*let name = "";
let rank = "";
if (coinbaseReqFailed == false || marketName != "") {
    const nameUrl = 'https://api.coinpaprika.com/v1/search?q=' + base.toLowerCase() + '&c=currencies&limit=1'
    const nameReq = new Request(nameUrl)
    const resName = await nameReq.loadJSON()
    try {
        name = resName.currencies[0].name;
        rank = resName.currencies[0].rank;
    } catch (e) {
        name = "Not found";
        rank = 0;
 }}*/


let upticker = SFSymbol.named("chevron.up");
let downticker = SFSymbol.named("chevron.down");
let latest = "";
let resLatest = "";
if ((coinbaseReqFailed == false || marketName != "")) {
    let replaceName = "cardano"
    //name.replaceAll(" ", "-");
    const latestUrl = 'https://api.coinpaprika.com/v1/coins/' + base.toLowerCase() + '-' + replaceName.toLowerCase() + '/ohlcv/latest/'
    const latestReq = new Request(latestUrl)
    resLatest = await latestReq.loadJSON()
    if (coinbaseReqFailed == false && JSON.stringify(resLatest) != "[]" || marketName != "") {
        latest = resLatest[0].close;
        latest = parseFloat(latest).toFixed(2);
    }
}

let widget = await createWidget(base, amount, currency)

function createWidget(base, amount, currency) {
  
    let w = row.addStack()
    
w.layoutVertically()
w.setPadding(5, 5, 5, 5)

    if (currency == "INR")
    {currencySymbol = "₹";}
    else if (currency == "USD")
    {currencySymbol = "$";}
    else if (currency == "GBP")
    {currencySymbol = "£";}
    else if (currency == "JPY")
    {currencySymbol = "¥"}
    else {currencySymbol = currency;}
    // Place image on the left top
    let imageStack = w.addStack();
    imageStack.setPadding(0, 0, 0, 0);
    imageStack.layoutHorizontally()
    /*let image = imageStack.addImage(img)
    image.imageSize = new Size(15, 15)
    image.centerAlignImage()
    imageStack.addSpacer(5);*/

    let imageTextStack = imageStack.addStack();
    imageTextStack.layoutVertically();
    imageTextStack.addSpacer(0);

    //Symbol of crypto token
    let baseStack = imageTextStack.addStack()
    baseStack.layoutHorizontally();

    if (marketName != "") {
        let baseText = baseStack.addText(base + " ")
        baseText.textColor = Color.white()

        if (baseText.length < 5) {
            baseText.font = Font.systemFont(18)
        } else {
            baseText.font = Font.systemFont(14)
        }
    }

    let tickerStack = baseStack.addStack();
    tickerStack.layoutHorizontally()

    // Stack for ticker image: if course yesterday is lower than today show red ticker
    // if course yesterday
    if (JSON.stringify(resLatest).toLowerCase().includes("errors") == false && JSON.stringify(resLatest) != "[]" &&
        coinbaseReqFailed == false || marketName != "") {
        let ticker = null;
        if (USDamount < latest) {
            ticker = tickerStack.addImage(downticker.image);
            ticker.tintColor = Color.red();
        } else {
            ticker = tickerStack.addImage(upticker.image);
            ticker.tintColor = Color.green();
        }

        ticker.imageSize = new Size(16, 16)
    }

    // Rank of crypto token
    /*let rankText = "";
    if (coinbaseReqFailed == false || marketName != "") {
        rankText = imageTextStack.addText("Rank: " + rank)
    }
    rankText.textColor = Color.white()
    rankText.font = Font.systemFont(12)*/

    /*let marketText = imageTextStack.addText(marketName)
    marketText.textColor = Color.orange()
    marketText.font = Font.mediumSystemFont(9)

    w.addSpacer(8)

    // Full name of crypto token
    let staticText = w.addText(name)
    staticText.textColor = Color.white()
    staticText.font = Font.systemFont(13)
    staticText.centerAlignText()

    if (params[2] != 1) {
        w.addSpacer(2)
        let specialAmount = w.addText(params[2] + " " + base)
        specialAmount.textColor = Color.yellow()
        specialAmount.font = Font.mediumSystemFont(9)
        specialAmount.centerAlignText()
    }

    w.addSpacer(8)*/

    // Round amount to 2 decimal positions
    let amountTxt = "";
    if (coinbaseReqFailed == false || marketName != "") {
        // Cut numbers over 10 Million and show just with ending 'M'
        amount = (amount / 100) * (params[2] * 100)
        if (parseFloat(amount) >= 10000000) {
            amount = (parseFloat(amount) / 1000000).toFixed(2).replace(/\.0$/, '');
            amount += "M";
        } else if (parseFloat(amount) <= 0.01) {
            amount = parseFloat(amount).toFixed(5)
        } else {
            amount = parseFloat(amount).toFixed(2);
        }
        amountTxt = w.addText(currencySymbol + " " + amount)
        if(USDamount < latest){
        amountTxt.textColor = Color.white()}
        else{amountTxt.textColor = Color.white()}

    } else {
        amountTxt = w.addText(amount); // Write error message in case as amount
        amountTxt.textColor = Color.red()
    }
    amountTxt.centerAlignText()
    amountTxt.font = Font.boldMonospacedSystemFont(12)

    //w.addSpacer(8)

    // Bottom date text 
    /*let currentDate = new Date();
    let lastDate = w.addDate(currentDate);
    lastDate.textColor = Color.lightGray()
    lastDate.font = Font.mediumSystemFont(10)
    lastDate.centerAlignText();

    w.setPadding(0, 0, 0, 0)*/
}}catch{
}
},
async f1(row) {
 try{
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;
async function getData(){
	let req = await new Request("https://ergast.com/api/f1/current/next.json")
	let json = await req.loadJSON()
	return json
}

function formatDate(date){
	let d = new Date(date)
	d.setHours(00)
	let now = new Date()
	now.setHours(00)
	let difference = (d.getTime() - now.getTime()) / (1000 * 3600 * 24)
	difference = difference.toFixed(0)
	let dateTXT;
	if(difference == "-0"){
		dateTXT = " is today!"
	}else if(difference == "1"){
		dateTXT = " is tomorrow!"
	}else{
		dateTXT = " is in "+difference + " days!"
	}
	return dateTXT
}


let json = await getData()
let w = row.addStack()
w.layoutVertically()
w.setPadding(5, 5, 5, 5)

let titleStack = w.addStack()
titleStack.layoutHorizontally()
titleStack.centerAlignContent()
titleStack.spacing = 5


let date = formatDate(json.MRData.RaceTable.Races[0].date)

let raceNameData = json.MRData.RaceTable.Races[0].raceName.split(" ")
let raceName = raceNameData[0]+" GP"+ date
let race = titleStack.addText(raceName)
race.font = Font.systemFont(14)

let symbol = titleStack.addImage(SFSymbol.named("flag.2.crossed").image)
symbol.tintColor = Color.white()
symbol.imageSize = new Size(20,20)
} catch(e){}
},
}

// Run the initial setup or settings menu.
let preview
if (config.runsInApp) {
  preview = await code.runSetup(Script.name(), iCloudInUse, codeFilename, gitHubUrl)
  if (!preview) return
}

// Set up the widget.
const widget = await code.createWidget(layout, Script.name(), iCloudInUse, custom)
Script.setWidget(widget)

// If we're in app, display the preview.
if (config.runsInApp) {
  if (preview == "small") { widget.presentSmall() }
  else if (preview == "medium") { widget.presentMedium() }
  else { widget.presentLarge() }
}

Script.complete()
