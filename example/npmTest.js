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

var OBDReader = require('../lib/obd.js');
var btOBDReader = new OBDReader();
var dataReceivedMarker = {};

btOBDReader.on('dataReceived', function (data) {
    var currentDate = new Date();
    console.log(currentDate.getTime());
    console.log(data);
    dataReceivedMarker = data;
});

btOBDReader.on('connected', function () {
    this.requestValueByName("rpm"); //vss
    this.addPoller("vss");
    this.addPoller("rpm");
    this.addPoller("temp");
    this.addPoller("load_pct");
    this.addPoller("map");
    this.addPoller("frp");

    this.startPolling(500);
    //this.write('0101', 1);
});

btOBDReader.on('error', function (data) {
  console.log('Error: ' + data);
});

btOBDReader.on('debug', function (data) {
  console.log('Debug: ' + data);
});

// Use first device with 'obd' in the name
btOBDReader.autoconnect('obd');
