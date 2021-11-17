# emsg-testing
A simple command line tool for reading emsg boxes in MP4.

Available commands:
```
--help                  Show this help description.

--file <local_path>     Specify a local file URL for an MP4 file. This cannot be used
                        in conjunction with --init and --segment.

--init <remote_url>     Specify a remote URL for a CMAF init segment. When specifying
                        --init then --segment must also be specified. This cannot be
                        used in conjunction with --file.

--segment <remote_url>  Specify a remote URL for a CMAF segment. When specifying
                        --segment then --init must also be specified. This cannot be
                        used in conjunction with --file.
```

### Examples
#### Using --init and --segment
Command:
```console
% node index.js \
--init "https://demo.unified-streaming.com/k8s/live/scte35.isml/hls/scte35-video=500000.m4s" \
--segment "https://demo.unified-streaming.com/k8s/live/scte35.isml/hls/scte35-video=500000-852663392.m4s"
```
Example result:
```js
{
  size: 90,
  type: 'emsg',
  version: 0,
  flags: 0,
  scheme_id_uri: 'urn:scte:scte35:2013:bin',
  value: '',
  timescale: 600,
  presentation_time: undefined,
  presentation_time_delta: 576,
  event_duration: 11520,
  id: 38738,
  message_data: '�0!\x00\x00\x00\x00\x00\x00\x00��\x10\x05\x00\x00�R\x7F�\x7F�\x00\x1A^\x00�\x00\x00\x00\x00\x00�a$\x02'
}
```

#### Using --file
When using `--file` approach you will need to have a local MP4 file. This can be done by downloading both an init file
and a segment and concatenating them together, as exampled:
```console
% curl "https://test.cdn.com/some/path/init.mp4" --output init.mp4
% curl "https://test.cdn.com/some/path/segment-954.mp4 --output segment-954.mp4
% cat init.mp4 segment-954.mp4 > complete-954.mp4
```
Then the following command:
```console
% node index.js --file downloaded-examples/complete-954.mp4 
```
Example result:
```js
{
  size: 832,
  type: 'emsg',
  version: 1,
  flags: 0,
  scheme_id_uri: 'https://aomedia.org/emsg/ID3',
  value: 'urn:com:sle:inbandmetadata:2017',
  timescale: 10000000,
  presentation_time: 73586151450,
  presentation_time_delta: undefined,
  event_duration: 0,
  id: 578215968,
  message_data: 'ID3\x04\x00\x00\x00\x00\x05YTXXX\x00\x00\x05O\x00\x00\x03Track:sle,Lang:eng\x00<?xml version="1.0" encoding="utf-8" ?>\r\n' +
    '<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:tts="http://www.w3.org/ns/ttml#styling" xmlns:smpte="http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt" xml:lang="en">\r\n' +
    '\t<head>\r\n' +
    '\t\t<styling />\r\n' +
    '\t\t<layout xmlns:tts="http://www.w3.org/2006/10/ttaf1#styling">\r\n' +
    '\t\t\t<region xml:id="speaker">\r\n' +
    '\t\t\t\t<style tts:extent="100% 95%" />\r\n' +
    '\t\t\t\t<style tts:backgroundColor="rgba(0, 0, 0, 0)" />\r\n' +
    '\t\t\t\t<style tts:color="white" />\r\n' +
    '\t\t\t\t<style tts:displayAlign="after" />\r\n' +
    '\t\t\t\t<style tts:padding="0% 10%" />\r\n' +
    '\t\t\t\t<style tts:fontSize="4%" />\r\n' +
    '\t\t\t\t<style tts:textAlign="center" />\r\n' +
    '\t\t\t</region>\r\n' +
    '\t\t</layout>\r\n' +
    '\t</head>\r\n' +
    '\t<body />\r\n' +
    '</tt>\r\n'
}
```
