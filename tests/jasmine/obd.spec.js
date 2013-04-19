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
 *
 * This code should be ran with jasmine-node.
 ******************************************************************************/

describe("node-serial-obd", function () {
    'use strict';
    var OBDReader, btOBDReader, dataReceivedMarker;
    OBDReader = require('../../lib/obd.js');
    btOBDReader = new OBDReader('D8:0D:E3:80:19:B4', 14);
    dataReceivedMarker = {}; //New object

    btOBDReader.on('dataReceived', function (data) {
        console.log(data);
        dataReceivedMarker = data;
    });

    it("should be defined", function () {
        expect(btOBDReader).toBeDefined();
    });

    it("has the necessary init properties as btOBDReader object", function () {
        //Functions
        expect(btOBDReader.connect).toEqual(jasmine.any(Function));
        expect(btOBDReader.disconnect).toEqual(jasmine.any(Function));
        expect(btOBDReader.write).toEqual(jasmine.any(Function));
        expect(btOBDReader.on).toEqual(jasmine.any(Function)); //Has events
        //TODO: check different events
        //Vars
        expect(btOBDReader.connected).toEqual(false);
    });

    it("can connect to a bluetooth serial port", function () {
        btOBDReader.connect();
        waitsFor(function () {
            return btOBDReader.connected;
        }, "It took too long to connect.", 20000);
        runs(function () {
            expect(btOBDReader.connected).toEqual(true);
        });
        waits(2000); //Waiting for init strings to be sent and received!

    });

    describe("the write function", function () {
        it("can write ascii to the obd-module", function () {
            dataReceivedMarker = false;
            btOBDReader.write('010D'); //010D stands for speed
        });

        it("can receive and convert the RPM-hex value to something right", function () {
            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 4000);
            runs(function () {
                expect(dataReceivedMarker).toEqual(jasmine.any(Object));
                expect(dataReceivedMarker.mode).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.pid).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.name).toEqual(jasmine.any(String));
                expect(!isNaN(dataReceivedMarker.value));//Number somehow crashes.
            });


        });

        it("can retrieve a value by name", function () {
            dataReceivedMarker = false;
            btOBDReader.requestValueByName("vss"); //vss = vehicle speed sensor

            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 4000);
            runs(function() {
                expect(dataReceivedMarker).toEqual(jasmine.any(Object));
                expect(dataReceivedMarker.mode).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.pid).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.name).toEqual("vss");
                expect(!isNaN(dataReceivedMarker.value));//Number somehow crashes.
            });

        });
    });

    describe("pollers", function () {
        it("are defined", function () {
            //expect(btOBDReader.activePollers).toBeDefined(); //Not visible outside class.
            expect(btOBDReader.addPoller).toBeDefined();
            expect(btOBDReader.removePoller).toBeDefined();
            expect(btOBDReader.removeAllPollers).toBeDefined();
            expect(btOBDReader.startPolling).toBeDefined();
            expect(btOBDReader.stopPolling).toBeDefined();
        });
        it("can be added", function () {
            dataReceivedMarker = false;
            btOBDReader.addPoller("vss");
            btOBDReader.startPolling(1000);
            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 12000);
            runs(function () {
                expect(dataReceivedMarker).toEqual(jasmine.any(Object));
                expect(dataReceivedMarker.mode).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.pid).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.name).toEqual("vss");
                expect(!isNaN(dataReceivedMarker.value));//Number somehow crashes.

                dataReceivedMarker = false;
            });

            //Wait second time without calling anything since last data reset. --> If data comes in, polling works.
            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 12000); //Time for polling.
            runs(function () {
                expect(dataReceivedMarker).toEqual(jasmine.any(Object));
                expect(dataReceivedMarker.mode).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.pid).toEqual(jasmine.any(String));
                expect(dataReceivedMarker.name).toEqual("vss");
                expect(!isNaN(dataReceivedMarker.value));
            });
        });
        it("can be removed", function () {
            runs(function () {
                btOBDReader.removePoller("vss");
                btOBDReader.stopPolling();
                waits(100);
                dataReceivedMarker = false;
                //Now, no data should come in.
            });

            waits(5000);

            runs(function () {
                expect(dataReceivedMarker).toEqual(false);
            });

        });
    });

    describe("DTC", function () { //Diagnostic trouble code
        it("can be read", function () {
            dataReceivedMarker = false;
            btOBDReader.requestValueByName("requestdtc");
            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 4000);
            runs(function () {
                expect(dataReceivedMarker.value).toEqual(jasmine.any(String));
                dataReceivedMarker = false;
            });
        });
        it("can be cleared", function () {
            dataReceivedMarker = false;
            btOBDReader.requestValueByName("cleardtc");
            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 4000);
            runs(function () {
                expect(dataReceivedMarker.value).toEqual(jasmine.any(String));
                dataReceivedMarker = false;
            });
        });
    });

/*  //Not supported with OBDsim.
    describe("can read the VIN", function() { //Vehicle Identification number
        it("can be sent", function(){
            dataReceivedMarker = false;
            btOBDReader.requestValueByName("vin");
            waitsFor(function () {
                return dataReceivedMarker;
            }, "Receiving time expired", 4000);
            runs(function() {
                expect(dataReceivedMarker).toEqual(jasmine.any(String));
                dataReceivedMarker = false;
            });
        });
    });*/



    it("can close the bluetooth serial port", function () {
        btOBDReader.disconnect();
        waitsFor(function () {
            return !(btOBDReader.connected);
        }, "Disconnect time expired", 2500); //Time for disconnect.
        runs(function () {
            expect(btOBDReader.connected).toEqual(false);
            btOBDReader = undefined;
        });

    });

});