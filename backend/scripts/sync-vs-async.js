console.log('🔄 Start of script');

const fs = require('fs').promises;

// Synchronous blocking task
function blockingTask() {
    console.log('🛑 Sync: Blocking operation starts');
    const start = Date.now();
    while (Date.now() - start < 2000) {} // Artificial delay of 2s
    console.log('✅ Sync: Blocking operation ends');
}

// Asynchronous non-blocking task
async function nonBlockingTask() {
    console.log('⏳ Async: Started file operation');
    await fs.writeFile('test.txt', 'Hello from async!');
    console.log('📄 Async: File written successfully');
}

// Asynchronous setTimeout
setTimeout(() => console.log('⏰ Timeout executed'), 1000);

blockingTask();
nonBlockingTask();

console.log('🛠 Script is still running...');
