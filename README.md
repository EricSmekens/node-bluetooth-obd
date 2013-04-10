bluetooth-obd
===============

#
# Bluetooth communication for OBD-II ELM327 devices.
This node module lets you communicate over a bluetooth serial port with OBD-II ELM327 Connectors using Node.js.
# Limitations
* Only tested on Ubuntu
* Only tested on ELM327 devices.
* Not all OBD-II Commands are implemented yet.

# Pre-requests
* If it's a Bluetooth ELM327, then it should already be paired!

# Install
`npm install bluetooth-obd`

# Documentation

## Basic usage

```javascript
var OBDReader = require('serial-obd');
var options = {};
options.baudrate = 115200;
var serialOBDReader = new OBDReader("/dev/rfcomm0", options);
var dataReceivedMarker = {};

serialOBDReader.on('dataReceived', function (data) {
    console.log(data);
    dataReceivedMarker = data;
});

serialOBDReader.on('connected', function (data) {
    this.requestValueByName("vss"); //vss = vehicle speed sensor

    this.addPoller("vss");
    this.addPoller("rpm");
    this.addPoller("temp");
    this.addPoller("load_pct");
    this.addPoller("map");
    this.addPoller("frp");

    this.startPolling(2000); //Polls all added pollers each 2000 ms.
});

serialOBDReader.connect();
```
## API

###OBDReader

#### Event: ('dataReceived', data)

Emitted when data is read from the OBD-II connector.

* data - the data that was read and parsed to a reply object

#### Event: ('connected')

Emitted when the connection is set up (port is open).

* data - the data that was read and parsed to a reply object

#### OBDReader(portName, options)

Creates an instance of OBDReader.

##### Params:

* **string** *portName* Port that will be connected to. For example: &quot;/dev/rfcomm0&quot;

* **Object** *options* Object that contains options, e.g.: baudrate, databits, stopbits, flowcontrol. Same options serialport module uses.

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

#### connect()

Connect/Open the serial port and add events to serialport. Also starts the intervalWriter that is used to write the queue.

#### disconnect()

Disconnects/closes the port.

#### write(message)

Writes a message to the port. (Queued!) All write functions call this function.

##### Params: 

* **string** *message* The PID or AT Command you want to send. Without \r or \n!

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

Starts polling.

##### Params:

* **number** *interval* Frequency how often all variables should be polled. (in ms) Default = 1000 ms.

#### stopPolling()

Stops polling.

# LICENSE

This module is available under a [FreeBSD license](http://opensource.org/licenses/BSD-2-Clause), see also the [LICENSE file](https://raw.github.com/EricSmekens/node-bluetooth-obd/master/LICENSE) for details.
