const fs = require('fs');
const ISOBoxer = require('codem-isoboxer');
const argv = require('minimist')(process.argv.slice(2));

const filePath = argv.file;
if (!filePath) {
    throw Error('No file argument provided (provide relative path using --file argument).');
}

function logBoxesFromArrayBuffer(arrayBuffer) {
    const parsedFile  = ISOBoxer.parseBuffer(arrayBuffer);
    const emsgBoxes = parsedFile.boxes.filter((box) => box.type == 'emsg');

    if (emsgBoxes.length == 0) {
        console.warn('No emsg box present in segment.');
    } else {
        emsgBoxes.forEach((emsgBox) => {
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
        });
    }
}

const arrayBuffer = new Uint8Array(fs.readFileSync(filePath)).buffer;
logBoxesFromArrayBuffer(arrayBuffer);
