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
function bitDecoder(byte) {
    return parseInt(byte, 2);
}
function convertLoad(byte) {
    return parseInt(byte, 16) * (100 / 256);
}
function convertTemp(byte) {
    return parseInt(byte, 16) - 40;
}
function convertFuelTrim(byte) {
    return (parseInt(byte, 16) - 128) * (100 / 128);
}
function convertFuelRailPressure(byte) {
    return parseInt(byte, 16) * 3;
}
function convertIntakePressure(byte) {
    return parseInt(byte, 16);
}
function convertRPM(byteA, byteB) {
    return ((parseInt(byteA, 16) * 256) + parseInt(byteB, 16)) / 4;
}
function convertSpeed(byte) {
    return parseInt(byte, 16);
}
function convertSparkAdvance(byte) {
    return (parseInt(byte, 16) / 2) - 64;
}
function convertAirFlowRate(byteA, byteB) {
    return (parseInt(byteA, 16) * 256.0) + (parseInt(byteB, 16) / 100);
}
function convertThrottlePos(byte) {
    return parseInt(byte, 16) * (100 / 255);
}

function convertOxygenSensorOutput(byte) {
    return parseInt(byte, 16) * 0.005;
}

//DTC
function notSupported() {
   console.log("There is no answer. This should not be happening.");
   return;
}
//VIN
function convertVIN(byte) {
    return byte;
}

var responsePIDS;
var modeRealTime = "01";
var modeRequestDTC = "03";
var modeClearDTC = "04";
var modeVin = "09";

responsePIDS = [
    //Realtime data
    {mode: modeRealTime, pid: "00", bytes: 4, name: "pidsupp0",     description: "PIDs supported 00-20", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "01", bytes: 4, name: "dtc_cnt",      description: "Monitor status since DTCs cleared", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "02", bytes: 4, name: "dtcfrzf",      description: "DTC that caused required freeze frame data storage", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "03", bytes: 8, name: "fuelsys",      description: "Fuel system 1 and 2 status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "04", bytes: 2, name: "load_pct",     description: "Calculated LOAD Value", min: 0, max: 100, unit: "%", convertToUseful: convertLoad},
    {mode: modeRealTime, pid: "05", bytes: 1, name: "temp",         description: "Engine Coolant Temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: convertTemp},
    {mode: modeRealTime, pid: "06", bytes: 1, name: "shrtft13",     description: "Short Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "07", bytes: 1, name: "longft13",     description: "Long Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "08", bytes: 1, name: "shrtft24",     description: "Short Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "09", bytes: 1, name: "longft24",     description: "Long Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "0A", bytes: 1, name: "frp",          description: "Fuel Rail Pressure (gauge)", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelRailPressure},
    {mode: modeRealTime, pid: "0B", bytes: 1, name: "map",          description: "Intake Manifold Absolute Pressure", min: 0, max: 765, unit: "kPa", convertToUseful: convertIntakePressure},
    {mode: modeRealTime, pid: "0C", bytes: 2, name: "rpm",          description: "Engine RPM", min: 0, max: 16383.75, unit: "rev/min", convertToUseful: convertRPM},
    {mode: modeRealTime, pid: "0D", bytes: 1, name: "vss",          description: "Vehicle Speed Sensor", min: 0, max: 255, unit: "km/h", convertToUseful: convertSpeed},
    {mode: modeRealTime, pid: "0E", bytes: 1, name: "sparkadv",     description: "Ignition Timing Advance for #1 Cylinder", min: -64, max: 63.5, unit: "degrees relative to #1 cylinder",  convertToUseful: convertSparkAdvance},
    {mode: modeRealTime, pid: "0F", bytes: 1, name: "iat",          description: "Intake Air Temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: convertTemp},
    {mode: modeRealTime, pid: "10", bytes: 2, name: "maf",          description: "Air Flow Rate from Mass Air Flow Sensor", min: 0, max: 655.35, unit: "g/s", convertToUseful: convertAirFlowRate},
    {mode: modeRealTime, pid: "11", bytes: 1, name: "throttlepos",  description: "Absolute Throttle Position", min: 1, max: 100, unit: "%", convertToUseful: convertThrottlePos},
    {mode: modeRealTime, pid: "12", bytes: 1, name: "air_stat",     description: "Commanded Secondary Air Status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "13", bytes: 1, name: "o2sloc",       description: "Location of Oxygen Sensors", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "14", bytes: 2, name: "o2s11",        description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "15", bytes: 2, name: "o2s12",        description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "16", bytes: 2, name: "o2s13",        description: "Bank 1 - Sensor 3/Bank 2 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "17", bytes: 2, name: "o2s14",        description: "Bank 1 - Sensor 4/Bank 2 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "18", bytes: 2, name: "o2s21",        description: "Bank 2 - Sensor 1/Bank 3 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "19", bytes: 2, name: "o2s22",        description: "Bank 2 - Sensor 2/Bank 3 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "1A", bytes: 2, name: "o2s23",        description: "Bank 2 - Sensor 3/Bank 4 - Sensor 1 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "1B", bytes: 2, name: "o2s24",        description: "Bank 2 - Sensor 4/Bank 4 - Sensor 2 Oxygen Sensor Output Voltage / Short Term Fuel Trim", min: 0, max: 1.275, unit: "V", convertToUseful: convertOxygenSensorOutput},
    {mode: modeRealTime, pid: "1C", bytes: 1, name: "obdsup",       description: "OBD requirements to which vehicle is designed", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "1D", bytes: 1, name: "o2sloc2",      description: "Location of oxygen sensors", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "1E", bytes: 1, name: "pto_stat",     description: "Auxiliary Input Status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "1F", bytes: 2, name: "runtm",        description: "Time Since Engine Start", min: 0, max: 65535, unit: "seconds", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "20", bytes: 4, name: "piddsupp2",    description: "PIDs supported 21-40", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "21", bytes: 4, name: "mil_dist",     description: "Distance Travelled While MIL is Activated", min: 0, max: 65535, unit: "km", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "22", bytes: 2, name: "frpm",         description: "Fuel Rail Pressure relative to manifold vacuum", min: 0, max: 5177.265, unit: "kPa", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "23", bytes: 2, name: "frpd",         description: "Fuel Rail Pressure (diesel)", min: 0, max: 655350, unit: "kPa", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "24", bytes: 4, name: "lambda11",     description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "25", bytes: 4, name: "lambda12",     description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "26", bytes: 4, name: "lambda13",     description: "Bank 1 - Sensor 3 /Bank 2 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "27", bytes: 4, name: "lambda14",     description: "Bank 1 - Sensor 4 /Bank 2 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "28", bytes: 4, name: "lambda21",     description: "Bank 2 - Sensor 1 /Bank 3 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "29", bytes: 4, name: "lambda22",     description: "Bank 2 - Sensor 2 /Bank 3 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "2A", bytes: 4, name: "lambda23",     description: "Bank 2 - Sensor 3 /Bank 4 - Sensor 1(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "2B", bytes: 4, name: "lambda24",     description: "Bank 2 - Sensor 4 /Bank 4 - Sensor 2(wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Voltage", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "2C", bytes: 1, name: "egr_pct",      description: "Commanded EGR", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "2D", bytes: 1, name: "egr_err",      description: "EGR Error", min: -100, max: 99.22, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "2E", bytes: 1, name: "evap_pct",     description: "Commanded Evaporative Purge", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "2F", bytes: 1, name: "fli",          description: "Fuel Level Input", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "30", bytes: 1, name: "warm_ups",     description: "Number of warm-ups since diagnostic trouble codes cleared", min: 0, max: 255, unit: "", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "31", bytes: 2, name: "clr_dist",     description: "Distance since diagnostic trouble codes cleared", min: 0, max: 65535, unit: "km", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "32", bytes: 2, name: "evap_vp",      description: "Evap System Vapour Pressure", min: -8192, max: 8192, unit: "Pa", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "33", bytes: 1, name: "baro",         description: "Barometric Pressure", min: 0, max: 255, unit: "kPa", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "34", bytes: 4, name: "lambdac11",    description: "Bank 1 - Sensor 1/Bank 1 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "35", bytes: 4, name: "lambdac12",    description: "Bank 1 - Sensor 2/Bank 1 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "36", bytes: 4, name: "lambdac13",    description: "Bank 1 - Sensor 3/Bank 2 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "37", bytes: 4, name: "lambdac14",    description: "Bank 1 - Sensor 4/Bank 2 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "38", bytes: 4, name: "lambdac21",    description: "Bank 2 - Sensor 1/Bank 3 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "39", bytes: 4, name: "lambdac22",    description: "Bank 2 - Sensor 2/Bank 3 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "3A", bytes: 4, name: "lambdac23",    description: "Bank 2 - Sensor 3/Bank 4 - Sensor 1 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "3B", bytes: 4, name: "lambdac24",    description: "Bank 2 - Sensor 4/Bank 4 - Sensor 2 (wide range O2S) Oxygen Sensors Equivalence Ratio (lambda) / Current", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "3C", bytes: 2, name: "catemp11",     description: "Catalyst Temperature Bank 1 /  Sensor 1", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "3D", bytes: 2, name: "catemp21",     description: "Catalyst Temperature Bank 2 /  Sensor 1", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "3E", bytes: 2, name: "catemp12",     description: "Catalyst Temperature Bank 1 /  Sensor 2", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "3F", bytes: 2, name: "catemp22",     description: "Catalyst Temperature Bank 2 /  Sensor 2", min: -40, max: 6513.5, unit: "Celsius", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "40", bytes: 4, name: "piddsupp4",    description: "PIDs supported 41-60", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "41", bytes: 4, name: "monitorstat",  description: "Monitor status this driving cycle", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "42", bytes: 2, name: "vpwr",         description: "Control module voltage", min: 0, max: 65535, unit: "V", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "43", bytes: 2, name: "load_abs",     description: "Absolute Load Value", min: 0, max: 25700, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "44", bytes: 2, name: "lambda",       description: "Fuel/air Commanded Equivalence Ratio", min: 0, max: 2, unit: "(ratio)", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "45", bytes: 1, name: "tp_r",         description: "Relative Throttle Position", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "46", bytes: 1, name: "aat",          description: "Ambient air temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "47", bytes: 1, name: "tp_b",         description: "Absolute Throttle Position B", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "48", bytes: 1, name: "tp_c",         description: "Absolute Throttle Position C", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "49", bytes: 1, name: "app_d",        description: "Accelerator Pedal Position D", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "4A", bytes: 1, name: "app_e",        description: "Accelerator Pedal Position E", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "4B", bytes: 1, name: "app_f",        description: "Accelerator Pedal Position F", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "4C", bytes: 1, name: "tac_pct",      description: "Commanded Throttle Actuator Control", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "4D", bytes: 2, name: "mil_time",     description: "Time run by the engine while MIL activated", min: 0, max: 65525, unit: "minutes", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "4E", bytes: 2, name: "clr_time",     description: "Time since diagnostic trouble codes cleared", min: 0, max: 65535, unit: "minutes", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "4F", bytes: 4, name: "exttest1",     description: "External Test Equipment Configuration #1", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "50", bytes: 4, name: "exttest2",     description: "External Test Equipment Configuration #2", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "51", bytes: 2, name: "fuel_type",    description: "Fuel Type", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "52", bytes: 2, name: "alch_pct",     description: "Ethanol fuel %", min: 0, max: 100, unit: "%", convertToUseful: bitDecoder},

    //DTC's
    {mode: modeRequestDTC, pid: undefined, bytes: 6, name: "requestdtc", description: "Requested DTC", convertToUseful: notSupported}, //n*6 --> For each code, 6 bytes.

    {mode: modeClearDTC, pid: undefined, bytes: 0, name: "cleardtc", description: "Clear Trouble Codes (Clear engine light)", convertToUseful: notSupported},

    //VIN
    {mode: modeVin, pid: "00", bytes: 4, name: "vinsupp0", description: "Vehicle Identification Number", convertToUseful: bitDecoder},
    {mode: modeVin, pid: "01", bytes: 1, name: "vin", description: "Vehicle Identification Number", convertToUseful: convertVIN},
    {mode: modeVin, pid: "02", bytes: 1, name: "vin", description: "Vehicle Identification Number", convertToUseful: convertVIN}
];

var exports = module.exports = responsePIDS;