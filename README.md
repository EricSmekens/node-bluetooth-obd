[![NPM](https://nodei.co/npm/bluetooth-obd.png?downloads=true&stars=true)](https://nodei.co/npm/bluetooth-obd/)

bluetooth-obd - 0.2.0
===============

# This module needs some maintenance, to make it a really usefull module. For now, might have some problems here and there.


# Bluetooth communication for OBD-II ELM327 devices.
This node module lets you communicate over a bluetooth serial port with OBD-II ELM327 Connectors using Node.js.
# Limitations
* Only tested on Ubuntu
* Only tested on ELM327 devices.
* Not all OBD-II Commands are implemented yet.

# Pre-Requirements
* If it's a Bluetooth ELM327, then it should already be paired! If this hasn't been done, it will cause a connection error.
* bluetooth-serial-port (module that is used by this module, thanks to Eelco) requires libbluetooth-dev package:
** $ sudo apt-get install libbluetooth-dev

# Turbo-mode
* Version 0.0.6 and higher contain some special settings that increase the amount of PIDS you can request by over 500%. Let me know if it gives errors.

# Serial
* If you're looking for serial RS23 connection, look into serial-obd.

# Install
`npm install bluetooth-obd`

# Documentation

## Basic usage

```javascript
var OBDReader = require('bluetooth-obd');
var btOBDReader = new OBDReader();
var dataReceivedMarker = {};

btOBDReader.on('dataReceived', function (data) {
    console.log(data);
    dataReceivedMarker = data;
});

btOBDReader.on('connected', function () {
    //this.requestValueByName("vss"); //vss = vehicle speed sensor

    this.addPoller("vss");
    this.addPoller("rpm");
    this.addPoller("temp");
    this.addPoller("load_pct");
    this.addPoller("map");
    this.addPoller("frp");

    this.startPolling(1000); //Request all values each second.
});

// Use first device with 'obd' in the name
btOBDReader.autoconnect('obd');
```
## API

###OBDReader

#### Event: ('dataReceived', data)

Emitted when data is read from the OBD-II connector.

* data - the data that was read and parsed to a reply object

#### Event: ('connected')

Emitted when the connection is set up (port is open).

#### Event: ('error', message)

Emitted when an error is encountered.

#### Event: ('debug', message)

Emitted with debugging information.

#### OBDReader()

Creates an instance of OBDReader.

#### getPIDByName(Name)

Find a PID-value by name.

##### Params: 

* **name** *Name* of the PID you want the hexadecimal (in ASCII text) value of.

##### Return:

* **string** PID in hexadecimal ASCII

#### parseOBDCommand(hexString)

Parses a hexadecimal string to a reply object. Uses PIDS. (obdInfo.js)

##### Params: 

* **string** *hexString* Hexadecimal value in string that is received over the serialport.

##### Return:

* **Object** reply - The reply.
* **string** reply.value - The value that is already converted. This can be a PID converted answer or &quot;OK&quot; or &quot;NO DATA&quot;.
* **string** reply.name - The name. --! Only if the reply is a PID.
* **string** reply.mode - The mode of the PID. --! Only if the reply is a PID.
* **string** reply.pid - The PID. --! Only if the reply is a PID.

#### autoconnect(query)

Attempt discovery of the device based on a query string, and call connect() on the first match.

##### Params:

 * **string** *query* (Optional) string to be matched against address/channel (fuzzy-ish)

#### connect(address, channel)

Connect/Open the serial port and add events to serialport. Also starts the intervalWriter that is used to write the queue.

##### Params:

 * **string** *address* MAC-address of device that will be connected to.
 * **number** *channel* Channel that the serial port service runs on.

#### disconnect()

Disconnects/closes the port.

#### write(message, replies)

Writes a message to the port. (Queued!) All write functions call this function.

##### Params: 

* **string** *message* The PID or AT Command you want to send. Without \r or \n!
* **number** *replies* The number of replies that are expected. Default = 0. 0 --> infinite

#### requestValueByName(name)

Writes a PID value by entering a pid supported name.

##### Params: 

* **string** *name* Look into obdInfo.js for all PIDS.

#### addPoller(name)

Adds a poller to the poller-array.

##### Params: 

* **string** *name* Name of the poller you want to add.

#### removePoller(name)

Removes an poller.

##### Params: 

* **string** *name* Name of the poller you want to remove.

#### removeAllPollers()

Removes all pollers.

#### writePollers()

Writes all active pollers.

#### startPolling()

Starts polling. Lower interval than activePollers * 50 will probably give buffer overflows.

##### Params:

* **number** *interval* Frequency how often all variables should be polled. (in ms) If no value is given, then for each activePoller 75ms will be added.

#### stopPolling()

Stops polling.

# LICENSE

This module is available under a [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0.html), see also the [LICENSE file](https://raw.github.com/EricSmekens/node-bluetooth-obd/master/LICENSE) for details.
