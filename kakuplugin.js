// joystickExtension.js
// Shane M. Clements, November 2013
// Joystick Scratch Extension
// http://scratchx.org/?url=http://localhost/joystickExtension.js#scratch
// This is an extension for development and testing of the Scratch Javascript Extension API.

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
			input = device.read(1,console.log);
        }, 100);

       setInterval(function() { console.log(input); }, 100);
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
       var byte2 = (val === 'on')

       message = ArrayBuffer(3);

       messageView = Uint8Array(message);

       messageView[0] = byte0;
       messageView[1] = byte1;
       messageView[2] = byte2;
       console.log(messageView);
       device.send(message);

    }

    var descriptor = {
        blocks: [
            ['w', 'Turn switch %n %m.state', 'setState', 1,'on']
        ],
        menus: {
            state: ['on', 'off']
        }
    };
    ScratchExtensions.register('KaKu', descriptor, ext, {type: 'hid', vendor:0x16c0, product:0x05df});
})();