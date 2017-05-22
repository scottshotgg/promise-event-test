var MongoClient = require('mongodb').MongoClient;


(function connectMongoDB() {
  // Connect to the db    
  MongoClient.connect("mongodb://localhost:27017/test", function(err, mdb) {
	if(!err) {
		mainEventLoop.emit('connected', {mdb: mdb});

    } else {
      console.log(err);
      process.exit(1);
    }
  });
})();


function resolve(promise) {
	Promise.resolve(promise)
		.then((data) => {
			mainEventLoop.emit('found', {data: data});
		})
		.catch((err) => {
			console.log(err);
		});
}


function connected(packet) {
	console.log(packet);
	var testcoll = packet.mdb.collection('test');
	console.log()
	resolve(testcoll.findOne({}));
}

function found(packet) {
	console.log(packet.data);
}


// Using the event-loop for the software architecture
const EventEmitter = require('events');
class EventLoop extends EventEmitter {}
const mainEventLoop = new EventLoop();

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
	'found': found

};

// Function to seperate event-loop's event-function association loading from main
(function loadEventLoopFunction() {
  Object.keys(eventLoopFunctions).map((item, index) => {
    mainEventLoop.on(item, (packet) => {
    	eventLoopFunctions[item](packet);
    });
  });
})();