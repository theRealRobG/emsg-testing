const fs = require('fs');
const ISOBoxer = require('codem-isoboxer');
const argv = require('minimist')(process.argv.slice(2));

const filePath = argv.file;
if (!filePath) {
    throw Error('No file argument provided (provide relative path using --file argument).');
}

const arrayBuffer = new Uint8Array(fs.readFileSync(filePath)).buffer;
const parsedFile  = ISOBoxer.parseBuffer(arrayBuffer);
const emsgBox = parsedFile.boxes.find((box) => box.type == 'emsg');

if (emsgBox) {
    const unwrap = ({
        size,
        type,
        version,
        flags,
        scheme_id_uri,
        value,
        timescale,
        presentation_time,
        presentation_time_delta,
        event_duration,
        id,
        message_data
    }) => ({
        size,
        type,
        version,
        flags,
        scheme_id_uri,
        value,
        timescale,
        presentation_time,
        presentation_time_delta,
        event_duration,
        id,
        message_data: (new TextDecoder()).decode(message_data)
    });
    console.log(unwrap(emsgBox));
} else {
    console.warn('No emsg box present in segment.');
}
