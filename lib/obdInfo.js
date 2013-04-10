//Converter functions hexadecimal --> value in PID.
function bitDecoder(byte){
    return parseInt(byte, 2);
}
function convertLoad(byte){
    return parseInt(byte, 16) * (100/256);
}
function convertTemp(byte){
    return parseInt(byte, 16) -40;
}
function convertFuelTrim(byte){
    return (parseInt(byte, 2) - 128) * (100/128);
}
function convertFuelRailPressure(byte){
    return parseInt(byte, 16) * 3;
}
function convertIntakePressure(byte){
    return parseInt(byte, 16);
}
function convertRPM(byteA, byteB){
    return ((parseInt(byteA, 16) * 256 ) + parseInt(byteB, 16)) / 4;
}
function convertSpeed(byte){
    return parseInt(byte, 16);
}
//DTC
function notSupported()
{
   console.log("There is no answer. This should not be happening.");
   return;
}
//VIN
function convertVIN(byte){
    return byte;
}

var responsePIDS;
const modeRealTime = "01";
const modeRequestDTC = "03";
const modeClearDTC = "04";
const modeVin = "09";

responsePIDS = [
    //Realtime data
    {mode: modeRealTime, pid: "00", bytes: 4, name: "pidsupp0", description: "PIDs supported 00-20", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "01", bytes: 4, name: "dtc_cnt", description: "Monitor status since DTCs cleared", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "02", bytes: 4, name: "dtcfrzf", description: "DTC that caused required freeze frame data storage", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "03", bytes: 8, name: "fuelsys", description: "Fuel system 1 and 2 status", min: 0, max: 0, unit: "Bit Encoded", convertToUseful: bitDecoder},
    {mode: modeRealTime, pid: "04", bytes: 2, name: "load_pct", description: "Calculated LOAD Value", min: 0, max: 100, unit: "%", convertToUseful: convertLoad},
    {mode: modeRealTime, pid: "05", bytes: 1, name: "temp", description: "Engine Coolant Temperature", min: -40, max: 215, unit: "Celsius", convertToUseful: convertTemp},
    {mode: modeRealTime, pid: "06", bytes: 1, name: "shrtft13", description: "Short Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "07", bytes: 1, name: "longft13", description: "Long Term Fuel Trim - Bank 1,3", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "08", bytes: 1, name: "shrtft24", description: "Short Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "09", bytes: 1, name: "longft24", description: "Long Term Fuel Trim - Bank 2,4", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelTrim},
    {mode: modeRealTime, pid: "0A", bytes: 1, name: "frp", description: "Fuel Rail Pressure (gauge)", min: -100, max: 99.22, unit: "%", convertToUseful: convertFuelRailPressure},
    {mode: modeRealTime, pid: "0B", bytes: 1, name: "map", description: "Intake Manifold Absolute Pressure", min: 0, max: 765, unit: "kPa", convertToUseful: convertIntakePressure},
    {mode: modeRealTime, pid: "0C", bytes: 2, name: "rpm", description: "Engine RPM", min: 0, max: 16383.75, unit: "rev/min", convertToUseful: convertRPM},
    {mode: modeRealTime, pid: "0D", bytes: 1, name: "vss", description: "Vehicle Speed Sensor", min: 0, max: 255, unit: "km/h", convertToUseful: convertSpeed},

    //DTC's
    {mode: modeRequestDTC, pid: undefined, bytes: 6, name: "requestdtc", description: "Requested DTC", convertToUseful: notSupported}, //n*6 --> For each code, 6 bytes.

    {mode: modeClearDTC, pid: undefined, bytes: 0, name: "cleardtc", description: "Clear Trouble Codes (Clear engine light)", convertToUseful: notSupported},

    //VIN
    {mode: modeVin, pid: "00", bytes: 4, name: "vinsupp0", description: "Vehicle Identification Number", convertToUseful: bitDecoder},
    {mode: modeVin, pid: "01", bytes: 1, name: "vin", description: "Vehicle Identification Number", convertToUseful: convertVIN},
    {mode: modeVin, pid: "02", bytes: 1, name: "vin", description: "Vehicle Identification Number", convertToUseful: convertVIN}
    //TODO: Expand the list.
];

var exports = module.exports = responsePIDS;