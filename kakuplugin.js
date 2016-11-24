// joystickExtension.js
// Shane M. Clements, November 2013
// Joystick Scratch Extension
// http://scratchx.org/?url=http://localhost/joystickExtension.js#scratch
// This is an extension for development and testing of the Scratch Javascript Extension API.
/*
function getCode (){ 
function ActionTransmitterGetTelegram(systemCode, device, on) {
    trits = new Uint8Array(12);

    device-=65;

    for (unsigned short i=0; i<5; i++) {
        // Trits 0-4 contain address (2^5=32 addresses)
        trits[i]=(systemCode & 1)?1:2;
        systemCode>>=1;

        // Trits 5-9 contain device. Only one trit has value 0, others have 2 (float)!
        trits[i+5]=(i==device?0:2);
    }

    // Switch on or off
    trits[10]=(!on?0:2);
    trits[11]=(on?0:2);

    return encodeTelegram(trits);
}


function  BlokkerTransmitterGetTelegram(unsigned short device, boolean on) {
    trits = new Uint8Array(12);

    device--;

    for (unsigned short i=1; i<4; i++) {
        // Trits 1-3 contain device
        trits[i]=(device & 1)?0:1;
        device>>=1;
    }

    // Switch on or off
    trits[8]=(on?1:0);

    return encodeTelegram(trits);
}

function KaKuTransmitterGetTelegram(address, device, on) {
    unsigned short trits[12];

    address-=65;
    device-=1;

    for (unsigned short i=0; i<4; i++) {
        // Trits 0-3 contain address (2^4 = 16 addresses)
        trits[i]=(address & 1)?2:0;
        address>>=1;

        // Trits 4-8 contain device (2^4 = 16 addresses)
        trits[i+4]=(device & 1)?2:0;
        device>>=1;
    }

    // Trits 8-10 seem to be fixed
    trits[8]=0;
    trits[9]=2;
    trits[10]=2;

    // Switch on or off
    trits[11]=(on?2:0);

    return encodeTelegram(trits);
}

function KaKuTransmitterGetTelegram(char address, unsigned short group, unsigned short device, boolean on) {
    unsigned short trits[12], i;

    address-=65;
    group-=1;
    device-=1;

    // Address. M3E Pin A0-A3
    for (i=0; i<4; i++) {
        // Trits 0-3 contain address (2^4 = 16 addresses)
        trits[i]=(address & 1)?2:0;
        address>>=1;
    }

    // Device. M3E Pin A4-A5
    for (; i<6; i++) {
        trits[i]=(device & 1)?2:0;
        device>>=1;
    }

    // Group. M3E Pin A6-A7
    for (; i<8; i++) {
        trits[i]=(group & 1)?2:0;
        group>>=1;
    }

    // Trits 8-10 are be fixed. M3E Pin A8/D0-A10/D2
    trits[8]=0;
    trits[9]=2;
    trits[10]=2;

    // Switch on or off, M3E Pin A11/D3
    trits[11]=(on?2:0);

    return encodeTelegram(trits);
}

function ElroTransmitterGetTelegram(unsigned short systemCode, char device, boolean on) {
    unsigned short trits[12];

    device-=65;

    for (unsigned short i=0; i<5; i++) {
        //trits 0-4 contain address (2^5=32 addresses)
        trits[i]=(systemCode & 1)?0:2;
        systemCode>>=1;

        //trits 5-9 contain device. Only one trit has value 0, others have 2 (float)!
        trits[i+5]=(i==device?0:2);
    }

    //switch on or off
    trits[10]=(on?0:2);
    trits[11]=(!on?0:2);

    return encodeTelegram(trits);
}

function encodeTelegram(trits) {
    unsigned long data = 0;

    // Encode data
    for (unsigned short i=0;i<12;i++) {
        data*=3;
        data+=trits[i];
    }

    // Encode period duration
    data |= (unsigned long)_periodusec << 23;

    // Encode repeats
    data |= (unsigned long)_repeats << 20;

    return data;
}

}
*/

new (function() {
    var device = null;
    var input = null;
    var poller = null;
    var ext = this;

    ext._deviceConnected = function(dev) {
        if(device) return;

        device = dev;
        device.open();
		var uint8 = new Uint8Array(2);
		/*uint8[0] = 42;
		uint8[1] = 88;
		device.write(uint8)*/
        poller = setInterval(function() {
			input = device.read(1,function (test){
                var test = Uint8Array(input);
                console.log(test);
            });
        }, 100);

       setInterval(function() { 
        var test = Uint8Array(input);
        console.log(test); }, 100);
    };

    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        device = null;
        stopPolling();
    };

    function stopPolling() {
        if(poller) clearInterval(poller);
        poller = null;
    }

    ext._shutdown = function() {
        if(poller) clearInterval(poller);
        poller = null;

        if(device) device.close();
        device = null;
    }

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'Controller disconnected'};
        return {status: 2, msg: 'Controller connected'};
    }

    // Converts a byte into a value of the range -1 -> 1 with two decimal places of precision
    function convertByteStr(byte) { return (parseInt(byte, 16) - 128) / 128; }
    ext.setState = function(name,val) {
       //Send a check byte ()
       var byte0 = 101
       //Send a name of the adressed device (in this case a number)
       var byte1 = name;
       //Send the value to send to the device (a boolean)
       var byte2 = 65 + (val === 'on')

       message = ArrayBuffer(1);

       messageView = Uint8Array(message);

       /*messageView[0] = byte0;
       messageView[1] = byte1;*/
       messageView[0] = byte2;
       console.log(messageView);
       device.send(message);

    }

    var descriptor = {
        blocks: [
            ['w', 'Turn %m.type switch %n %m.state', 'setState', 'KaKu' , 1,'on']
        ],
        menus: {
            state: ['on', 'off'],
            type: ['KaKu','Action','Blokker','Elro']
        }
    };
    ScratchExtensions.register('KaKu', descriptor, ext, {type: 'hid', vendor:0x16c0, product:0x05df});
})();