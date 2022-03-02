# query-udp-p 

## Installation

- make sure to have NodeJS 16 installed
- clone the repo
- run `npm install`

## Running

In the repo folder run `node index`

## Adjust servers list

See `list.json` file. Add/remove servers there.  
The second array item is a number of starting concurrent connections per host. The concurrent connections is adaptive.
The third value is just a label.

To use your own list while keeping the list.json unchanged set env variable pointing to your own list `URL_LIST=./list.json`
