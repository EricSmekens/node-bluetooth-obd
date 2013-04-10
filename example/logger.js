/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 TNO
 * Author - Eric Smekens
 ******************************************************************************/


var OBDReader = require('../lib/obd.js');
var options = {};
options.baudrate = 115200;
var serialOBDReader = new OBDReader("/dev/rfcomm0", options);
var dataReceivedMarker = {};

serialOBDReader.on('dataReceived', function (data) {
    var currentDate = new Date();
    console.log(currentDate.toLocaleTimeString());
    console.log(data);
    dataReceivedMarker = data;
});

serialOBDReader.on('connected', function (data) {
    //Custom Poller
    var self = this;
    var intervalSpeed = setInterval(function () {
        self.write('010D\r');
    }, 100);

    var intervalRPM = setInterval(function () {
        self.write('010C\r');
    }, 100);

    var intervalTemp = setInterval(function () {
        self.write('0105\r');
    }, 100);

    var intervalIntake = setInterval(function () {
        self.write('010B\r');
    }, 100);

    var intervalLoad = setInterval(function () {
        self.write('0104\r');
    }, 100);
});


serialOBDReader.connect();


