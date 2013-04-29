/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * (C) Copyright 2013, TNO
 * Author: Eric Smekens
 */
'use strict';
//Used for event emitting.
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// obdInfo.js for all PIDS.
var PIDS = require('../lib/obdInfo.js');

//MyQueue
var queue = [];

// Class OBDReader
var OBDReader;

/**
 * Creates an instance of OBDReader.
 * @constructor
 * @param {string} address MAC-address of device that will be connected to.
 * @param {number} channel Channel that the serial port service runs on.
 * @this {OBDReader}
 */
OBDReader = function (address, channel) {

    EventEmitter.call(this);
    this.connected = false;
    this.receivedData = "";

    this.address = address;
    this.channel = channel;

    return this;
};
util.inherits(OBDReader, EventEmitter);

/**
 * Find a PID-value by name.
 * @param name Name of the PID you want the hexadecimal (in ASCII text) value of.
 * @return {string} PID in hexadecimal ASCII
 */
function getPIDByName(name) {
    var i;
    for (i = 0; i < PIDS.length; i++) {
        if (PIDS[i].name === name) {
            if (PIDS[i].pid !== undefined) {
                return (PIDS[i].mode + PIDS[i].pid);
            }
            //There are modes which don't require a extra parameter ID.
            return (PIDS[i].mode);
        }
    }
}
/**
 * Parses a hexadecimal string to a reply object. Uses PIDS. (obdInfo.js)
 * @param {string} hexString Hexadecimal value in string that is received over the serialport.
 * @return {Object} reply - The reply.
 * @return {string} reply.value - The value that is already converted. This can be a PID converted answer or "OK" or "NO DATA".
 * @return {string} reply.name - The name. --! Only if the reply is a PID.
 * @return {string} reply.mode - The mode of the PID. --! Only if the reply is a PID.
 * @return {string} reply.pid - The PID. --! Only if the reply is a PID.
 */
function parseOBDCommand(hexString) {
    var reply,
        byteNumber,
        valueArray; //New object

    reply = {};
    if (hexString === "NO DATA" || hexString === "OK" || hexString === "?") { //No data or OK is the response.
        reply.value = hexString;
        return reply;
    }

    hexString = hexString.replace(/ /g, ''); //Whitespace trimming //Probably not needed anymore?
    valueArray = [];

    for (byteNumber = 0; byteNumber < hexString.length; byteNumber += 2) {
        valueArray.push(hexString.substr(byteNumber, 2));
    }

    reply.mode = valueArray[0];
    reply.pid = valueArray[1];

    for (var i = 0; i < PIDS.length; i++) {
        if(PIDS[i].pid == reply.pid) {
            var numberOfBytes = PIDS[i].bytes;
            reply.name = PIDS[i].name;
            switch (numberOfBytes)
            {
                case 1:
                    reply.value = PIDS[i].convertToUseful(valueArray[2]);
                    break;
                case 2:
                    reply.value = PIDS[i].convertToUseful(valueArray[2], valueArray[3]);
                    break;
                case 4:
                    reply.value = PIDS[i].convertToUseful(valueArray[2], valueArray[3], valueArray[4], valueArray[5]);
                    break;
                case 8:
                    reply.value = PIDS[i].convertToUseful(valueArray[2], valueArray[3], valueArray[4], valueArray[5], valueArray[6], valueArray[7], valueArray[8], valueArray[9]);
                    break;
            }
            break; //Value is converted, break out the for loop.
        }
    }
    return reply;
}
/**
 * Connect/Open the bluetooth serial port and add events to bluetooth-serial-port.
 * Also starts the intervalWriter that is used to write the queue.
 * @this {OBDReader}
 */
OBDReader.prototype.connect = function () {
    var self = this; //Enclosure

    var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

    btSerial.connect(this.address, this.channel, function () {
        self.connected = true;

        //Turns off extra line feed and carriage return
        self.write('ATL0');
        //This disables spaces in in output, which is faster!
        self.write('ATS0');
        //Turns off headers and checksum to be sent.
        self.write('ATH0');
        //Turns off echo.
        self.write('ATE0');
        //Turn adaptive timing to 2. This is an aggressive learn curve for adjusting the timeout. Will make huge difference on slow systems.
        self.write('ATAT2');
        //Set timeout to 5 * 4 = 20msec, allows 50 queries per second. This is the maximum wait-time. ATAT will decide if it should wait shorter or not.
        self.write('ATST05');
        //Set the protocol to automatic.
        self.write('ATSP0');

        //Event connected
        self.emit('connected');

        btSerial.on('data', function (data) {
            var currentString, indexOfEnd, arrayOfCommands;
            currentString = self.receivedData + data.toString('utf8'); // making sure it's a utf8 string

            arrayOfCommands = currentString.split('>');

            var forString;
            if(arrayOfCommands.length < 2) {
                self.receivedData = arrayOfCommands[0];
            } else {
                for(var commandNumber = 0; commandNumber < arrayOfCommands.length; commandNumber++) {
                    forString = arrayOfCommands[commandNumber];
                    if(forString === '') {
                        continue;
                    }
                    indexOfEnd = forString.lastIndexOf('\r');

                    if (indexOfEnd > -1) {
                        var indexOfStart, reply;
                        forString = forString.substr(0, indexOfEnd); //Discard end
                        indexOfStart = forString.lastIndexOf('\r'); //Find start
                        forString = forString.substr(indexOfStart + 1, currentString.length); //Discard start
                        reply = parseOBDCommand(forString);
                        //Event dataReceived.
                        self.emit('dataReceived', reply);
                        self.receivedData = '';
                    } else {
                        console.log('Error in parsing.');
                    }
                }
            }
        });

        btSerial.on('failure', function(error) {
            console.log('Error with OBD-II device: ' + error);
        });

    }, function (err) { //Error callback!
        console.log('Error with OBD-II device: ' + err);
        //console.log(err);
    });

    this.btSerial = btSerial; //Save the connection in OBDReader object.

    this.intervalWriter = setInterval(function (){
        if(queue.length > 0 && self.connected)
            try {
                self.btSerial.write(queue.shift());
            } catch (err) {
                console.log('Error while writing: ' + err);
                console.log('OBD-II Listeners deactivated, connection is probably lost.');

                clearInterval(self.intervalWriter);
                self.removeAllPollers();
            }
    }, 50); //Updated with Adaptive Timing on ELM327. 20 queries a second seems good enough.

    return this;
};

/**
 * Disconnects/closes the port.
 * @this {OBDReader}
 */
OBDReader.prototype.disconnect = function () {
    this.btSerial.close();
    clearInterval(this.intervalWriter);
    queue.length = 0; //Clears queue
    this.connected = false;
};
/**
 * Writes a message to the port. (Queued!) All write functions call this function.
 * @this {OBDReader}
 * @param {string} message The PID or AT Command you want to send. Without \r or \n!
 */
OBDReader.prototype.write = function (message) {
    if (this.connected) {
        if(queue.length < 256) {
            queue.push(message + '\r');
        } else {
            console.log('Queue-overflow!');
        }
    } else {
        console.log('Bluetooth device is not connected.');
    }
};
/**
 * Writes a PID value by entering a pid supported name.
 * @this {OBDReader}
 * @param {string} name Look into obdInfo.js for all PIDS.
 */
OBDReader.prototype.requestValueByName = function (name) {
    this.write(getPIDByName(name));
};

var activePollers = [];
/**
 * Adds a poller to the poller-array.
 * @this {OBDReader}
 * @param {string} name Name of the poller you want to add.
 */
OBDReader.prototype.addPoller = function (name) {
    var stringToSend = getPIDByName(name);
    activePollers.push(stringToSend);
};
/**
 * Removes an poller.
 * @this {OBDReader}
 * @param {string} name Name of the poller you want to remove.
 */
OBDReader.prototype.removePoller = function (name) {
    var stringToDelete = getPIDByName(name);
    var index = activePollers.indexOf(stringToDelete);
    activePollers.splice(index, 1);
};
/**
 * Removes all pollers.
 * @this {OBDReader}
 */
OBDReader.prototype.removeAllPollers = function () {
    activePollers.length = 0; //This does not delete the array, it just clears every element.
};
/**
 * Writes all active pollers.
 * @this {OBDReader}
 */
OBDReader.prototype.writePollers = function () {
    var i;
    for (i = 0; i < activePollers.length; i++) {
        this.write(activePollers[i]);
    }
};

var pollerInterval;
/**
 * Starts polling. Lower interval than activePollers * 50 will probably give buffer overflows.
 * @this {OBDReader}
 * @param {number} interval Frequency how often all variables should be polled. (in ms). If no value is given, then for each activePoller 75ms will be added.
 */
OBDReader.prototype.startPolling = function (interval) {
    if(interval === undefined) {
        interval = activePollers.length * 75; //More than 50 so there is room for manual requests.
    }

    var self = this;
    pollerInterval = setInterval(function () {
        self.writePollers();
    }, interval);
};
/**
 * Stops polling.
 * @this {OBDReader}
 */
OBDReader.prototype.stopPolling = function () {
    clearInterval(pollerInterval);
};


var exports = module.exports = OBDReader;
