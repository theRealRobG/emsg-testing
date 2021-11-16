const fs = require('fs');
const https = require('https');
const ISOBoxer = require('codem-isoboxer');
const argv = require('minimist')(process.argv.slice(2));

const filePath = argv.file;
const initUrl = argv.init;
const segmentUrl = argv.segment;
if ((filePath && initUrl) || (filePath && segmentUrl)) {
    throw Error('Cannot use both --file argument and --init or --segment arguments');
}
if (initUrl && !segmentUrl) {
    throw Error('Must pass --segment when using --init');
}
if (segmentUrl && !initUrl) {
    throw Error('Must pass --init when using --segment');
}
if (!filePath && !initUrl) {
    throw Error('No argument provided for segment (either use --file and local path, or --init and --segment for remote URLs)');
}

function getSegment(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {encoding: null}, (response) => {
            if (response.statusCode >= 300) {
                reject(Error(`Invalid status code: ${response.statusCode} - ${response.statusMessage}`));
                response.resume();
                return;
            }
            let data = [];
            let connectionError;
            response.on('data', (chunk) => {
                data.push(chunk);
            });
            response.on('error', (error) => {
                connectionError = error;
            });
            response.on('close', () => {
                if (connectionError) {
                    reject(connectionError);
                } else {
                    resolve(Buffer.concat(data));
                }
            });
        });
    });
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

if (filePath) {
    const arrayBuffer = new Uint8Array(fs.readFileSync(filePath)).buffer;
    logBoxesFromArrayBuffer(arrayBuffer);
} else {
    const initPromise = getSegment(initUrl);
    const segmentPromise = getSegment(segmentUrl);
    Promise.all([initPromise, segmentPromise]).then(([initData, segmentData]) => {
        const completeData = Buffer.concat([initData, segmentData]);
        logBoxesFromArrayBuffer(completeData.buffer);
    }).catch((error) => {
        throw error;
    });
}
