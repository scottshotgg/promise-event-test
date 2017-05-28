var MongoClient = require('mongodb').MongoClient;


(function connectMongoDB() {
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/test", function(err, mdb) {
	if(!err) {
		mainEventLoop.emit('connected', { mdb: mdb });

    } else {
      console.log(err);
      process.exit(1);
    }
  });
})();


// Using the event-loop for the software architecture
const EventEmitter = require('events');
class EventLoop extends EventEmitter {}
const mainEventLoop = new EventLoop();

var insertAmount = 0;


// replace these
var testcoll;
var mdb;

// Provide a mapping for the event-loop's event-function associations; look at the function to know what to send it
eventLoopFunctions = {
	// Use this one to GET the page
	//'page'		: getLinks,			// Get the links of the opportunity off the page
	
	// Use the one to insert 
	//'save'		: databaseSave,		// Save the scraped information in the database
	//'schedule'	: schedule,			// abstract function to schedule a function at a certain time
	//'newOppo'		: newOppo
	//'client': client
	'connected': connected,
	'success': success,
	'insert': insert,
	'close': close
};


// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, (packet) => {
    	eventLoopFunctions[item](packet);
    });
  });
})();


function res(dater) {
	console.log(dater);
}


function rej(dater) {
	console.log(dater);
}


// Might be able to make this more general with a signature/ID that tells the event loop what it is
function resolve(promise, res, rej) {
	console.log();

	Promise.resolve(promise)
		.then((data) => {
			if(res)
				res(data);
			else
				mainEventLoop.emit('success', { data: data });
		})
		.catch((err) => {
			if(rej)
				rej(err);
			else
				mainEventLoop.emit('error', { data: err });
		});
}


function close() {
	console.log('closing...')
	mdb.close();
}



// Put testcoll here for now, but make an object later
function insert(data) {
	insertAmount++;
	resolve(data.collection.insert(data.data));
}


function connected(packet) {
	console.log(packet.mdb);
	mdb = packet.mdb;
	testcoll = packet.mdb.collection('test');
	//resolve(testcoll.findOne({}), (dater) => { console.log(dater); }, (err) => { console.log(err); });
	//resolve(testcoll.findOne({}), (data) => { mainEventLoop.emit('found', { data: data }) }, (err) => { console.log(err); });
	//resolve(testcoll.findOne({}));
	for(var x = 0; x < 100; x++)
		mainEventLoop.emit('insert', { collection: testcoll, data: { name: 'secondtest', data: 'second.test_data' } } );
	
	// might just be able to put the close here
	mainEventLoop.emit('close');

}

function success(packet) {
	console.log(packet);
	insertAmount--;

	//if(!insertAmount)
	//	mainEventLoop.emit('close');
}

